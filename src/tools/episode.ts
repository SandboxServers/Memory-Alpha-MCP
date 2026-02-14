import { z } from 'zod';
import { getArticleWikitext } from '../api/parse.js';
import { searchArticles } from '../api/search.js';
import { parseWikitext } from '../parser/wikitext.js';
import { extractSidebarFromWikitext } from '../parser/infobox.js';
import { extractSection } from '../parser/sections.js';
import { withAttribution } from '../utils/attribution.js';
import { truncate, formatKey } from '../utils/text.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const SERIES_PREFIXES: Record<string, string> = {
  TOS: 'TOS', TAS: 'TAS', TNG: 'TNG', DS9: 'DS9',
  VOY: 'VOY', ENT: 'ENT', DIS: 'DIS', PIC: 'PIC',
  LD: 'LD', PRO: 'PRO', SNW: 'SNW',
};

export function registerEpisodeTool(server: McpServer): void {
  server.tool(
    'get_episode',
    'Get details about a Star Trek episode: synopsis, writer, director, stardate, guest cast',
    {
      title: z.string().max(500).optional().describe('Episode title (e.g. "The Best of Both Worlds")'),
      series: z.string().optional().describe('Series abbreviation (TOS, TNG, DS9, VOY, ENT, DIS, PIC, LD, PRO, SNW)'),
      season: z.number().optional().describe('Season number'),
      episode: z.number().optional().describe('Episode number within the season'),
    },
    async ({ title, series, season, episode }) => {
      try {
        let articleTitle: string;

        if (title) {
          articleTitle = title;
        } else if (series && season !== undefined && episode !== undefined) {
          const prefix = SERIES_PREFIXES[series.toUpperCase()] ?? series;
          const query = `${prefix} season ${season} episode ${episode}`;
          const results = await searchArticles(query, 1);
          if (results.length === 0) {
            return { content: [{ type: 'text' as const, text: `Could not find episode: ${query}` }] };
          }
          articleTitle = results[0].title;
        } else {
          return { content: [{ type: 'text' as const, text: 'Please provide an episode title, or a series + season + episode number.' }] };
        }

        const { wikitext, title: resolvedTitle } = await getArticleWikitext(articleTitle);
        const parsed = parseWikitext(wikitext, resolvedTitle);
        const sidebar = extractSidebarFromWikitext(wikitext, 'episode');

        if (parsed.isDisambiguation) {
          const links = parsed.links.slice(0, 15).map(l => `- ${l}`).join('\n');
          return { content: [{ type: 'text' as const, text: withAttribution(`## ${resolvedTitle}\n\nThis is a disambiguation page. Did you mean one of these?\n\n${links}`) }] };
        }

        const parts: string[] = [`## ${resolvedTitle}`];

        if (sidebar) {
          const infoLines = Object.entries(sidebar)
            .map(([k, v]) => `- **${formatKey(k)}**: ${v}`)
            .join('\n');
          parts.push(`### Episode Info\n${infoLines}`);
        } else if (parsed.infobox) {
          const infoLines = Object.entries(parsed.infobox)
            .map(([k, v]) => `- **${formatKey(k)}**: ${v}`)
            .join('\n');
          parts.push(`### Episode Info\n${infoLines}`);
        }

        const synopsis = extractSection(wikitext, 'Summary') ??
          extractSection(wikitext, 'Act One') ??
          parsed.summary;
        parts.push(`### Synopsis\n${truncate(synopsis, 2000)}`);

        const quotes = extractSection(wikitext, 'Memorable quotes');
        if (quotes) {
          parts.push(`### Memorable Quotes\n${truncate(quotes, 1000)}`);
        }

        return { content: [{ type: 'text' as const, text: withAttribution(parts.join('\n\n')) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error retrieving episode "${title ?? `S${season}E${episode}`}": ${msg}` }] };
      }
    }
  );
}
