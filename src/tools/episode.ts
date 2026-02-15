import { z } from 'zod';
import { getArticleWikitext } from '../api/parse.js';
import { searchArticles } from '../api/search.js';
import { getSeasonEpisodes } from '../api/episodes.js';
import { parseWikitext } from '../parser/wikitext.js';
import { extractSidebarFromWikitext } from '../parser/infobox.js';
import { extractSection } from '../parser/sections.js';
import { withAttribution } from '../utils/attribution.js';
import { truncate, formatKey } from '../utils/text.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerEpisodeTool(server: McpServer): void {
  server.tool(
    'get_episode',
    'Get details about a Star Trek episode: synopsis, writer, director, stardate, guest cast',
    {
      title: z.string().max(500).optional().describe('Episode title (e.g. "The Best of Both Worlds")'),
      series: z.string().max(200).optional().describe('Series abbreviation (TOS, TNG, DS9, VOY, ENT, DIS, PIC, LD, PRO, SNW)'),
      season: z.number().optional().describe('Season number'),
      episode: z.number().optional().describe('Episode number within the season'),
    },
    async ({ title, series, season, episode }) => {
      try {
        let articleTitle: string;

        if (title) {
          articleTitle = title;
        } else if (series && season !== undefined && episode !== undefined) {
          // Use season table to resolve episode title
          const resolved = await resolveBySeasonTable(series, season, episode);
          if (resolved) {
            articleTitle = resolved;
          } else {
            // Last resort: search
            const query = `${series.toUpperCase()} season ${season} episode ${episode}`;
            const results = await searchArticles(query, 1);
            if (results.length === 0) {
              return { content: [{ type: 'text' as const, text: `Could not find episode: ${series.toUpperCase()} S${season}E${episode}` }] };
            }
            articleTitle = results[0].title;
          }
        } else {
          return { content: [{ type: 'text' as const, text: 'Please provide an episode title, or a series + season + episode number.' }] };
        }

        return await fetchEpisodeArticle(articleTitle);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error retrieving episode "${title ?? `S${season}E${episode}`}": ${msg}` }] };
      }
    }
  );
}

async function resolveBySeasonTable(series: string, season: number, episode: number): Promise<string | null> {
  try {
    const episodes = await getSeasonEpisodes(series, season);
    if (episodes.length === 0) return null;

    // Find the episode by its number suffix (e.g., episode 8 matches "3x08")
    const padded = String(episode).padStart(2, '0');
    const match = episodes.find(ep => ep.number.endsWith(`x${padded}`));
    if (match) return match.title;

    // Fallback: use index (1-based)
    if (episode >= 1 && episode <= episodes.length) {
      return episodes[episode - 1].title;
    }
  } catch {
    // Season table approach failed entirely
  }
  return null;
}

async function fetchEpisodeArticle(articleTitle: string) {
  const { wikitext, title: resolvedTitle } = await getArticleWikitext(articleTitle);
  const parsed = parseWikitext(wikitext, resolvedTitle);

  // Disambiguation auto-retry: try "Title (episode)" suffix
  if (parsed.isDisambiguation) {
    const suffixed = articleTitle.includes('(episode)') ? null : `${articleTitle} (episode)`;
    if (suffixed) {
      try {
        const retry = await getArticleWikitext(suffixed);
        const retryParsed = parseWikitext(retry.wikitext, retry.title);
        if (!retryParsed.isDisambiguation) {
          return formatEpisodeResponse(retry.wikitext, retry.title, retryParsed);
        }
      } catch {
        // Suffixed title doesn't exist, show disambiguation
      }
    }

    const links = parsed.links.slice(0, 15).map(l => `- ${l}`).join('\n');
    return { content: [{ type: 'text' as const, text: withAttribution(`## ${resolvedTitle}\n\nThis is a disambiguation page. Did you mean one of these?\n\n${links}`) }] };
  }

  return formatEpisodeResponse(wikitext, resolvedTitle, parsed);
}

function formatEpisodeResponse(wikitext: string, resolvedTitle: string, parsed: ReturnType<typeof parseWikitext>) {
  const sidebar = extractSidebarFromWikitext(wikitext, 'episode');
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
    extractSection(wikitext, 'Synopsis') ??
    extractSection(wikitext, 'Plot') ??
    parsed.summary;
  parts.push(`### Synopsis\n${truncate(synopsis, 4000)}`);

  const quotes = extractSection(wikitext, 'Memorable quotes');
  if (quotes) {
    parts.push(`### Memorable Quotes\n${truncate(quotes, 1500)}`);
  }

  const background = extractSection(wikitext, 'Background information');
  if (background) {
    parts.push(`### Background Information\n${truncate(background, 2000)}`);
  }

  const references = extractSection(wikitext, 'References');
  if (references) {
    parts.push(`### References\n${truncate(references, 1500)}`);
  }

  return { content: [{ type: 'text' as const, text: withAttribution(parts.join('\n\n')) }] };
}
