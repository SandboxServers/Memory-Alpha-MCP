import { z } from 'zod';
import { getArticleWikitext } from '../api/parse.js';
import { parseWikitext } from '../parser/wikitext.js';
import { withAttribution } from '../utils/attribution.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const KNOWN_TIME_TRAVEL_EPISODES = [
  { title: 'City on the Edge of Forever', article: 'The City on the Edge of Forever (episode)', era: 'TOS', year: '1930', paradox: 'McCoy saves Edith Keeler, altering history so the Federation never exists. Kirk must let her die to restore the timeline.' },
  { title: 'Yesterday\'s Enterprise', article: 'Yesterday\'s Enterprise (episode)', era: 'TNG', year: '2344/2366', paradox: 'The USS Enterprise-C emerges through a temporal rift 22 years after its destruction. Its absence from the Battle of Narendra III created a timeline where the Federation is at war with the Klingons.' },
  { title: 'Trials and Tribble-ations', article: 'Trials and Tribble-ations (episode)', era: 'DS9', year: '2268/2373', paradox: 'The DS9 crew is thrown back to the TOS era and must prevent a Klingon agent from assassinating Kirk while preserving the timeline.' },
  { title: 'Year of Hell', article: 'Year of Hell (episode)', era: 'VOY', year: '2374', paradox: 'Annorax uses a temporal weapon ship to erase civilizations from time, trying to restore his lost wife. Voyager endures a year of destruction before Janeway rams the weapon ship, resetting the timeline.' },
  { title: 'First Contact (film)', article: 'Star Trek: First Contact', era: 'TNG', year: '2063/2373', paradox: 'The Borg travel back to prevent Zefram Cochrane\'s first warp flight, which would prevent the formation of the Federation.' },
  { title: 'Time\'s Arrow', article: 'Time\'s Arrow (episode)', era: 'TNG', year: '1893/2368', paradox: 'Data\'s severed head is found in a cave under San Francisco, 500 years old. The crew travels to 1893 to discover why — and meets Mark Twain.' },
  { title: 'Endgame', article: 'Endgame (episode)', era: 'VOY', year: '2378/2404', paradox: 'Admiral Janeway travels from 2404 to 2378 to bring Voyager home earlier, armed with future technology. She succeeds but sacrifices her own timeline.' },
  { title: 'Past Tense', article: 'Past Tense, Part I (episode)', era: 'DS9', year: '2024/2371', paradox: 'Sisko, Bashir, and Dax are transported to 2024 San Francisco. When the man who was supposed to lead the Bell Riots dies, Sisko must take his place to preserve history.' },
  { title: 'All Good Things...', article: 'All Good Things... (episode)', era: 'TNG', year: 'Multiple', paradox: 'Q shifts Picard between three time periods. An anti-time eruption in the Devron system threatens to unravel the formation of life on Earth — a final test for humanity.' },
  { title: 'Future\'s End', article: 'Future\'s End (episode)', era: 'VOY', year: '1996/2373', paradox: 'A 29th-century timeship crashes in 1967. Its technology bootstraps the computer revolution of the 1990s — a predestination paradox. Voyager must retrieve the ship before it destroys the Solar system.' },
];

export function registerTemporalIncursionTool(server: McpServer): void {
  server.tool(
    'temporal_incursion',
    'Look up a known Star Trek time-travel event and describe the temporal paradox and its resolution. Can also fetch details from Memory Alpha.',
    {
      event: z.string().max(500).optional().describe('A time-travel episode or event name (e.g. "City on the Edge of Forever", "Yesterday\'s Enterprise"). Omit for a random one.'),
    },
    async ({ event }) => {
      try {
        let selected: typeof KNOWN_TIME_TRAVEL_EPISODES[0];

        if (event) {
          const lower = event.toLowerCase();
          const match = KNOWN_TIME_TRAVEL_EPISODES.find(e =>
            e.title.toLowerCase().includes(lower) || e.article.toLowerCase().includes(lower)
          );
          selected = match ?? KNOWN_TIME_TRAVEL_EPISODES[Math.floor(Math.random() * KNOWN_TIME_TRAVEL_EPISODES.length)];
        } else {
          selected = KNOWN_TIME_TRAVEL_EPISODES[Math.floor(Math.random() * KNOWN_TIME_TRAVEL_EPISODES.length)];
        }

        // Try to fetch additional context from Memory Alpha
        let maContent: string | null = null;
        try {
          const { wikitext, title } = await getArticleWikitext(selected.article);
          const parsed = parseWikitext(wikitext, title);
          if (parsed.summary.length > 50) {
            maContent = parsed.summary.slice(0, 500);
          }
        } catch {
          // Article not found or parse error — use our curated data
        }

        const parts = [
          `## Temporal Incursion Report`,
          `**Event:** ${selected.title}`,
          `**Series:** ${selected.era}`,
          `**Timeframe:** ${selected.year}`,
          '',
          `### Temporal Paradox`,
          selected.paradox,
          '',
        ];

        if (maContent) {
          parts.push(
            `### Memory Alpha Summary`,
            maContent + '...',
            '',
          );
        }

        parts.push(
          `### Department of Temporal Investigations Assessment`,
          `This incursion has been logged and reviewed by the DTI. ${selected.era === 'TOS' ? 'Captain Kirk is already on our watch list.' : selected.era === 'VOY' ? 'Captain Janeway\'s temporal violations exceed recommended limits.' : 'The involved officers have been debriefed.'}`,
          '',
          `### Temporal Mechanics Note`,
          `Time travel in the Star Trek universe operates under several competing models:`,
          `- **Predestination paradox:** The time travel was always part of history (bootstrap)`,
          `- **Alternate timeline:** Time travel creates a branching reality`,
          `- **Reset:** Events are undone when the temporal anomaly is resolved`,
          `This event appears to follow the **${selected.title.includes('Yesterday') || selected.title.includes('Endgame') ? 'alternate timeline' : selected.title.includes('Future') ? 'predestination paradox' : 'reset'}** model.`,
          '',
          `*"Time is the fire in which we burn." — Dr. Soran*`,
        );

        return { content: [{ type: 'text' as const, text: withAttribution(parts.join('\n')) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error processing temporal incursion: ${msg}` }] };
      }
    }
  );
}
