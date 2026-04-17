# Memory-Alpha-MCP — Improvements, New Flavor & Trivia Session Design

## The Trivia Session Problem First (most architectural)

**Root cause:** `trivia_quiz` and `who_said_it` are fully stateless. Every invocation generates a fresh question. When two people are playing in the same Discord channel, Clara has no way to know "Player A is answering Q1" vs "Player B is answering Q1" — she's just responding to two separate LLM turns with no shared context unless her own session/memory system is doing that work.

**The MCP server side of this:**
The MCP server runs over **stdio** — it's one process, launched by Clara per her own lifecycle, not shared across users. It has no concept of a Discord channel ID, user ID, or game session. You *could* add file-based state with a session token, but that's the wrong abstraction layer.

**The right model:**

Clara's gateway already has a **Session Manager** built in. The fix is a two-part API change + better prompting:

1. **Add a `start_trivia_game` tool** that generates a *bundle* of N questions (3–10) all at once, each with a hidden answer token. Returns a `game_id` (just a UUID or short hash). Clara stores `{channelId → game_id, questions[], scores: {}}` in her own session/Palace memory.

2. **Add a `check_trivia_answer` tool** that takes `question_text + correct_answer_token + player_answer` and returns correct/incorrect + flavor text. Stateless on the server side — Clara passes back what she already has.

3. **Better system-prompt guidance** (either in the MCP server's `instructions` or in Clara's config) telling Clara to track scores per-user per-channel in her session state and only call `start_trivia_game` once per game round.

**Why not a remote HTTP MCP server?** You could convert this to an HTTP MCP server (SSE or Streamable HTTP) and keep a real session store on the server side. But that adds infrastructure, cold-start latency, and couples game state to a service you have to keep alive. Clara already has a capable session/memory store — use it. The MCP server should stay a lean data-fetching layer.

---

## A: Code Optimizations

### Bugs worth fixing

1. **`on_this_day` — server timezone** uses `new Date()` server-local time. The tool should accept an optional `timezone` parameter (IANA string) and document the default behavior clearly.

2. **`who_said_it` — quote extraction** does a `line.includes('"')` check which matches reference tags, wikitext artifacts, and template strings. Should filter to lines that contain a matched `"..."` pair (≥20 chars between quotes), not just any line with a `"`.

3. **Rate limiter — no 429 handling** — if Memory Alpha returns 429, the current code throws instead of backing off. Add exponential backoff retry on 429 (easy — same retry path already exists for 5xx, just add the status check).

4. **`red_shirt_analysis` / `prime_directive_check` — keyword double-counting** — "observe a pre-warp civilization" hits both "observe" (low risk −10%) *and* "pre-warp" (+20%), net +10. The simple fix is to cap total contribution per category (cap positive modifiers at +40, negative at −20), or use mutual-exclusion groups.

5. **`trivia_quiz` decoys** — current decoys are raw article titles + placeholder text ("None of the above"), which are obviously wrong to anyone. Better: fetch a 4th/5th random article *from the same category* as the correct article and use their summaries as decoys. One extra API round-trip but dramatically better quiz quality.

6. **`away_team_builder` hardcoded crew** — 11 TNG/DS9/VOY characters. Breaks immersion for Picard S3, SNW, or DIS content. Option A (easy): expand the static list to ~40 characters across all series. Option B (better): fetch crew dynamically from Memory Alpha's ship/station articles via the existing `crew_manifest` tool logic. Recommend Option A for now; Option B requires crew parsing reliability improvements first.

### Performance wins

7. **Batch article body fetches** — `trivia_quiz` and `who_said_it` make multiple article fetches sequentially through the single-queue rate limiter. These could run with limited parallelism (3 concurrent at 5 req/s is still under the rate limit) using `Promise.all` with a concurrency guard.

8. **`rules_of_acquisition` cache TTL** — 5 minutes is oddly short for content that changes maybe once a year. Could be 24h or even per-server-lifetime (restart clears it anyway).

---

## B: New Trek Flavor — Tools, Prompts, Resources

### New Tools (high value)

