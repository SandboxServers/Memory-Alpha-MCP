import { z } from 'zod';
import { getArticleWikitext } from '../api/parse.js';
import { parseWikitext } from '../parser/wikitext.js';
import { withAttribution } from '../utils/attribution.js';
import { truncate } from '../utils/text.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerTimelineTool(server: McpServer): void {
  server.tool(
    'get_timeline',
    'Get Star Trek events for a specific in-universe year (e.g. 2364, 22nd century)',
    {
      year: z.string().max(200).describe('Year or era (e.g. "2364", "22nd century", "2150s")'),
    },
    async ({ year }) => {
      try {
        const { wikitext, title } = await getArticleWikitext(year);
        const parsed = parseWikitext(wikitext, title);

        const parts: string[] = [
          `## Star Trek Timeline: ${title}`,
          truncate(parsed.fullText, 3500),
        ];

        return { content: [{ type: 'text' as const, text: withAttribution(parts.join('\n\n')) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error retrieving timeline for "${year}": ${msg}` }] };
      }
    }
  );
}
