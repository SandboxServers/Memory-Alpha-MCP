import { z } from 'zod';
import { getArticleWikitext } from '../api/parse.js';
import { parseWikitext } from '../parser/wikitext.js';
import { extractSidebarFromWikitext } from '../parser/infobox.js';
import { extractSection } from '../parser/sections.js';
import { withAttribution } from '../utils/attribution.js';
import { truncate, formatKey } from '../utils/text.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerSpeciesTool(server: McpServer): void {
  server.tool(
    'species_info',
    'Get info about a Star Trek species: homeworld, physiology, culture, quadrant',
    {
      species: z.string().max(500).describe('Species name (e.g. "Klingon", "Vulcan", "Borg", "Ferengi")'),
    },
    async ({ species }) => {
      try {
        const { wikitext, title } = await getArticleWikitext(species);
        const parsed = parseWikitext(wikitext, title);
        const sidebar = extractSidebarFromWikitext(wikitext, 'species');

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
          parts.push(`### Species Profile\n${infoLines}`);
        }

        parts.push(truncate(parsed.summary, 1500));

        const physiology = extractSection(wikitext, 'Physiology') ?? extractSection(wikitext, 'Biology');
        if (physiology) parts.push(`### Physiology\n${truncate(physiology, 1000)}`);

        const culture = extractSection(wikitext, 'Culture') ?? extractSection(wikitext, 'Society');
        if (culture) parts.push(`### Culture\n${truncate(culture, 1000)}`);

        return { content: [{ type: 'text' as const, text: withAttribution(parts.join('\n\n')) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error retrieving species info for "${species}": ${msg}` }] };
      }
    }
  );
}