| Tool | What it does |
|------|-------------|
| `start_trivia_game` | Generates a bundle of N questions (3–10) with answer tokens. Returns `game_id` + full question set. Clara stores this in session; players answer against the live bundle. Solves multi-user tracking. |
| `check_trivia_answer` | Takes `question_text`, `correct_answer_token`, `player_answer`. Returns correct/incorrect + in-character flavor text. Fully stateless on the server side. |
| `diplomatic_scenario` | Given two Trek factions, generate a negotiation scenario with positions, demands, and leverage — useful for roleplay or diplomacy puzzles. |
| `anomaly_of_the_week` | Generate a canonical or procedurally-flavored space anomaly (temporal rift, subspace filament, theta-band radiation, etc.) with effects and resolution options — classic TNG vibes. |
| `mirror_universe` | Describe the mirror universe / parallel timeline version of a character or event fetched from Memory Alpha; flags when Memory Alpha has a dedicated mirror article. |
| `first_contact_assessment` | Given a species name, look it up and assess warp capability, government type, and recommended first contact approach. |
| `temporal_incursion` | Look up a known Trek time-travel event (City on the Edge of Forever, Yesterday's Enterprise, etc.) and describe the paradox + resolution. |

### New Prompts (high value)

| Prompt | Flavor |
|--------|--------|
| `seven_of_nine` | Borg efficiency critique — unsentimental, precise. "Inefficiency is irrelevant. Compliance is optimal." Great for code review / process analysis. |
| `kira_nerys` | Bajoran resistance grit — morally direct, politically sharp, deeply spiritual. Great for ethical dilemmas and hard decisions. |
| `janeway` | Coffee, determination, "There's coffee in that nebula" energy — relentlessly pragmatic about impossible problems. |
| `quark_deal` | Ferengi contract negotiation — reframe any proposal in terms of profit, loss, and hidden clauses. |
| `data_inquiry` | Data's earnest systematic breakdown — lists all relevant subroutines, historical analogues, and probability estimates. |
| `holographic_doctor` | Sarcastic but brilliant medical/technical assessment. "Please state the nature of the medical emergency." |

### Resource additions

| Resource | URI | Content |
|----------|-----|---------|
| Factions | `trek://factions` | Federation, Klingon Empire, Romulan Star Empire, Cardassian Union, Dominion, Borg Collective, Ferengi Alliance — government type, home region, notable treaties, typical diplomatic stance. |
| Prime Directive Cases | `trek://prime-directive-cases` | 10–15 canonical episodes where the Prime Directive was tested, with episode title, the dilemma, and what was decided. Enriches `prime_directive_check` tool. |
| Technology Index | `trek://technology-index` | Key Trek tech (transporters, holodeck, replicator, warp drive, cloaking device) — brief how-it-works, notable failures, and which series introduced it. |

---

## C: Architectural Thoughts on the Server

**Where it adds real value:**
- The retrieval chain is genuinely strong. `search → article → parse wikitext → structured output` is exactly the kind of grounding that prevents Clara from hallucinating ship registries and episode stardates with confidence.
- The prompts are underutilized. Most MCP consumers call tools but ignore prompts. The personality prompts (Q, Worf, Guinan, Scotty) are genuinely useful for making conversations more fun — worth documenting them more prominently in the README.
- The game tools are fun party tricks but suffer from being stateless — the `start_trivia_game` / `check_trivia_answer` refactor would make them actually usable in a structured multi-player context.

**What it isn't:**
- It's not a replacement for Clara's memory — it's a live reference layer. The combination of Palace (episodic, what did we talk about) + Memory Alpha (canonical, what is actually true in Trek lore) is the right architecture. Don't conflate them.
- It's not a session manager. Clara is.

**Longer-term option:** If you ever want to deploy this as a *public* MCP server (so other people's AI setups can use it, not just Clara), convert it to Streamable HTTP transport. The stdio implementation is fine for personal use; HTTP would allow shared hosting and server-side session state if you decide you want that. The `@modelcontextprotocol/sdk` supports it with minimal code changes.

---

## Open Questions for Refinement

- **Away team roster expansion:** Expand static list to ~40 chars across all series (Option A), or build dynamic crew fetch from Memory Alpha (Option B)?
- **Trivia difficulty scaling:** Should "hard" mode target questions from specific article categories (e.g., "Technology", "Unnamed individuals") rather than fully random?
- **`holodeck_program` enrichment:** Currently 100% procedural. Worth fetching actual known holodeck programs from Memory Alpha (Dixon Hill, Fair Haven, Sandrine's, etc.) to remix rather than generate from scratch?
- **Implementation order:** Bug fixes first → new trivia tools → new prompts → new tools → resource additions? Or prioritize differently?
