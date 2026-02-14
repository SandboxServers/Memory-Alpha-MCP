import { z } from 'zod';
import { getArticleWikitext } from '../api/parse.js';
import { parseWikitext } from '../parser/wikitext.js';
import { extractSection } from '../parser/sections.js';
import { withAttribution } from '../utils/attribution.js';
import { truncate } from '../utils/text.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerCrewManifestTool(server: McpServer): void {
  server.tool(
    'crew_manifest',
    'Get the crew roster for a Star Trek starship or station',
    {
      ship: z.string().max(500).describe('Ship or station name (e.g. "USS Enterprise (NCC-1701-D)", "Deep Space 9")'),
    },
    async ({ ship }) => {
      try {
        const { wikitext, title } = await getArticleWikitext(ship);
        const parsed = parseWikitext(wikitext, title);

        const crewSection =
          extractSection(wikitext, 'Personnel') ??
          extractSection(wikitext, 'Crew') ??
          extractSection(wikitext, 'Crew manifest') ??
          extractSection(wikitext, 'Known crew') ??
          extractSection(wikitext, 'Assigned personnel');

        const parts: string[] = [`## Crew Manifest: ${title}`];

        if (crewSection) {
          parts.push(truncate(crewSection, 5000));
        } else {
          parts.push(`No dedicated crew section found. Here's what's available:\n\n${truncate(parsed.summary, 2500)}`);
          const sectionNames = parsed.sections.map(s => s.title).filter(Boolean);
          if (sectionNames.length > 0) {
            parts.push(`\n**Available sections:** ${sectionNames.join(', ')}`);
          }
        }

        return { content: [{ type: 'text' as const, text: withAttribution(parts.join('\n\n')) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error retrieving crew manifest for "${ship}": ${msg}` }] };
      }
    }
  );
}
