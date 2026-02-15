import { z } from 'zod';
import { getSeasonEpisodes } from '../api/episodes.js';
import { withAttribution } from '../utils/attribution.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const SERIES_FULL_NAMES: Record<string, string> = {
  TOS: 'Star Trek: The Original Series',
  TAS: 'Star Trek: The Animated Series',
  TNG: 'Star Trek: The Next Generation',
  DS9: 'Star Trek: Deep Space Nine',
  VOY: 'Star Trek: Voyager',
  ENT: 'Star Trek: Enterprise',
  DIS: 'Star Trek: Discovery',
  PIC: 'Star Trek: Picard',
  LD: 'Star Trek: Lower Decks',
  PRO: 'Star Trek: Prodigy',
  SNW: 'Star Trek: Strange New Worlds',
};

export function registerListEpisodesTool(server: McpServer): void {
  server.tool(
    'list_episodes',
    'List all episodes for a Star Trek series season',
    {
      series: z.string().max(200).describe('Series abbreviation (TOS, TNG, DS9, VOY, ENT, DIS, PIC, LD, PRO, SNW)'),
      season: z.number().min(1).max(10).describe('Season number'),
    },
    async ({ series, season }) => {
      try {
        const seriesKey = series.toUpperCase();
        const seriesName = SERIES_FULL_NAMES[seriesKey] ?? series;

        const episodes = await getSeasonEpisodes(seriesKey, season);

        if (episodes.length === 0) {
          return { content: [{ type: 'text' as const, text: `No episodes found for ${seriesName} Season ${season}. Check the series abbreviation and season number.` }] };
        }

        const list = episodes.map(ep => `${ep.number}. ${ep.title}`).join('\n');
        const text = withAttribution(
          `## ${seriesName} — Season ${season}\n\n${list}\n\n*${episodes.length} episode(s) found. Use \`get_episode\` for details on any episode.*`
        );

        return { content: [{ type: 'text' as const, text }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error listing episodes for ${series} Season ${season}: ${msg}` }] };
      }
    }
  );
}
