import { z } from 'zod';
import { getArticleWikitext } from '../api/parse.js';
import { parseWikitext } from '../parser/wikitext.js';
import { searchArticles } from '../api/search.js';
import { withAttribution } from '../utils/attribution.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerEpisodeRecommenderTool(server: McpServer): void {
  server.tool(
    'episode_recommender',
    'Get episode recommendations based on a Star Trek episode you enjoyed',
    {
      episode: z.string().max(500).describe('Episode title you liked (e.g. "The Inner Light", "In the Pale Moonlight")'),
      count: z.number().min(1).max(10).default(5).describe('Number of recommendations (default: 5)'),
    },
    async ({ episode, count }) => {
      try {
        // Fetch the source episode
        const { wikitext, title } = await getArticleWikitext(episode);
        const parsed = parseWikitext(wikitext, title);

        // Extract themes from categories
        const themes = parsed.categories
          .map(c => c.replace(/^Category:/, ''))
          .filter(c =>
            !c.toLowerCase().includes('articles') &&
            !c.toLowerCase().includes('pages') &&
            !c.toLowerCase().includes('memory alpha')
          );

        // Search for related episodes using category keywords
        const searchTerms = extractSearchTerms(parsed.summary, themes);
        const allResults: Array<{ title: string; snippet: string }> = [];
        const seen = new Set<string>([title.toLowerCase()]);

        for (const term of searchTerms) {
          if (allResults.length >= count) break;
          try {
            const results = await searchArticles(term, 5);
            for (const r of results) {
              if (!seen.has(r.title.toLowerCase()) && r.title.toLowerCase() !== title.toLowerCase()) {
                seen.add(r.title.toLowerCase());
                allResults.push({ title: r.title, snippet: r.snippet });
              }
            }
          } catch {
            continue;
          }
        }

        const recommendations = allResults.slice(0, count);

        if (recommendations.length === 0) {
          return { content: [{ type: 'text' as const, text: `Could not find recommendations based on "${title}". Try a different episode title.` }] };
        }

        const parts: string[] = [
          `## If You Liked "${title}", Try These:`,
          `*Based on shared themes, characters, and storylines*`,
          '',
          ...recommendations.map((r, i) =>
            `${i + 1}. **${r.title}**`
          ),
          '',
          `### Why These?`,
          `Themes from "${title}": ${themes.slice(0, 8).join(', ') || 'General Star Trek themes'}`,
          '',
          `*Use \`get_episode\` to get full details on any of these recommendations.*`,
        ];

        return { content: [{ type: 'text' as const, text: withAttribution(parts.join('\n')) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error finding recommendations for "${episode}": ${msg}` }] };
      }
    }
  );
}

function extractSearchTerms(summary: string, themes: string[]): string[] {
  const terms: string[] = [];

  // Use category-based themes first (most relevant)
  for (const theme of themes.slice(0, 5)) {
    terms.push(theme);
  }

  // Extract key concepts from summary
  const conceptPatterns = [
    /(?:Klingon|Romulan|Borg|Cardassian|Bajoran|Ferengi|Vulcan|Dominion)/gi,
    /(?:time travel|temporal|alternate|mirror|holodeck|Q\b)/gi,
    /(?:war|battle|peace|diplomacy|trial|first contact)/gi,
  ];

  for (const pattern of conceptPatterns) {
    const matches = summary.match(pattern);
    if (matches) {
      for (const m of matches) {
        const term = `Star Trek ${m} episode`;
        if (!terms.includes(term)) terms.push(term);
      }
    }
  }

  // Fallback
  if (terms.length === 0) {
    terms.push('Star Trek best episodes');
  }

  return terms.slice(0, 8);
}
