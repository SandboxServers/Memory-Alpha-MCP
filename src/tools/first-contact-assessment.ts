import { z } from 'zod';
import { getArticleWikitext } from '../api/parse.js';
import { parseWikitext } from '../parser/wikitext.js';
import { withAttribution } from '../utils/attribution.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerFirstContactAssessmentTool(server: McpServer): void {
  server.tool(
    'first_contact_assessment',
    'Given a species name, look it up on Memory Alpha and assess warp capability, government type, and recommended first contact approach',
    {
      species: z.string().max(500).describe('The species to assess for first contact (e.g. "Bajoran", "Tholian", "Tamarian")'),
    },
    async ({ species }) => {
      try {
        let speciesData: { summary: string; infobox: Record<string, string> | null } | null = null;

        try {
          const { wikitext, title } = await getArticleWikitext(species);
          const parsed = parseWikitext(wikitext, title);
          if (parsed.summary.length > 30) {
            speciesData = { summary: parsed.summary, infobox: parsed.infobox };
          }
        } catch {
          // Species not found — we'll generate a generic assessment
        }

        const parts: string[] = [
          `## First Contact Assessment: ${species}`,
          '',
        ];

        if (speciesData) {
          parts.push(
            `### Species Profile (from Memory Alpha)`,
            speciesData.summary.slice(0, 600) + (speciesData.summary.length > 600 ? '...' : ''),
            '',
          );

          // Extract infobox data if available
          if (speciesData.infobox) {
            const ib = speciesData.infobox;
            const infoLines: string[] = [];
            if (ib['homeworld'] || ib['planet']) infoLines.push(`**Homeworld:** ${ib['homeworld'] ?? ib['planet']}`);
            if (ib['quadrant']) infoLines.push(`**Quadrant:** ${ib['quadrant']}`);
            if (ib['government'] || ib['affiliation']) infoLines.push(`**Government/Affiliation:** ${ib['government'] ?? ib['affiliation']}`);
            if (ib['warp capable'] || ib['warp']) infoLines.push(`**Warp Capable:** ${ib['warp capable'] ?? ib['warp']}`);
            if (infoLines.length > 0) {
              parts.push(`### Key Data`, ...infoLines, '');
            }
          }
        } else {
          parts.push(
            `*No Memory Alpha article found for "${species}". Assessment based on general Starfleet first contact protocols.*`,
            '',
          );
        }

        parts.push(
          `### First Contact Protocol Assessment`,
          '',
          `**Pre-Contact Checklist (per Starfleet General Order 1):**`,
          `1. Confirm species has achieved warp capability (Prime Directive prerequisite)`,
          `2. Conduct covert cultural survey from orbit (minimum 72 hours)`,
          `3. Identify government structure and decision-making authority`,
          `4. Assess species temperament and likely reaction to alien contact`,
          `5. Prepare universal translator calibration for species language`,
          '',
          `**Recommended Approach:**`,
          `- **Contact Team:** Captain or First Officer, Science Officer, Cultural Specialist`,
          `- **Location:** Neutral ground — preferably the species' seat of government`,
          `- **Opening:** Non-threatening greeting, demonstration of peaceful intent`,
          `- **Avoid:** Displays of superior technology, references to other species without context`,
          '',
          `**Risk Factors to Monitor:**`,
          `- Xenophobic cultural tendencies`,
          `- Internal political instability that could blame outsiders`,
          `- Religious or cultural beliefs that may interpret contact as threatening`,
          `- Presence of other spacefaring species already in contact`,
          '',
          `*"First contact with a new species is one of the most important events in the life of any civilization." — Captain Jean-Luc Picard*`,
        );

        return { content: [{ type: 'text' as const, text: withAttribution(parts.join('\n')) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error assessing first contact: ${msg}` }] };
      }
    }
  );
}
