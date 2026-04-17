import { z } from 'zod';
import { getArticleWikitext } from '../api/parse.js';
import { parseWikitext } from '../parser/wikitext.js';
import { withAttribution } from '../utils/attribution.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const MIRROR_SUFFIX = ' (mirror)';

export function registerMirrorUniverseTool(server: McpServer): void {
  server.tool(
    'mirror_universe',
    'Describe the mirror universe version of a Star Trek character, ship, or event. Checks Memory Alpha for a dedicated mirror article.',
    {
      subject: z.string().max(500).describe('The character, ship, or event to look up in the mirror universe (e.g. "Spock", "USS Enterprise", "Benjamin Sisko")'),
    },
    async ({ subject }) => {
      try {
        // Try to fetch the mirror universe article
        const mirrorTitle = subject.endsWith(MIRROR_SUFFIX) ? subject : subject + MIRROR_SUFFIX;
        let mirrorContent: string | null = null;
        let mirrorArticleTitle: string | null = null;

        try {
          const { wikitext, title } = await getArticleWikitext(mirrorTitle);
          const parsed = parseWikitext(wikitext, title);
          if (parsed.summary.length > 30) {
            mirrorContent = parsed.summary;
            mirrorArticleTitle = title;
          }
        } catch {
          // No mirror article — that's fine, we'll generate flavor
        }

        // Also fetch the prime universe version for comparison
        let primeContent: string | null = null;
        try {
          const { wikitext, title } = await getArticleWikitext(subject);
          const parsed = parseWikitext(wikitext, title);
          if (parsed.summary.length > 30) {
            primeContent = parsed.summary;
          }
        } catch {
          // No prime article either
        }

        const parts: string[] = [
          `## Mirror Universe: ${subject}`,
          '',
        ];

        if (mirrorContent && mirrorArticleTitle) {
          parts.push(
            `### Mirror Universe (from Memory Alpha)`,
            mirrorContent.slice(0, 800),
            '',
          );
        } else {
          parts.push(
            `### Mirror Universe`,
            `*No dedicated mirror universe article found on Memory Alpha for "${subject}."*`,
            `In the mirror universe, everything familiar is twisted. Allies become enemies, explorers become conquerors, and the Federation is replaced by the brutal Terran Empire.`,
            '',
          );
        }

        if (primeContent) {
          parts.push(
            `### Prime Universe (for comparison)`,
            primeContent.slice(0, 500) + (primeContent.length > 500 ? '...' : ''),
            '',
          );
        }

        parts.push(
          `### Mirror Universe Context`,
          `The mirror universe (first seen in TOS: "Mirror, Mirror") is a parallel dimension where moral alignments are often reversed. Key differences include:`,
          `- The **Terran Empire** rules through fear instead of the Federation's diplomacy`,
          `- Officers advance through assassination rather than merit`,
          `- Vulcans, Klingons, and other species were conquered and enslaved`,
          `- The I.S.S. Enterprise served as a warship of oppression`,
          '',
          `*"In every revolution, there's one man with a vision." — Mirror Spock*`,
        );

        return { content: [{ type: 'text' as const, text: withAttribution(parts.join('\n')) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error looking up mirror universe: ${msg}` }] };
      }
    }
  );
}
