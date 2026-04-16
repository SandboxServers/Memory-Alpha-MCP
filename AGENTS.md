# AGENTS.md

## Project Overview

Memory Alpha MCP is a TypeScript/ESM MCP server for Star Trek knowledge. It fetches live data from the Memory Alpha MediaWiki API, parses wikitext into structured text, and exposes that data through MCP tools, prompts, and resources.

Primary stack:
- Node.js 18+
- TypeScript with `module`/`moduleResolution` set to `NodeNext`
- `@modelcontextprotocol/sdk`
- `wtf_wikipedia`
- `zod`
- `vitest`

The server runs over stdio, so output discipline matters.

## Repository Map

- `src/index.ts`: server bootstrap, stdio transport, shutdown handling, and registration of all tools/prompts/resources.
- `src/api/`: MediaWiki API client helpers for search, article parsing, categories, episodes, and random lookup.
- `src/parser/`: wikitext parsing, infobox/sidebar extraction, and section extraction.
- `src/tools/`: MCP tool implementations. Each file exports a `register...Tool(server)` function.
- `src/prompts/index.ts`: Trek-themed MCP prompt registrations.
- `src/resources/index.ts`: static MCP resources under `trek://...` URIs.
- `src/utils/`: shared utilities for logging, attribution, text cleanup, cache, and shuffle helpers.
- `tests/`: Vitest unit tests for parser logic, utilities, and deterministic tool helpers.

## Commands

Run from the repository root.

- `npm install`: install dependencies.
- `npm run build`: compile `src/` to `dist/` with `tsc`.
- `npm run dev`: run the server directly with `tsx src/index.ts`.
- `npm test`: run the Vitest suite.
- `npx @modelcontextprotocol/inspector node dist/index.js`: inspect the built MCP server interactively.

## Non-Negotiable Rules

1. Never use `console.log`.
   `console.log` can corrupt the stdio MCP transport. Use `console.error` via `src/utils/logger.ts` for diagnostics.

2. Add attribution to successful Memory Alpha content.
   Any successful response that includes wiki-derived content must go through `withAttribution()` from `src/utils/attribution.ts`.
   Plain error responses that contain no wiki content should not add attribution.

3. Bound string inputs in tool schemas.
   Tool parameters use `zod`. Every user-provided string should have a `.max(...)` limit, following existing tool patterns.

4. Preserve ESM import style.
   This repo uses NodeNext ESM. Relative imports in TypeScript should include the `.js` extension in import paths.

5. Keep content dynamic.
   Do not embed Memory Alpha article content into source files. This project is an API client, not a content mirror.

## Parsing and API Constraints

- Prefer going through `src/api/client.ts` for HTTP requests so rate limiting, timeout, retry, and cache behavior stay consistent.
- The API client currently enforces about 5 requests per second, a 10 second timeout, one retry, and in-memory caching. Do not bypass this casually.
- `wtf_wikipedia` calls should use `.text({})`, not `.text()`, to avoid parser quirks already documented in the repo.
- The infobox/sidebar fallback logic in `src/parser/infobox.ts` exists because Memory Alpha uses nested `{{sidebar ...}}` templates that simple regex parsing cannot handle. Be careful when changing it.
- Disambiguation handling matters. Several tools intentionally detect or retry disambiguation cases before falling back to a choice list.

## Tool Authoring Pattern

When adding or changing a tool:

1. Create or update the file in `src/tools/`.
2. Export a `register...Tool(server: McpServer): void` function.
3. Define the schema with `zod` and sensible bounds/defaults.
4. Return MCP text content in the existing `{ content: [{ type: 'text', text }] }` shape.
5. Format output for LLM readability; prefer structured markdown/text over raw JSON dumps.
6. Use shared helpers from `src/api/`, `src/parser/`, and `src/utils/` rather than re-implementing fetch/parsing logic.
7. Wrap successful wiki-based output with `withAttribution()`.
8. Register the tool in `src/index.ts`.
9. Add or update tests in `tests/` for any non-trivial parsing, scoring, or formatting behavior.
10. Update `README.md` if the public surface area changes.

## Prompts and Resources

- Register all prompts in `src/prompts/index.ts` and resources in `src/resources/index.ts`.
- Resources should remain original reference material, not copied Memory Alpha content.
- If you change counts or names of tools, prompts, or resources, keep `README.md`, `CLAUDE.md`, and this file in sync.

## Testing Guidance

- Prefer focused unit tests in `tests/*.test.ts`.
- Keep parsing and scoring helpers deterministic where possible so tests stay stable.
- The TypeScript build only includes `src/**/*`; tests are exercised by Vitest, not by `tsc`.
- For network-dependent behavior, test helper logic in isolation rather than relying on live API calls.

## Safe Change Areas

Usually safe:
- New tools that follow existing registration and attribution patterns.
- Additional parser/unit tests.
- Improvements to text cleanup and formatting that preserve attribution and stdio safety.
- New prompts or static resources that do not copy licensed wiki text.

Use extra care:
- `src/api/client.ts`
- `src/parser/wikitext.ts`
- `src/parser/infobox.ts`
- `src/index.ts`
- Anything that changes how stdio output is emitted

## Practical Checklist

Before finishing work, verify the following when relevant:

- `npm run build` succeeds.
- `npm test` passes.
- New or changed tools are registered in `src/index.ts`.
- Successful wiki-derived responses still include attribution.
- No `console.log` calls were introduced.
- Public docs stay aligned with the implementation.
