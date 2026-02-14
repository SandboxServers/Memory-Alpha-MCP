import { z } from 'zod';
import { getArticleWikitext } from '../api/parse.js';
import { parseWikitext } from '../parser/wikitext.js';
import { extractSidebarFromWikitext } from '../parser/infobox.js';
import { withAttribution } from '../utils/attribution.js';
import { truncate, formatKey } from '../utils/text.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerStarshipTool(server: McpServer): void {
  server.tool(
    'get_starship',
    'Get details about a Star Trek starship: class, registry, armaments, crew complement',
    {
      name: z.string().max(500).describe('Ship name (e.g. "USS Enterprise (NCC-1701-D)", "USS Defiant")'),
    },
    async ({ name }) => {
      try {
        const { wikitext, title } = await getArticleWikitext(name);
        const parsed = parseWikitext(wikitext, title);
        const sidebar = extractSidebarFromWikitext(wikitext, 'starship') ??
          extractSidebarFromWikitext(wikitext, 'ship');

        if (parsed.isDisambiguation) {
          const links = parsed.links.slice(0, 15).map(l => `- ${l}`).join('\n');
          return { content: [{ type: 'text' as const, text: withAttribution(`## ${title}\n\nThis is a disambiguation page. Did you mean one of these?\n\n${links}`) }] };
        }

        const parts: string[] = [`## ${title}`];

        const info = sidebar ?? parsed.infobox;
        if (info) {
          const infoLines = Object.entries(info)
            .map(([k, v]) => `- **${formatKey(k)}**: ${v}`)
            .join('\n');
          parts.push(`### Ship Specifications\n${infoLines}`);
        }

        parts.push(truncate(parsed.fullText, 3000));

        return { content: [{ type: 'text' as const, text: withAttribution(parts.join('\n\n')) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error retrieving starship "${name}": ${msg}` }] };
      }
    }
  );
}
