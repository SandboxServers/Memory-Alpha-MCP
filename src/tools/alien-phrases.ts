import { z } from 'zod';
import { getArticleWikitext } from '../api/parse.js';
import { searchArticles } from '../api/search.js';
import { parseWikitext } from '../parser/wikitext.js';
import { extractSection } from '../parser/sections.js';
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

const PHRASE_SECTION_NAMES = [
  'Common phrases',
  'Phrases',
  'Words and phrases',
  'Vocabulary',
  'Known words',
  'Known phrases',
  'Lexicon',
  'Terms',
  'Examples',
];

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

          const parts: string[] = [`## ${title}`];

          // Try to find a dedicated phrases/vocabulary section
          let phrasesFound = false;
          for (const sectionName of PHRASE_SECTION_NAMES) {
            const section = extractSection(wikitext, sectionName);
            if (section && section.length > 20) {
              parts.push(`### ${sectionName}\n${truncate(section, 2500)}`);
              phrasesFound = true;
              break;
            }
          }

          if (!phrasesFound) {
            // Fall back to full article text
            parts.push(truncate(parsed.fullText, 3500));
          } else {
            // Also include a brief summary
            parts.push(`### About\n${truncate(parsed.summary, 500)}`);
          }

          return { content: [{ type: 'text' as const, text: withAttribution(parts.join('\n\n')) }] };
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
