## Project Overview

Memory Alpha MCP is a TypeScript/ESM MCP server that provides Star Trek knowledge from the Memory Alpha MediaWiki API. It parses wikitext at runtime and exposes it through MCP tools, prompts, and resources. The server communicates over stdio — treat transport safety as a core constraint.

Primary stack: Node.js 18+, TypeScript (NodeNext ESM), `@modelcontextprotocol/sdk`, `wtf_wikipedia`, `zod`, `vitest`, `@vitest/coverage-v8`.

## Repository Map

- `src/index.ts` — MCP server bootstrap, stdio transport, graceful shutdown, tool/prompt/resource registration
- `src/api/client.ts` — owns all HTTP: rate limiting (~5 req/s), 10s timeout, 1 retry, in-memory caching
- `src/api/` — MediaWiki API helpers (search, article, categories, episodes, random)
- `src/parser/wikitext.ts` — primary wikitext-to-text pipeline; disambiguation detection
- `src/parser/infobox.ts` — infobox/sidebar extraction; fallback for nested `{{sidebar ...}}` templates
- `src/parser/sections.ts` — section extraction
- `src/tools/` — 26 MCP tools: alien-phrases, article, away-team, battle-simulator, categories, character, compare, crew-manifest, episode, episode-recommender, holodeck, list-episodes, on-this-day, prime-directive, random, red-shirt, rules-of-acquisition, search, species, stardate, starship, timeline, trivia, who-said-it, + more
- `src/prompts/index.ts` — Trek-themed MCP prompt registrations
- `src/resources/index.ts` — static MCP resources under `trek://...` URIs
- `src/utils/attribution.ts` — `withAttribution()` wrapper
- `src/utils/logger.ts` — safe logging via `console.error`
- `src/utils/cache.ts`, `shuffle.ts`, `text.ts` — shared helpers
- `tests/` — Vitest unit tests

## Commands

Run from the repository root:

```sh
npm install          # install dependencies
npm run build        # tsc compile src/ → dist/
npm run dev          # run server with tsx src/index.ts
npm test             # run vitest suite
npx @modelcontextprotocol/inspector node dist/index.js  # interactive MCP inspector
```

## Non-Negotiable Rules

1. **Never use `console.log`** — corrupts the stdio MCP transport. Use `console.error` via `src/utils/logger.ts`.
2. **Attribution on all wiki responses** — every successful tool response with Memory Alpha content must call `withAttribution()` from `src/utils/attribution.ts`. Error responses with no wiki content must NOT add attribution.
3. **Bounded zod schemas** — every user-supplied string parameter needs a `.max(...)` limit.
4. **NodeNext ESM imports** — relative TypeScript imports must use `.js` extensions (e.g. `import { foo } from './bar.js'`).
5. **No embedded content** — never copy Memory Alpha article text into source files; always fetch dynamically.
6. **`wtf_wikipedia` quirk** — call `.text({})` not `.text()` on sections and documents.
7. **Use `src/api/client.ts` for HTTP** — do not bypass rate limiting, retry, and caching.

## Tool Authoring Pattern

When adding or changing a tool:

1. Create or update the file in `src/tools/`.
2. Export a `register...Tool(server: McpServer): void` function.
3. Define the input schema with `zod`; add `.max(...)` to all string fields.
4. Return `{ content: [{ type: 'text', text }] }`.
5. Format output for LLM readability (structured markdown/text, not raw JSON).
6. Use helpers from `src/api/`, `src/parser/`, and `src/utils/` before writing new logic.
7. Wrap successful wiki-based output with `withAttribution()`.
8. Register the tool in `src/index.ts`.
9. Add tests in `tests/` for any non-trivial parsing, scoring, or formatting behavior.
10. Update `README.md`; keep `AGENTS.md` and `CLAUDE.md` counts/descriptions in sync.

## Parsing and API Constraints

- `src/parser/infobox.ts` fallback logic handles nested `{{sidebar ...}}` — do not simplify it.
- Disambiguation detection is intentional in several tools — do not remove retry/fallback logic.
- Do not bypass `src/api/client.ts` with custom fetch logic.

## Testing Guidance

- Prefer focused unit tests in `tests/*.test.ts`.
- Keep deterministic helpers (stardates, shuffles, scores) stable for test predictability.
- Test helper logic in isolation rather than relying on live API calls.
- Test areas already covered: text cleanup, sections, sidebars, disambiguation, episodes, cache, stardate, wikitext-parser.
- TypeScript build covers `src/**/*` only; tests run via Vitest (not `tsc`).

## Safe vs. Risky Change Areas

Usually safe:
- New tools following the registration and attribution patterns above
- New parser/unit tests
- Text formatting improvements that preserve attribution and stdio safety
- New prompts or static resources that do not copy licensed wiki text

Extra care required:
- `src/api/client.ts` (rate limiting, caching)
- `src/parser/wikitext.ts` and `src/parser/infobox.ts`
- `src/index.ts` (registration, stdio transport)
- Any code that writes to stdout

## Practical Checklist

Before finishing any change:
- `npm run build` passes
- `npm test` passes
- New/changed tools are registered in `src/index.ts`
- Successful wiki responses use `withAttribution()`
- No `console.log` introduced
- `README.md`, `AGENTS.md`, and `CLAUDE.md` are consistent with the implementation

---

## Azure Pipelines YAML Authoring

This repository is a thin consumer of the shared template library at `SandboxServers/Azure-Pipeline-YAML` (resource alias `pipelinePatterns`).

### Error checking

After editing `azure-pipelines.yml` or any file under `pipeline/variables/`, always call `get_errors` on the modified file. The Azure Pipelines LSP is active on all pipeline files. Treat any LSP errors as blocking.

### Pipeline conventions

- `azure-pipelines.yml` is intentionally thin — triggers, PR config, parameters, variables, resources, and `extends` only; no inline steps or jobs
- All build/test/package/security/release logic lives in the shared template
- Queue-time parameters use `type: stringList` for multi-select (e.g. `environments`) or `type: boolean`/`type: string` for single values; the shared template receives `stringList` as `type: object`
- New queue-time parameters must be declared in `parameters:` AND passed through in `extends.parameters:`
- Variable files under `pipeline/variables/` are loaded by shared template jobs via `globalVariableTemplatePath` and `buildVariableTemplatePath` — not by the root pipeline
