import { z } from 'zod';
import { getArticleWikitext } from '../api/parse.js';
import { searchArticles } from '../api/search.js';
import { parseWikitext } from '../parser/wikitext.js';
import { withAttribution } from '../utils/attribution.js';
import { truncate } from '../utils/text.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const LANGUAGE_ARTICLES: Record<string, string> = {
  klingon: 'Klingonese',
  vulcan: 'Vulcan language',
  ferengi: 'Ferengi language',
  romulan: 'Romulan language',
  bajoran: 'Bajoran language',
  cardassian: 'Cardassian language',
  dominion: 'Dominionese',
};

export function registerAlienPhrasesTool(server: McpServer): void {
  server.tool(
    'alien_phrases',
    'Look up phrases and vocabulary from Star Trek alien languages (Klingon, Vulcan, Ferengi, etc.)',
    {
      language: z.string().max(200).describe('Alien language (e.g. "Klingon", "Vulcan", "Ferengi", "Romulan")'),
    },
    async ({ language }) => {
      try {
        const articleTitle = LANGUAGE_ARTICLES[language.toLowerCase()] ?? `${language} language`;

        try {
          const { wikitext, title } = await getArticleWikitext(articleTitle);
          const parsed = parseWikitext(wikitext, title);

          const text = withAttribution(
            `## ${title}\n\n${truncate(parsed.fullText, 3500)}`
          );
          return { content: [{ type: 'text' as const, text }] };
        } catch {
          // Fallback: search for the language
          const results = await searchArticles(`${language} language words phrases`, 5);
          if (results.length > 0) {
            const list = results.map(r => `- **${r.title}**`).join('\n');
            return { content: [{ type: 'text' as const, text: withAttribution(`## ${language} Language\n\nNo dedicated article found. Related results:\n\n${list}`) }] };
          }
          return { content: [{ type: 'text' as const, text: `No information found about the ${language} language on Memory Alpha.` }] };
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error looking up alien phrases for "${language}": ${msg}` }] };
      }
    }
  );
}
