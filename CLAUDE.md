# Memory Alpha MCP Server

## Project Context

MCP server providing Star Trek knowledge from Memory Alpha's wiki API. TypeScript, ESM, Node 18+.

- Never use `console.log` — it corrupts the stdio MCP transport. Use `console.error` via `src/utils/logger.ts`.
- `wtf_wikipedia` quirk: `section.text()` and `doc.text()` require an options arg: `.text({})`.
- All successful tool responses must include attribution via `withAttribution()`.
- All string params on tools need `.max()` for input bounds.
