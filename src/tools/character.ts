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

        parts.push(truncate(parsed.summary, 1500));

        // Try to pull specific sections
        const career = extractSection(wikitext, 'Career') ??
          extractSection(wikitext, 'Starfleet career') ??
          extractSection(wikitext, 'Early career');
        if (career) parts.push(`### Career\n${truncate(career, 1000)}`);

        const personal = extractSection(wikitext, 'Personal life') ??
          extractSection(wikitext, 'Personal interests') ??
          extractSection(wikitext, 'Relationships');
        if (personal) parts.push(`### Personal Life\n${truncate(personal, 1000)}`);

        const quotes = extractSection(wikitext, 'Memorable quotes');
        if (quotes) parts.push(`### Memorable Quotes\n${truncate(quotes, 800)}`);

        return { content: [{ type: 'text' as const, text: withAttribution(parts.join('\n\n')) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error looking up character "${name}": ${msg}` }] };
      }
    }
  );
}
