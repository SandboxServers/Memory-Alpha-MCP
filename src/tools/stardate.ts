import { z } from 'zod';
import { withAttribution } from '../utils/attribution.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerStardateTool(server: McpServer): void {
  server.tool(
    'stardate_converter',
    'Convert between stardates and real-world dates, or get the current stardate',
    {
      date: z.string().max(200).optional().describe('Real-world date to convert (e.g. "2026-02-14", "March 5 1987"). Defaults to today.'),
      stardate: z.number().optional().describe('Stardate to convert to a real-world date (e.g. 41153.7)'),
      era: z.enum(['TOS', 'TNG']).default('TNG').describe('Era for conversion formula (TOS or TNG). Default: TNG'),
    },
    async ({ date, stardate, era }) => {
      try {
        let result: string;

        if (stardate !== undefined) {
          result = stardateToDate(stardate, era);
        } else {
          const realDate = date ? new Date(date) : new Date();
          if (isNaN(realDate.getTime())) {
            return { content: [{ type: 'text' as const, text: `Could not parse date "${date}". Try formats like "2026-02-14" or "March 5 1987".` }] };
          }
          result = dateToStardate(realDate, era);
        }

        return { content: [{ type: 'text' as const, text: withAttribution(result) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error converting stardate: ${msg}` }] };
      }
    }
  );
}

function dateToStardate(date: Date, era: string): string {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);
  const fraction = dayOfYear / 365.25;

  const parts: string[] = ['## Stardate Converter'];

  if (era === 'TOS') {
    // TOS stardates: roughly 1000-5999 for 2265-2269
    // Approximate: stardate = (year - 2264) * 1000 + fraction * 1000
    const trekYear = year + 239; // ~2265 for 2026
    const sd = ((trekYear - 2264) * 1000 + fraction * 1000).toFixed(1);
    parts.push(
      `**Date:** ${date.toDateString()}`,
      `**In-Universe Year:** ${trekYear} (TOS era)`,
      `**Approximate Stardate:** ${sd}`,
      `*Note: TOS stardates were famously inconsistent. Gene Roddenberry intentionally made them non-sequential to avoid continuity errors. This is a rough approximation.*`,
    );
  } else {
    // TNG stardates: XXXXX.X where first two digits relate to century/year
    // Formula: stardate = 1000 * (year - 2323) + fraction * 1000
    const trekYear = year + 338; // ~2364 for 2026
    const sd = (1000 * (trekYear - 2323) + fraction * 1000).toFixed(1);
    parts.push(
      `**Date:** ${date.toDateString()}`,
      `**In-Universe Year:** ${trekYear} (TNG era)`,
      `**Stardate:** ${sd}`,
      `*TNG-era stardates: the first two digits indicate the century and year within it. Each unit represents roughly 8.64 hours.*`,
    );
  }

  return parts.join('\n\n');
}

function stardateToDate(sd: number, era: string): string {
  const parts: string[] = ['## Stardate Converter'];

  if (era === 'TOS') {
    // Reverse: year = floor(sd / 1000) + 2264, day = (sd % 1000) / 1000 * 365
    const trekYear = Math.floor(sd / 1000) + 2264;
    const dayOfYear = Math.floor((sd % 1000) / 1000 * 365);
    const realYear = trekYear - 239;
    const approxDate = new Date(realYear, 0, 1 + dayOfYear);
    parts.push(
      `**Stardate:** ${sd}`,
      `**In-Universe Date:** Approximately day ${dayOfYear} of ${trekYear} (TOS era)`,
      `**Real-World Equivalent:** ~${approxDate.toDateString()}`,
      `*TOS stardates were not designed for precise conversion. This is a rough approximation.*`,
    );
  } else {
    // Reverse: year = floor(sd / 1000) + 2323, day = (sd % 1000) / 1000 * 365
    const trekYear = Math.floor(sd / 1000) + 2323;
    const dayOfYear = Math.floor((sd % 1000) / 1000 * 365);
    const realYear = trekYear - 338;
    const approxDate = new Date(realYear, 0, 1 + dayOfYear);
    parts.push(
      `**Stardate:** ${sd}`,
      `**In-Universe Date:** Approximately day ${dayOfYear} of ${trekYear} (TNG era)`,
      `**Real-World Equivalent:** ~${approxDate.toDateString()}`,
      '',
      `### Notable Nearby Stardates`,
      `- 41153.7 — Encounter at Farpoint (TNG pilot)`,
      `- 43989.1 — Best of Both Worlds`,
      `- 48315.6 — All Good Things... (TNG finale)`,
      `- 56844.9 — Nemesis`,
    );
  }

  return parts.join('\n\n');
}
