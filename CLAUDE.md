# Memory Alpha MCP Server

## Project Context

MCP server providing Star Trek knowledge from Memory Alpha's wiki API. TypeScript, ESM, Node 18+.

Primary libraries and runtime conventions:
- `@modelcontextprotocol/sdk` for MCP server/tool/prompt/resource registration
- `wtf_wikipedia` for primary wikitext parsing
- `zod` for tool schemas and input validation
- `vitest` for unit tests
- NodeNext ESM import style with explicit `.js` extensions on relative imports

The server runs over stdio and fetches Memory Alpha content dynamically at runtime. Treat transport safety and attribution as core requirements, not optional polish.

## Commands

Run from the repository root:

- `npm install`
- `npm run build`
- `npm run dev`
- `npm test`
- `npx @modelcontextprotocol/inspector node dist/index.js`

## Non-Negotiable Rules

- Never use `console.log` because it can corrupt the stdio MCP transport. Use `console.error` via `src/utils/logger.ts`.
- All successful tool responses that include Memory Alpha content must use `withAttribution()` from `src/utils/attribution.ts`.
- Error responses that contain no wiki content should not add attribution.
- All string tool parameters need `.max(...)` bounds in their `zod` schema.
- Keep content dynamic. Do not embed Memory Alpha article text into the repository.
- Preserve NodeNext ESM imports with `.js` extensions on relative paths.
- `wtf_wikipedia` quirk: call `section.text({})` and `doc.text({})`, not `.text()`.

## Architecture Notes

- `src/index.ts` wires up the MCP server, stdio transport, graceful shutdown, and registration of tools/prompts/resources.
- `src/api/client.ts` owns fetch behavior: rate limiting, timeout, retry, and in-memory caching. Reuse it instead of rolling custom HTTP logic.
- `src/parser/wikitext.ts` and `src/parser/infobox.ts` contain the parsing edge cases for disambiguation handling and nested sidebar templates.
- `src/resources/index.ts` contains original static reference material. Keep those resources original rather than copied wiki content.

## Change Patterns

When adding or updating a tool:
- Implement it in `src/tools/` as a `register...Tool(server)` function.
- Use existing helpers from `src/api/`, `src/parser/`, and `src/utils/` before adding new logic.
- Return MCP text content in the existing `{ content: [{ type: 'text', text }] }` shape.
- Register the tool in `src/index.ts`.
- Add or update tests for non-trivial parsing, scoring, or formatting behavior.
- Update `README.md`, `AGENTS.md`, and any counts/descriptions if the public surface changes.

## Testing Focus

Prefer focused unit tests in `tests/*.test.ts`.

Important coverage areas already present in the repo:
- Text cleanup and template handling
- Parser behavior for sections, sidebars, and disambiguation pages
- Episode season-table parsing
- Cache and rate-limiter behavior
- Deterministic helper logic for stardates and the fun tools
