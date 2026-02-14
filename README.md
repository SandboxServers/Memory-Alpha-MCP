# Memory Alpha MCP Server

An MCP (Model Context Protocol) server that brings Star Trek knowledge from [Memory Alpha](https://memory-alpha.fandom.com/) into your AI sessions. Search articles, look up episodes, compare starships, take trivia quizzes, and get your code reviewed by Q himself.

> **Disclaimer:** This is an unofficial fan project. Not affiliated with CBS, Paramount, or Memory Alpha. All content is dynamically fetched from Memory Alpha's public API (CC-BY-SA licensed).

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

### Manual

```bash
npm install -g memory-alpha-mcp
memory-alpha-mcp
```

## Requirements

- Node.js 18+

## Tools (17)

### Core Tools
| Tool | Description |
|------|-------------|
| `search_memory_alpha` | Search Memory Alpha for any Star Trek topic |
| `get_article` | Get a full or partial article with infobox data |
| `get_random_article` | Discover random Star Trek articles |
| `browse_categories` | Browse articles by category |

### Domain Tools
| Tool | Description |
|------|-------------|
| `get_episode` | Episode details: synopsis, writer, director, stardate |
| `get_starship` | Ship specs: class, registry, armaments, crew |
| `species_info` | Species profile: homeworld, physiology, culture |
| `get_timeline` | Events for a specific in-universe year |
| `on_this_day` | Trek events and air dates for today's date |
| `crew_manifest` | Crew roster for a ship or station |
| `rules_of_acquisition` | Ferengi Rules of Acquisition lookup |

### Fun Tools
| Tool | Description |
|------|-------------|
| `compare` | Side-by-side comparison of two subjects |
| `trivia_quiz` | Multiple-choice trivia from random articles |
| `who_said_it` | Quote attribution challenge |
| `alien_phrases` | Alien language phrases and vocabulary |
| `prime_directive_check` | Humorous Prime Directive violation assessment |
| `red_shirt_analysis` | Away mission survival odds analysis |

## Prompts (12)

| Prompt | Description |
|--------|-------------|
| `explain_like_spock` | Vulcan logic explanation |
| `star_trek_analogy` | Explain concepts via Trek analogies |
| `captains_log` | Format as a Captain's Log entry |
| `technobabble` | Transform into Trek technobabble |
| `engage` | Picard-style plan summary |
| `make_it_so` | Picard plan confirmation |
| `fascinating` | Spock analytical deep-dive |
| `dammit_jim` | McCoy scope-creep objection |
| `resistance_is_futile` | Borg efficiency optimization |
| `kobayashi_maru` | No-win scenario analysis |
| `live_long_and_prosper` | Vulcan session wrap-up |
| `qs_judgment` | Q's omnipotent code roast |

## Resources (2)

| Resource | URI | Description |
|----------|-----|-------------|
| Series Reference | `trek://series` | All Trek series with details |
| Glossary | `trek://glossary` | Key Trek terminology |

## Examples

```
"Search Memory Alpha for Borg"
"Tell me about the episode 'The Best of Both Worlds'"
"What are the specs of the USS Defiant?"
"Give me a random Star Trek trivia question"
"Check if giving warp technology to a pre-warp civilization violates the Prime Directive"
"What's my red shirt survival odds for exploring an unknown cave alone?"
"Look up Ferengi Rule of Acquisition #34"
"Explain microservices like Spock would"
"Review my code as Q"
```

## Development

```bash
git clone https://github.com/memory-alpha-mcp/memory-alpha-mcp.git
cd memory-alpha-mcp
npm install
npm run dev     # Run with tsx
npm run build   # Compile TypeScript
```

Test with MCP Inspector:
```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## License

MIT

## Attribution

Star Trek content is dynamically fetched from [Memory Alpha](https://memory-alpha.fandom.com/), which is licensed under [CC-BY-SA](https://creativecommons.org/licenses/by-sa/3.0/). This project does not embed or redistribute copyrighted content.
