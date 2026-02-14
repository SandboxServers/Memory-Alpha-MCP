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

        parts.push(truncate(parsed.summary, 2500));

        const physiology = extractSection(wikitext, 'Physiology') ?? extractSection(wikitext, 'Biology');
        if (physiology) parts.push(`### Physiology\n${truncate(physiology, 2000)}`);

        const culture = extractSection(wikitext, 'Culture') ?? extractSection(wikitext, 'Society');
        if (culture) parts.push(`### Culture\n${truncate(culture, 2000)}`);

        const history = extractSection(wikitext, 'History');
        if (history) parts.push(`### History\n${truncate(history, 2000)}`);

        const government = extractSection(wikitext, 'Government') ?? extractSection(wikitext, 'Politics');
        if (government) parts.push(`### Government\n${truncate(government, 2000)}`);

        const military = extractSection(wikitext, 'Military') ?? extractSection(wikitext, 'Military forces');
        if (military) parts.push(`### Military\n${truncate(military, 2000)}`);

        const technology = extractSection(wikitext, 'Technology');
        if (technology) parts.push(`### Technology\n${truncate(technology, 2000)}`);

        const relations = extractSection(wikitext, 'Relations') ??
          extractSection(wikitext, 'Foreign relations') ??
          extractSection(wikitext, 'Interstellar relations');
        if (relations) parts.push(`### Relations\n${truncate(relations, 2000)}`);

        return { content: [{ type: 'text' as const, text: withAttribution(parts.join('\n\n')) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error retrieving species info for "${species}": ${msg}` }] };
      }
    }
  );
}
