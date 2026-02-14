import { z } from 'zod';
import { getRandomArticles } from '../api/random.js';
import { getArticleWikitext } from '../api/parse.js';
import { parseWikitext } from '../parser/wikitext.js';
import { withAttribution } from '../utils/attribution.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerRandomTool(server: McpServer): void {
  server.tool(
    'get_random_article',
    'Get random Star Trek articles from Memory Alpha - great for discovery and trivia',
    {
      count: z.number().min(1).max(5).default(1).describe('Number of random articles (1-5)'),
    },
    async ({ count }) => {
      try {
        const randomPages = await getRandomArticles(count);
        const articles: string[] = [];

        for (const page of randomPages) {
          try {
            const { wikitext, title } = await getArticleWikitext(page.title);
            const parsed = parseWikitext(wikitext, title);
            const entry = [`### ${title}`, parsed.summary].join('\n\n');
            articles.push(entry);
          } catch {
            articles.push(`### ${page.title}\n\n*Could not load article.*`);
          }
        }

        const text = withAttribution(
          `## Random Memory Alpha Articles\n\n${articles.join('\n\n---\n\n')}`
        );
        return { content: [{ type: 'text' as const, text }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error fetching random articles from Memory Alpha: ${msg}` }] };
      }
    }
  );
}
