import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { getRandomArticles } from '../api/random.js';
import { getArticleWikitext } from '../api/parse.js';
import { parseWikitext } from '../parser/wikitext.js';
import { withAttribution } from '../utils/attribution.js';
import { shuffle } from '../utils/shuffle.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const FALLBACK_DECOYS = [
  'USS Yamato', 'Bajoran wormhole', 'Tholian Assembly', 'Dilithium recrystallization',
  'Plasma manifold', 'Khitomer Accords', 'Denevan neural parasite', 'Iconian gateway',
  'Risa', 'Daystrom Institute', 'Cardassian Union', 'Tarkalean tea',
  'Dabo', 'Jem\'Hadar', 'Bajoran Gratitude Festival', 'Vulcan nerve pinch',
];

interface TriviaQuestion {
  question_text: string;
  options: string[];
  answer_token: string;
  correct_answer: string;
}

export function registerStartTriviaGameTool(server: McpServer): void {
  server.tool(
    'start_trivia_game',
    'Generate a bundle of Star Trek trivia questions for a multi-player game session. Returns a game_id and question set. Clara should store game state in her session memory and track scores per player.',
    {
      num_questions: z.number().min(3).max(10).default(5).describe('Number of questions to generate (3-10)'),
      difficulty: z.enum(['easy', 'medium', 'hard']).default('medium').describe('Difficulty level'),
    },
    async ({ num_questions, difficulty }) => {
      try {
        const gameId = randomUUID().slice(0, 8);
        const fetchCount = Math.min(num_questions * 5, 40);
        const pages = await getRandomArticles(fetchCount);

        const articles: Array<{ title: string; summary: string }> = [];
        for (const page of pages) {
          try {
            const { wikitext, title } = await getArticleWikitext(page.title);
            const parsed = parseWikitext(wikitext, title);
            if (parsed.summary.length > 50) {
              articles.push({ title, summary: parsed.summary });
            }
          } catch {
            continue;
          }
          if (articles.length >= num_questions * 3) break;
        }

        if (articles.length < 4) {
          return { content: [{ type: 'text' as const, text: 'Could not generate enough trivia questions. Memory Alpha may be slow — try again.' }] };
        }

        const questions: TriviaQuestion[] = [];
        const usedTitles = new Set<string>();

        for (let q = 0; q < num_questions && q * 3 < articles.length; q++) {
          const idx = q * 3;
          const subject = articles[idx];
          if (usedTitles.has(subject.title)) continue;
          usedTitles.add(subject.title);

          const decoys: string[] = [];
          for (let d = 1; d <= 2 && idx + d < articles.length; d++) {
            if (!usedTitles.has(articles[idx + d].title) && articles[idx + d].title !== subject.title) {
              decoys.push(articles[idx + d].title);
            }
          }
          let fallbackIdx = 0;
          while (decoys.length < 3) {
            const candidate = FALLBACK_DECOYS[fallbackIdx % FALLBACK_DECOYS.length];
            fallbackIdx++;
            if (candidate !== subject.title && !decoys.includes(candidate)) {
              decoys.push(candidate);
            }
          }

          const answerToken = randomUUID().slice(0, 12);
          const options = shuffle([subject.title, ...decoys.slice(0, 3)]);
          const letters = ['A', 'B', 'C', 'D'];
          const correctIndex = options.indexOf(subject.title);

          const hint = difficulty === 'easy' ? `\n*Hint: ${subject.summary.slice(0, 100)}...*` : '';
          const clueLength = difficulty === 'hard' ? 100 : 200;

          questions.push({
            question_text: [
              `**Q${q + 1}.** Which Memory Alpha article does this describe?`,
              `"${subject.summary.slice(0, clueLength)}..."`,
              options.map((o, i) => `${letters[i]}) ${o}`).join('\n'),
              hint,
            ].join('\n\n'),
            options,
            answer_token: answerToken,
            correct_answer: `${letters[correctIndex]}) ${subject.title}`,
          });
        }

        if (questions.length === 0) {
          return { content: [{ type: 'text' as const, text: 'Could not generate trivia questions. Try again!' }] };
        }

        const gameOutput = [
          `## 🖖 Star Trek Trivia — Game ${gameId} (${difficulty})`,
          `**${questions.length} questions generated.** Present them one at a time and use \`check_trivia_answer\` to verify responses.`,
          '',
          '---',
          '',
          ...questions.map((q, i) => [
            q.question_text,
            `*Answer token: \`${q.answer_token}\` → ||${q.correct_answer}||*`,
            '',
          ].join('\n')),
        ].join('\n');

        return { content: [{ type: 'text' as const, text: withAttribution(gameOutput) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error starting trivia game: ${msg}` }] };
      }
    }
  );
}
