import { z } from 'zod';
import { searchArticles } from '../api/search.js';
import { withAttribution } from '../utils/attribution.js';
import { stripHtml } from '../utils/text.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerSearchTool(server: McpServer): void {
  server.tool(
    'search_memory_alpha',
    'Search Memory Alpha for Star Trek articles, characters, ships, episodes, and more',
    {
      query: z.string().max(500).describe('Search query (e.g. "Jean-Luc Picard", "USS Enterprise", "Klingon")'),
      limit: z.number().min(1).max(20).default(10).describe('Max results to return (default 10)'),
    },
    async ({ query, limit }) => {
      try {
        const results = await searchArticles(query, limit);
        if (results.length === 0) {
          return { content: [{ type: 'text' as const, text: `No results found for "${query}" on Memory Alpha.` }] };
        }
        const formatted = results.map((r, i) => {
          const snippet = stripHtml(r.snippet).replace(/\n+/g, ' ');
          return `${i + 1}. **${r.title}** (${r.wordcount} words)\n   ${snippet}`;
        }).join('\n\n');

        const text = withAttribution(
          `## Memory Alpha Search: "${query}"\n\n${formatted}\n\n*${results.length} result(s) found*`
        );
        return { content: [{ type: 'text' as const, text }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error searching Memory Alpha for "${query}": ${msg}` }] };
      }
    }
  );
}
