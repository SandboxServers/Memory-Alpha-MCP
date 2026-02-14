import { z } from 'zod';
import { getArticleWikitext } from '../api/parse.js';
import { parseWikitext } from '../parser/wikitext.js';
import { extractSidebarFromWikitext } from '../parser/infobox.js';
import { extractSection } from '../parser/sections.js';
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

        // Try structured section extraction
        const sectionDefs = [
          { key: 'History', names: ['History', 'Service history', 'Operational history'] },
          { key: 'Technical Data', names: ['Technical data', 'Technical specifications', 'Systems'] },
          { key: 'Crew', names: ['Crew', 'Personnel', 'Crew manifest', 'Known crew'] },
          { key: 'Armament', names: ['Armament', 'Weapons', 'Tactical systems', 'Defenses'] },
          { key: 'Legacy', names: ['Legacy', 'Fate', 'Decommissioning'] },
        ];

        let foundSections = false;
        for (const def of sectionDefs) {
          let content: string | null = null;
          for (const name of def.names) {
            content = extractSection(wikitext, name);
            if (content) break;
          }
          if (content) {
            foundSections = true;
            parts.push(`### ${def.key}\n${truncate(content, 2500)}`);
          }
        }

        // Fall back to fullText only if no structured sections found
        if (!foundSections) {
          parts.push(truncate(parsed.fullText, 5000));
        }

        return { content: [{ type: 'text' as const, text: withAttribution(parts.join('\n\n')) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error retrieving starship "${name}": ${msg}` }] };
      }
    }
  );
}
