import { z } from 'zod';
import { getArticleWikitext } from '../api/parse.js';
import { parseWikitext } from '../parser/wikitext.js';
import { extractSidebarFromWikitext } from '../parser/infobox.js';
import { extractSection } from '../parser/sections.js';
import { withAttribution } from '../utils/attribution.js';
import { truncate, formatKey } from '../utils/text.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerCharacterTool(server: McpServer): void {
  server.tool(
    'character_lookup',
    'Get details about a Star Trek character: rank, species, affiliation, biography',
    {
      name: z.string().max(500).describe('Character name (e.g. "Jean-Luc Picard", "Worf", "Seven of Nine")'),
    },
    async ({ name }) => {
      try {
        const { wikitext, title } = await getArticleWikitext(name);
        const parsed = parseWikitext(wikitext, title);

        if (parsed.isDisambiguation) {
          const links = parsed.links.slice(0, 15).map(l => `- ${l}`).join('\n');
          return { content: [{ type: 'text' as const, text: withAttribution(`## ${title}\n\nThis is a disambiguation page. Did you mean one of these?\n\n${links}`) }] };
        }

        // Try sidebar individual, then sidebar character, then generic infobox
        const sidebar = extractSidebarFromWikitext(wikitext, 'individual') ??
          extractSidebarFromWikitext(wikitext, 'character') ??
          extractSidebarFromWikitext(wikitext, 'personnel');

        const parts: string[] = [`## ${title}`];

        const info = sidebar ?? parsed.infobox;
        if (info) {
          const infoLines = Object.entries(info)
            .map(([k, v]) => `- **${formatKey(k)}**: ${v}`)
            .join('\n');
          parts.push(`### Character Profile\n${infoLines}`);
        }

        parts.push(truncate(parsed.summary, 2500));

        // Try to pull specific sections
        const extractedHeadings: string[] = [];

        const earlyLife = extractSection(wikitext, 'Early life') ??
          extractSection(wikitext, 'Early life and career');
        if (earlyLife) {
          parts.push(`### Early Life\n${truncate(earlyLife, 2000)}`);
          extractedHeadings.push('Early life', 'Early life and career');
        }

        const career = extractSection(wikitext, 'Career') ??
          extractSection(wikitext, 'Starfleet career') ??
          extractSection(wikitext, 'Early career');
        if (career) {
          parts.push(`### Career\n${truncate(career, 2500)}`);
          extractedHeadings.push('Career', 'Starfleet career', 'Early career');
        }

        const laterCareer = extractSection(wikitext, 'Later career') ??
          extractSection(wikitext, 'Retirement') ??
          extractSection(wikitext, 'Later life');
        if (laterCareer) {
          parts.push(`### Later Career\n${truncate(laterCareer, 2000)}`);
          extractedHeadings.push('Later career', 'Retirement', 'Later life');
        }

        const personal = extractSection(wikitext, 'Personal life') ??
          extractSection(wikitext, 'Personal interests') ??
          extractSection(wikitext, 'Relationships');
        if (personal) {
          parts.push(`### Personal Life\n${truncate(personal, 2000)}`);
          extractedHeadings.push('Personal life', 'Personal interests', 'Relationships');
        }

        const legacy = extractSection(wikitext, 'Legacy') ??
          extractSection(wikitext, 'Alternate timelines') ??
          extractSection(wikitext, 'Alternate realities');
        if (legacy) {
          parts.push(`### Legacy\n${truncate(legacy, 2000)}`);
          extractedHeadings.push('Legacy', 'Alternate timelines', 'Alternate realities');
        }

        const quotes = extractSection(wikitext, 'Memorable quotes');
        if (quotes) {
          parts.push(`### Memorable Quotes\n${truncate(quotes, 1500)}`);
          extractedHeadings.push('Memorable quotes');
        }

        // Add available sections footer
        const allHeadings = parsed.sections
          .map(s => s.title)
          .filter(t => t && !extractedHeadings.some(h => h.toLowerCase() === t.toLowerCase()));
        if (allHeadings.length > 0) {
          parts.push(`**Other available sections:** ${allHeadings.join(', ')}`);
        }

        return { content: [{ type: 'text' as const, text: withAttribution(parts.join('\n\n')) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error looking up character "${name}": ${msg}` }] };
      }
    }
  );
}
