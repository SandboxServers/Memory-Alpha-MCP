import { z } from 'zod';
import { getRandomArticles } from '../api/random.js';
import { getArticleWikitext } from '../api/parse.js';
import { parseWikitext } from '../parser/wikitext.js';
import { withAttribution } from '../utils/attribution.js';
import { shuffle } from '../utils/shuffle.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerTriviaTool(server: McpServer): void {
  server.tool(
    'trivia_quiz',
    'Generate a Star Trek trivia question from random Memory Alpha facts',
    {
      difficulty: z.enum(['easy', 'medium', 'hard']).default('medium').describe('Difficulty level'),
    },
    async ({ difficulty }) => {
      try {
        // Get random articles to generate trivia from
        const pages = await getRandomArticles(5);
        const articles: Array<{ title: string; summary: string; infobox: Record<string, string> | null }> = [];

        for (const page of pages) {
          try {
            const { wikitext, title } = await getArticleWikitext(page.title);
            const parsed = parseWikitext(wikitext, title);
            if (parsed.summary.length > 50) {
              articles.push({ title, summary: parsed.summary, infobox: parsed.infobox });
            }
          } catch {
            continue;
          }
          if (articles.length >= 3) break;
        }

        if (articles.length === 0) {
          return { content: [{ type: 'text' as const, text: 'Could not generate trivia. Try again!' }] };
        }

        const subject = articles[0];
        const decoys = articles.slice(1).map(a => a.title);
        while (decoys.length < 3) {
          decoys.push(`Unknown ${['Alpha', 'Beta', 'Gamma', 'Delta'][decoys.length]} entry`);
        }

        const hint = difficulty === 'easy' ? `\n\n*Hint: ${subject.summary.slice(0, 100)}...*` : '';
        const hardExtra = difficulty === 'hard' ? ' (No hints available - you\'re on your own, cadet!)' : '';

        // Shuffle options
        const options = shuffle([subject.title, ...decoys.slice(0, 3)]);
        const correctIndex = options.indexOf(subject.title);
        const letters = ['A', 'B', 'C', 'D'];

        const question = [
          `## Star Trek Trivia (${difficulty})${hardExtra}`,
          `**Which Memory Alpha article does this describe?**`,
          `"${subject.summary.slice(0, 200)}..."`,
          options.map((o, i) => `${letters[i]}) ${o}`).join('\n'),
          hint,
          `||Answer: ${letters[correctIndex]}) ${subject.title}||`,
        ].join('\n\n');

        return { content: [{ type: 'text' as const, text: withAttribution(question) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error generating trivia quiz: ${msg}` }] };
      }
    }
  );
}
