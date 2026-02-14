# Memory Alpha MCP Server

An MCP (Model Context Protocol) server that brings Star Trek knowledge from [Memory Alpha](https://memory-alpha.fandom.com/) into your AI sessions. Search articles, look up episodes, compare starships, simulate battles, build away teams, take trivia quizzes, and get your code reviewed by Q himself.

> **Disclaimer:** This is an unofficial fan project. Not affiliated with CBS, Paramount, or Memory Alpha. All content is dynamically fetched from Memory Alpha's public API (CC-BY-SA licensed). No copyrighted material is embedded or redistributed.

## Installation

### Claude Desktop

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "memory-alpha": {
      "command": "npx",
      "args": ["-y", "memory-alpha-mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add memory-alpha -- npx -y memory-alpha-mcp
```

### Manual

```bash
npm install -g memory-alpha-mcp
memory-alpha-mcp
```

## Requirements

- Node.js 18+ (uses built-in `fetch`)

## How It Works

The server dynamically fetches content from Memory Alpha's public [MediaWiki API](https://memory-alpha.fandom.com/api.php) (no authentication required). Raw wikitext is parsed into clean structured data using [wtf_wikipedia](https://github.com/spencermountain/wtf_wikipedia), with custom regex fallbacks for Memory Alpha's `{{sidebar ...}}` templates.

### Architecture

```
src/
  index.ts              # Entry point: MCP server + stdio transport + graceful shutdown
  api/                   # MediaWiki API client layer
    client.ts            #   HTTP client with rate limiting (5 req/s), retry, 10s timeout, caching
    parse.ts             #   action=parse (wikitext retrieval)
    search.ts            #   action=query&list=search
    categories.ts        #   action=query&list=categorymembers
    random.ts            #   action=query&list=random
    types.ts             #   TypeScript interfaces for API responses
  parser/                # Wikitext parsing pipeline
    wikitext.ts          #   Main parser: wtf_wikipedia wrapper, disambiguation detection
    infobox.ts           #   Brace-balanced sidebar/infobox extraction with regex fallback
    sections.ts          #   Section extraction by heading
  tools/                 # 24 MCP tool implementations
  prompts/               # 16 Trek-themed prompt templates
  resources/             # 4 static reference resources
  utils/
    cache.ts             #   In-memory TTL cache with LRU eviction (5min TTL, 100 entries)
    logger.ts            #   console.error wrapper (never console.log - corrupts stdio)
    text.ts              #   Wikitext cleaning, HTML stripping, truncation, template stripping
    attribution.ts       #   CC-BY-SA attribution footer appended to all responses
    shuffle.ts           #   Fisher-Yates shuffle
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Dynamic API fetch only | Legal safety: we're an API client, not a content host |
| `wtf_wikipedia` for parsing | Best-in-class wikitext parser with zero transitive dependencies |
| Brace-balanced template matching | Memory Alpha's `{{sidebar}}` templates nest, breaking naive regex |
| In-memory cache (not disk) | Simple, no extra dependencies, sufficient for session-length usage |
| `console.error` only | `console.log` corrupts the stdio MCP transport |
| All responses as formatted text | Better for LLM consumption than raw JSON |

## Tools (24)

### Core Tools

#### `search_memory_alpha`
Search Memory Alpha for Star Trek articles, characters, ships, episodes, and more.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | yes | Search query (e.g. "Jean-Luc Picard", "USS Enterprise") |
| `limit` | number (1-20) | no | Max results to return (default: 10) |

#### `get_article`
Get a full or partial article from Memory Alpha. Use exact article titles for best results.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | yes | Article title (e.g. "James T. Kirk", "Warp drive") |
| `section` | string | no | Specific section heading (e.g. "Background information") |
| `summary_only` | boolean | no | Return only the intro summary (default: false) |

Automatically detects disambiguation pages and returns a list of available articles instead.

#### `get_random_article`
Get random Star Trek articles from Memory Alpha.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `count` | number (1-5) | no | Number of random articles (default: 1) |

#### `browse_categories`
Browse Memory Alpha articles by category.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | yes | Category name (e.g. "Federation starships", "Vulcans") |
| `limit` | number (1-50) | no | Max articles to list (default: 20) |

### Domain Tools

#### `get_episode`
Get details about a Star Trek episode: synopsis, writer, director, stardate, guest cast. Look up by title or by series + season + episode number.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | no | Episode title (e.g. "The Best of Both Worlds") |
| `series` | string | no | Series abbreviation (TOS, TNG, DS9, VOY, ENT, DIS, PIC, LD, PRO, SNW) |
| `season` | number | no | Season number |
| `episode` | number | no | Episode number within the season |

Provide either `title` or all three of `series` + `season` + `episode`.

#### `list_episodes`
List all episodes for a Star Trek series season.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `series` | string | yes | Series abbreviation (TOS, TNG, DS9, VOY, ENT, DIS, PIC, LD, PRO, SNW) |
| `season` | number (1-10) | yes | Season number |

#### `get_starship`
Get details about a Star Trek starship: class, registry, armaments, crew complement.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | yes | Ship name (e.g. "USS Enterprise (NCC-1701-D)", "USS Defiant") |

#### `species_info`
Get info about a Star Trek species: homeworld, physiology, culture, quadrant.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `species` | string | yes | Species name (e.g. "Klingon", "Vulcan", "Borg", "Ferengi") |

#### `character_lookup`
Get details about a Star Trek character: rank, species, affiliation, biography, career history, and memorable quotes.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | yes | Character name (e.g. "Jean-Luc Picard", "Worf", "Seven of Nine") |

Extracts sidebar data from individual/character/personnel templates. Automatically detects disambiguation pages.

#### `get_timeline`
Get Star Trek events for a specific in-universe year.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | string | yes | Year or era (e.g. "2364", "22nd century", "2150s") |

#### `on_this_day`
Get Star Trek events, air dates, and birthdays for a specific date.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | no | Date in "Month Day" format (e.g. "February 14"). Defaults to today. |

#### `crew_manifest`
Get the crew roster for a Star Trek starship or station.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ship` | string | yes | Ship or station name (e.g. "USS Enterprise (NCC-1701-D)", "Deep Space 9") |

#### `rules_of_acquisition`
Look up Ferengi Rules of Acquisition by number, randomly, or search by keyword. Rules are dynamically parsed from Memory Alpha's article.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rule_number` | number | no | Specific rule number to look up |
| `random` | boolean | no | Get a random Rule of Acquisition (default: false) |
| `search` | string | no | Search rules by keyword |

#### `stardate_converter`
Convert between stardates and real-world dates, or get the current stardate. Supports both TOS-era and TNG-era conversion formulas.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | no | Real-world date to convert (e.g. "2026-02-14", "March 5 1987"). Defaults to today. |
| `stardate` | number | no | Stardate to convert to a real-world date (e.g. 41153.7) |
| `era` | "TOS" \| "TNG" | no | Era for conversion formula (default: "TNG") |

Provide either `date` or `stardate`. If neither is given, converts today's date.

### Fun Tools

#### `compare`
Compare two Star Trek subjects side-by-side with infobox data in a markdown table.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `subject1` | string | yes | First subject (e.g. "USS Enterprise (NCC-1701-D)") |
| `subject2` | string | yes | Second subject (e.g. "USS Voyager") |

#### `trivia_quiz`
Generate a Star Trek trivia question from random Memory Alpha facts.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `difficulty` | "easy" \| "medium" \| "hard" | no | Difficulty level (default: "medium") |

#### `who_said_it`
Quote attribution challenge - guess which Star Trek character said it.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `difficulty` | "easy" \| "medium" \| "hard" | no | Difficulty level (default: "medium") |

#### `alien_phrases`
Look up phrases and vocabulary from Star Trek alien languages. Extracts structured vocabulary sections (Common phrases, Vocabulary, Lexicon, etc.) when available, falling back to full article text.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `language` | string | yes | Alien language (e.g. "Klingon", "Vulcan", "Ferengi", "Romulan") |

Supports Klingon, Vulcan, Ferengi, Romulan, Bajoran, Cardassian, and Dominion with known article mappings. Other languages are searched dynamically.

#### `prime_directive_check`
Evaluate whether an action violates the Prime Directive, with a humorous Starfleet assessment.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | yes | The action to evaluate (e.g. "Giving warp technology to a pre-warp civilization") |

Returns a violation probability, threat level, historical precedent, and context from the Prime Directive article.

#### `red_shirt_analysis`
Assess survival odds in classic Trek redshirt style.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `description` | string | yes | Describe the mission or situation (e.g. "Exploring an uncharted planet with strange energy readings") |

Analyzes keywords in the description to compute survival probability, risk factors, probable cause of demise, and recommended last words.

#### `battle_simulator`
Pit two Star Trek ships against each other in a tactical analysis based on their specs. Fetches real ship data from Memory Alpha, compares combat-relevant specifications, and generates a battle narrative.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ship1` | string | yes | First ship (e.g. "USS Enterprise (NCC-1701-D)") |
| `ship2` | string | yes | Second ship (e.g. "Borg cube") |

Returns a spec comparison table, combat probability percentages, predicted victor, and a dramatic battle narrative.

#### `away_team_builder`
Recommend an optimal away team composition for a mission based on crew specialties. Analyzes mission keywords to determine needed roles, selects from a crew database, and assesses mission risk.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mission` | string | yes | Describe the mission (e.g. "Negotiate peace treaty with hostile species on a volcanic planet") |
| `team_size` | number (2-6) | no | Number of team members (default: 4) |

Returns recommended crew, mission analysis, required equipment, and risk assessment.

#### `episode_recommender`
Get episode recommendations based on a Star Trek episode you enjoyed. Analyzes the source episode's themes and categories to find related episodes.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `episode` | string | yes | Episode title you liked (e.g. "The Inner Light", "In the Pale Moonlight") |
| `count` | number (1-10) | no | Number of recommendations (default: 5) |

#### `holodeck_program`
Generate a Star Trek holodeck program designation, safety assessment, and malfunction probability. Analyzes the scenario to determine classification, complexity, and risks.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `scenario` | string | yes | Describe the desired holodeck scenario (e.g. "A noir detective mystery in 1940s San Francisco") |
| `safety_protocols` | boolean | no | Whether safety protocols are enabled (default: true) |

Returns program designation, classification, malfunction probability, environmental parameters, safety assessment, and known risks.

## Prompts (16)

| Prompt | Parameters | Description |
|--------|------------|-------------|
| `explain_like_spock` | `topic` | Explain a topic with Vulcan logic and emotional detachment |
| `star_trek_analogy` | `concept` | Explain a coding/tech concept using Star Trek analogies |
| `captains_log` | `summary`, `stardate?` | Format a summary as a Captain's Log entry (auto-generates stardate if omitted) |
| `technobabble` | `explanation` | Transform a technical explanation into Star Trek technobabble |
| `engage` | `plan` | Summarize a plan with Picard's decisive authority. Ends with "Engage." |
| `make_it_so` | `plan` | Confirm a plan with Picard's commanding authority. Ends with "Make it so." |
| `fascinating` | `topic` | Perform a Spock-style analytical deep-dive |
| `dammit_jim` | `task`, `role` | McCoy-style scope creep objection: "I'm a {role}, not a..." |
| `resistance_is_futile` | `process` | Borg-style efficiency optimization of a process |
| `kobayashi_maru` | `scenario` | Analyze a no-win scenario and find creative Kirk-style solutions |
| `live_long_and_prosper` | `session_summary` | Vulcan salute session wrap-up with logical assessment |
| `qs_judgment` | `code` | Q's omnipotent, theatrically condescending roast of your code |
| `scotty` | `task`, `actual_estimate?` | Scotty-style engineering time estimate (multiply everything by 4 to look like a miracle worker) |
| `guinan` | `situation` | Guinan-style wise bartender advice — cryptic but exactly what you needed |
| `worf` | `situation` | Worf-style security assessment and tactical recommendation |
| `counselor_troi` | `subject` | Counselor Troi empathic analysis — sense the feelings in your code or situation |

## Resources (4)

| Resource | URI | Description |
|----------|-----|-------------|
| Series Reference | `trek://series` | All Trek series (TOS through SNW) with years, seasons, setting, ship, and captain |
| Glossary | `trek://glossary` | Key Star Trek terminology: warp drive, phaser, transporter, tricorder, etc. |
| Technobabble | `trek://technobabble` | Particles, fields, phenomena, engineering actions, and systems for generating authentic technobabble |
| Starship Classes | `trek://starship-classes` | Ship classes by faction (Federation, Klingon, Romulan, Cardassian, Borg, Dominion) with era, role, and notable vessels |

These are static reference resources with original descriptions (not Memory Alpha content), available for context without making API calls.

## Examples

```
"Search Memory Alpha for Borg"
"Tell me about the episode 'The Best of Both Worlds'"
"List all episodes of TNG Season 3"
"What are the specs of the USS Defiant?"
"Look up Jean-Luc Picard's character profile"
"Give me a random Star Trek trivia question"
"Check if giving warp technology to a pre-warp civilization violates the Prime Directive"
"What's my red shirt survival odds for exploring an unknown cave alone?"
"Look up Ferengi Rule of Acquisition #34"
"Compare the USS Enterprise-D with the USS Voyager"
"Simulate a battle between the Enterprise-D and a Borg cube"
"Build me an away team for a diplomatic mission on a hostile planet"
"Recommend episodes similar to 'The Inner Light'"
"Generate a holodeck program for a 1940s detective noir mystery"
"What's the current stardate?"
"Convert stardate 41153.7 to a real-world date"
"What happened in Star Trek on February 14?"
"Look up Klingon phrases"
"Explain microservices like Spock would"
"Give me Scotty's estimate for migrating a database"
"Assess this situation as Worf would: the build pipeline is failing"
"Review my code as Q"
```

## Development

```bash
git clone https://github.com/yourusername/memory-alpha-mcp.git
cd memory-alpha-mcp
npm install
npm run build   # Compile TypeScript
npm run dev     # Run with tsx (hot reload)
npm test        # Run test suite (82 tests)
```

### Testing

The project includes 82 unit tests across 11 test files using [vitest](https://vitest.dev/):

| Test File | Coverage |
|-----------|----------|
| `tests/text.test.ts` | Text utilities: truncation, HTML stripping, wikitext cleaning, template stripping, key formatting, table cell escaping |
| `tests/cache.test.ts` | TTL cache: get/set, expiry, LRU eviction |
| `tests/infobox.test.ts` | Sidebar/infobox extraction: typed templates, nested templates, multi-word types |
| `tests/sections.test.ts` | Section extraction, intro extraction, heading listing |
| `tests/shuffle.test.ts` | Fisher-Yates shuffle: correctness, element preservation, distribution |
| `tests/client.test.ts` | Rate limiter: request serialization, interval enforcement |
| `tests/rules-parsing.test.ts` | Rules of Acquisition regex patterns: all format variants, deduplication, sorting |
| `tests/stardate.test.ts` | Stardate converter: date-to-stardate, stardate-to-date, TOS/TNG era formulas |
| `tests/battle-simulator.test.ts` | Battle simulator: combat scoring, narrative generation, ship data parsing |
| `tests/away-team.test.ts` | Away team builder: role analysis, team selection, mission risk assessment |
| `tests/holodeck.test.ts` | Holodeck program: designation generation, classification, malfunction probability, safety assessment |

### MCP Inspector

Test tools interactively:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## Attribution & Licensing

### This project (MIT)

The server code itself is licensed under the [MIT License](LICENSE).

### Memory Alpha content (CC-BY-SA)

All Star Trek content is dynamically fetched at runtime from [Memory Alpha's public MediaWiki API](https://memory-alpha.fandom.com/api.php). Memory Alpha content is licensed under [CC-BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).

**How attribution works:**

- Every tool response that includes Memory Alpha content automatically appends an attribution footer via `withAttribution()` in `src/utils/attribution.ts`
- The footer reads: *"Source: Memory Alpha (CC-BY-SA) | Unofficial fan project - not affiliated with CBS/Paramount"*
- Error responses that contain no Memory Alpha content do not include the footer
- The four static resources (`trek://series`, `trek://glossary`, `trek://technobabble`, and `trek://starship-classes`) contain original reference descriptions, not Memory Alpha content
- No copyrighted material is embedded in the source code or package -- all wiki content is fetched live from the API and attributed at the point of display

This approach satisfies CC-BY-SA requirements by providing attribution with every piece of content served, linking to the source, and identifying the license. The project acts as an API client, not a content host.
