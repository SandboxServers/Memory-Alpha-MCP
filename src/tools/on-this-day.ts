import { z } from 'zod';
import { searchArticles } from '../api/search.js';
import { getArticleWikitext } from '../api/parse.js';
import { parseWikitext } from '../parser/wikitext.js';
import { withAttribution } from '../utils/attribution.js';
import { truncate } from '../utils/text.js';
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
    },
    async ({ date }) => {
      try {
        let dateStr: string;
        if (date) {
          dateStr = date;
        } else {
          // Note: uses server-local time; may differ from user's timezone
          const now = new Date();
          dateStr = `${MONTH_NAMES[now.getMonth()]} ${now.getDate()}`;
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
      const parsed = parseWikitext(wikitext, title);
      const text = withAttribution(
        `## On This Day in Star Trek: ${title}\n\n${truncate(parsed.fullText, 5000)}`
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
