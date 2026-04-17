import { z } from 'zod';
import { searchArticles } from '../api/search.js';
import { getArticleWikitext } from '../api/parse.js';
import { withAttribution } from '../utils/attribution.js';
import { truncate, cleanWikitext, stripHtml } from '../utils/text.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function registerOnThisDayTool(server: McpServer): void {
  server.tool(
    'on_this_day',
    'Get Star Trek events, air dates, and birthdays for a specific date',
    {
      date: z.string().max(200).optional().describe('Date in "Month Day" format (e.g. "February 14"). Defaults to today.'),
      timezone: z.string().max(100).optional().describe('IANA timezone (e.g. "America/New_York"). Defaults to UTC when no date is provided.'),
    },
    async ({ date, timezone }) => {
      try {
        let dateStr: string;
        if (date) {
          dateStr = date;
        } else {
          const tz = timezone ?? 'UTC';
          try {
            const formatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'long', day: 'numeric' });
            const parts = formatter.formatToParts(new Date());
            const month = parts.find(p => p.type === 'month')?.value ?? MONTH_NAMES[new Date().getMonth()];
            const day = parts.find(p => p.type === 'day')?.value ?? String(new Date().getDate());
            dateStr = `${month} ${day}`;
          } catch {
            // Invalid timezone — fall back to UTC
            const now = new Date();
            const utcMonth = MONTH_NAMES[now.getUTCMonth()];
            dateStr = `${utcMonth} ${now.getUTCDate()}`;
          }
        }

        // Try "Month Day" format, then "Day Month" format (Memory Alpha uses both)
        const result = await fetchDateArticle(dateStr);
        if (result) return result;

        // Fallback: search
        const results = await searchArticles(dateStr, 5);
        if (results.length > 0) {
          const list = results.map(r => `- **${r.title}**`).join('\n');
          return { content: [{ type: 'text' as const, text: withAttribution(`## On This Day: ${dateStr}\n\nNo exact date article found, but here are related results:\n\n${list}`) }] };
        }
        return { content: [{ type: 'text' as const, text: `No Memory Alpha data found for "${dateStr}".` }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error looking up "on this day" for "${date ?? 'today'}": ${msg}` }] };
      }
    }
  );
}

async function fetchDateArticle(dateStr: string): Promise<{ content: [{ type: 'text'; text: string }] } | null> {
  const attempts = [dateStr, flipDateFormat(dateStr)];
  for (const attempt of attempts) {
    try {
      const { wikitext, title } = await getArticleWikitext(attempt);
      // Use raw wikitext through our own pipeline — wtf_wikipedia's text()
      // drops italic-wrapped links, causing missing episode/production titles
      const cleaned = stripHtml(cleanWikitext(wikitext)).replace(/\n{3,}/g, '\n\n').trim();
      const text = withAttribution(
        `## On This Day in Star Trek: ${title}\n\n${truncate(cleaned, 5000)}`
      );
      return { content: [{ type: 'text' as const, text }] };
    } catch {
      continue;
    }
  }
  return null;
}

/** Flip "February 14" to "14 February" and vice versa. */
function flipDateFormat(dateStr: string): string {
  const monthFirst = dateStr.match(/^([A-Za-z]+)\s+(\d+)$/);
  if (monthFirst) return `${monthFirst[2]} ${monthFirst[1]}`;
  const dayFirst = dateStr.match(/^(\d+)\s+([A-Za-z]+)$/);
  if (dayFirst) return `${dayFirst[2]} ${dayFirst[1]}`;
  return dateStr;
}
