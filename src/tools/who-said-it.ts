import { z } from 'zod';
import { getArticleWikitext } from '../api/parse.js';
import { getRandomArticles } from '../api/random.js';
import { extractSection } from '../parser/sections.js';
import { withAttribution } from '../utils/attribution.js';
import { shuffle } from '../utils/shuffle.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const FAMOUS_CHARACTERS = [
  'Jean-Luc Picard', 'James T. Kirk', 'Spock', 'Data (android)',
  'Worf', 'Benjamin Sisko', 'Kathryn Janeway', 'Leonard McCoy',
  'Seven of Nine', 'Quark (Star Trek)', 'Odo (Star Trek)',
];

export function registerWhoSaidItTool(server: McpServer): void {
  server.tool(
    'who_said_it',
    'Quote attribution challenge - guess which Star Trek character said it',
    {
      difficulty: z.enum(['easy', 'medium', 'hard']).default('medium').describe('Difficulty level'),
    },
    async ({ difficulty }) => {
      try {
        // Try to find quotes from character or episode articles
        let candidates: string[];
        if (difficulty === 'hard') {
          // For hard mode, mix random articles with a few known characters for better hit rate
          const random = (await getRandomArticles(3)).map(p => p.title);
          const known = shuffle([...FAMOUS_CHARACTERS]).slice(0, 2);
          candidates = shuffle([...random, ...known]);
        } else {
          candidates = shuffle([...FAMOUS_CHARACTERS]).slice(0, 5);
        }

        let quote: string | null = null;
        let source = '';

        for (const candidate of candidates) {
          try {
            const { wikitext, title } = await getArticleWikitext(candidate);
            const quotesSection = extractSection(wikitext, 'Memorable quotes') ??
              extractSection(wikitext, 'Quotes');
            if (quotesSection && quotesSection.length > 20) {
              // Extract individual quotes (lines starting with " or containing quoted text)
              const lines = quotesSection.split('\n').filter(l =>
                l.includes('"') && l.trim().length > 20 && l.trim().length < 300
              );
              if (lines.length > 0) {
                const line = lines[Math.floor(Math.random() * lines.length)];
                quote = line.replace(/^[*:\s]+/, '').trim();
                source = title;
                break;
              }
            }
          } catch {
            continue;
          }
        }

        if (!quote) {
          return { content: [{ type: 'text' as const, text: 'Could not find a suitable quote. Try again!' }] };
        }

        // Create decoy options
        const decoys = shuffle([...FAMOUS_CHARACTERS].filter(c => c !== source))
          .slice(0, 3)
          .map(c => c.replace(/ \(.*\)/, ''));

        const cleanSource = source.replace(/ \(.*\)/, '');
        const options = shuffle([cleanSource, ...decoys]);

        const letters = ['A', 'B', 'C', 'D'];
        const correctIdx = options.indexOf(cleanSource);

        const challenge = [
          `## Who Said It? (${difficulty})`,
          `> ${quote}`,
          options.map((o, i) => `${letters[i]}) ${o}`).join('\n'),
          `||Answer: ${letters[correctIdx]}) ${cleanSource}||`,
        ].join('\n\n');

        return { content: [{ type: 'text' as const, text: withAttribution(challenge) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error generating "Who Said It?" challenge: ${msg}` }] };
      }
    }
  );
}
