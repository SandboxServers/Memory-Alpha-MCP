import { z } from 'zod';
import { getCategoryMembers } from '../api/categories.js';
import { withAttribution } from '../utils/attribution.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerCategoriesTool(server: McpServer): void {
  server.tool(
    'browse_categories',
    'Browse Memory Alpha articles by category (e.g. "Starfleet vessels", "Klingons", "TNG episodes")',
    {
      category: z.string().max(500).describe('Category name (e.g. "Federation starships", "Vulcans")'),
      limit: z.number().min(1).max(50).default(20).describe('Max articles to list'),
    },
    async ({ category, limit }) => {
      try {
        const members = await getCategoryMembers(category, limit);
        if (members.length === 0) {
          return { content: [{ type: 'text' as const, text: `No articles found in category "${category}". Try a different category name.` }] };
        }
        const list = members.map((m, i) => `${i + 1}. ${m.title}`).join('\n');
        const text = withAttribution(
          `## Category: ${category}\n\n${list}\n\n*${members.length} article(s) listed*`
        );
        return { content: [{ type: 'text' as const, text }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error browsing category "${category}": ${msg}` }] };
      }
    }
  );
}
