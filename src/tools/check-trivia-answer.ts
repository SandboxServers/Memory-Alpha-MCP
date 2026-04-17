import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const CORRECT_RESPONSES = [
  'Correct! Your knowledge of the Alpha Quadrant is impressive, Ensign.',
  'Indeed. That is the correct answer. Fascinating.',
  'Correct! Starfleet Academy would be proud.',
  'Well done! You clearly paid attention during your Starfleet briefings.',
  'That\'s correct! Qapla\'! Today IS a good day to answer trivia.',
  'Right you are! Even Commander Data would approve of your accuracy.',
  'Correct! The Prophets smile upon your wisdom.',
  'Precisely! As Captain Picard would say: "Excellent work, Number One."',
];

const INCORRECT_RESPONSES = [
  'Incorrect. Perhaps you should spend more time in the ship\'s library.',
  'Negative. That answer does not compute. The correct answer was: {answer}.',
  'Wrong! Even a Pakled would have known that. The answer is: {answer}.',
  'Incorrect, Ensign. Report to Holodeck 3 for remedial training. Answer: {answer}.',
  'That is... not correct. As Spock would say: "Fascinating, but wrong." The answer: {answer}.',
  'Nope! The Borg would have assimilated that knowledge by now. Answer: {answer}.',
  'Incorrect. Dr. McCoy would say "Dammit Jim, the answer was {answer}!"',
  'Wrong answer! But as Captain Janeway would say, "There\'s always another way." Answer: {answer}.',
];

export function registerCheckTriviaAnswerTool(server: McpServer): void {
  server.tool(
    'check_trivia_answer',
    'Check a player\'s trivia answer against the correct answer. Fully stateless — Clara passes the correct answer token and the player\'s response.',
    {
      player_answer: z.string().max(500).describe('The player\'s answer (letter or full text)'),
      correct_answer: z.string().max(500).describe('The correct answer string (from start_trivia_game output)'),
      player_name: z.string().max(100).optional().describe('Player name for personalized response'),
    },
    async ({ player_answer, correct_answer, player_name }) => {
      const normalizedPlayer = player_answer.trim().toLowerCase();
      const normalizedCorrect = correct_answer.trim().toLowerCase();

      // Extract just the letter if the correct answer is in "A) Title" format
      const correctLetter = normalizedCorrect.match(/^([a-d])\)/)?.[1];
      const correctTitle = normalizedCorrect.replace(/^[a-d]\)\s*/i, '').trim().toLowerCase();

      const isCorrect =
        normalizedPlayer === normalizedCorrect ||
        normalizedPlayer === correctLetter ||
        normalizedPlayer === correctTitle ||
        normalizedPlayer.replace(/[^a-z0-9]/g, '') === correctTitle.replace(/[^a-z0-9]/g, '');

      const playerLabel = player_name ? `, ${player_name}` : '';

      if (isCorrect) {
        const response = CORRECT_RESPONSES[Math.floor(Math.random() * CORRECT_RESPONSES.length)];
        return { content: [{ type: 'text' as const, text: `✅ **Correct${playerLabel}!** ${response}` }] };
      } else {
        const template = INCORRECT_RESPONSES[Math.floor(Math.random() * INCORRECT_RESPONSES.length)];
        const response = template.replace(/\{answer\}/g, correct_answer);
        return { content: [{ type: 'text' as const, text: `❌ **Incorrect${playerLabel}.** ${response}` }] };
      }
    }
  );
}
