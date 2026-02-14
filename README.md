# Memory Alpha MCP Server

An MCP (Model Context Protocol) server that brings Star Trek knowledge from [Memory Alpha](https://memory-alpha.fandom.com/) into your AI sessions. Search articles, look up episodes, compare starships, take trivia quizzes, and get your code reviewed by Q himself.

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
  tools/                 # 17 MCP tool implementations
  prompts/               # 12 Trek-themed prompt templates
  resources/             # 2 static reference resources
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

## Tools (17)

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
Look up phrases and vocabulary from Star Trek alien languages.

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

## Prompts (12)

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

## Resources (2)

| Resource | URI | Description |
|----------|-----|-------------|
| Series Reference | `trek://series` | All Trek series (TOS through SNW) with years, seasons, setting, ship, and captain |
| Glossary | `trek://glossary` | Key Star Trek terminology: warp drive, phaser, transporter, tricorder, etc. |

These are static reference resources with original descriptions (not Memory Alpha content), available for context without making API calls.

## Examples

```
"Search Memory Alpha for Borg"
"Tell me about the episode 'The Best of Both Worlds'"
"What are the specs of the USS Defiant?"
"Give me a random Star Trek trivia question"
"Check if giving warp technology to a pre-warp civilization violates the Prime Directive"
"What's my red shirt survival odds for exploring an unknown cave alone?"
"Look up Ferengi Rule of Acquisition #34"
"Compare the USS Enterprise-D with the USS Voyager"
"What happened in Star Trek on February 14?"
"Look up Klingon phrases"
"Explain microservices like Spock would"
"Review my code as Q"
```

## Development

```bash
git clone https://github.com/yourusername/memory-alpha-mcp.git
cd memory-alpha-mcp
npm install
npm run build   # Compile TypeScript
npm run dev     # Run with tsx (hot reload)
npm test        # Run test suite (56 tests)
```

### Testing

The project includes 56 unit tests across 7 test files using [vitest](https://vitest.dev/):

| Test File | Coverage |
|-----------|----------|
| `tests/text.test.ts` | Text utilities: truncation, HTML stripping, wikitext cleaning, template stripping, key formatting, table cell escaping |
| `tests/cache.test.ts` | TTL cache: get/set, expiry, LRU eviction |
| `tests/infobox.test.ts` | Sidebar/infobox extraction: typed templates, nested templates, multi-word types |
| `tests/sections.test.ts` | Section extraction, intro extraction, heading listing |
| `tests/shuffle.test.ts` | Fisher-Yates shuffle: correctness, element preservation, distribution |
| `tests/client.test.ts` | Rate limiter: request serialization, interval enforcement |
| `tests/rules-parsing.test.ts` | Rules of Acquisition regex patterns: all format variants, deduplication, sorting |

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
- The two static resources (`trek://series` and `trek://glossary`) contain original reference descriptions, not Memory Alpha content
- No copyrighted material is embedded in the source code or package -- all wiki content is fetched live from the API and attributed at the point of display

This approach satisfies CC-BY-SA requirements by providing attribution with every piece of content served, linking to the source, and identifying the license. The project acts as an API client, not a content host.
