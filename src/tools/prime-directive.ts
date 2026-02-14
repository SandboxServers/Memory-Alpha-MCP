import { z } from 'zod';
import { getArticleWikitext } from '../api/parse.js';
import { parseWikitext } from '../parser/wikitext.js';
import { withAttribution } from '../utils/attribution.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerPrimeDirectiveTool(server: McpServer): void {
  server.tool(
    'prime_directive_check',
    'Evaluate whether an action violates the Prime Directive, with a humorous Starfleet assessment',
    {
      action: z.string().max(1000).describe('The action to evaluate (e.g. "Giving warp technology to a pre-warp civilization")'),
    },
    async ({ action }) => {
      try {
        // Fetch Prime Directive article for context
        let pdContext = '';
        try {
          const { wikitext } = await getArticleWikitext('Prime Directive');
          const parsed = parseWikitext(wikitext, 'Prime Directive');
          pdContext = parsed.summary;
        } catch {
          pdContext = 'The Prime Directive prohibits Starfleet from interfering with the natural development of alien civilizations.';
        }

        // Generate humorous assessment
        const violationScore = computeViolationScore(action);
        const rating = getViolationRating(violationScore);
        const precedent = getKirkPrecedent(violationScore);

        const assessment = [
          `## Prime Directive Assessment`,
          `**Action Under Review:** ${action}`,
          `**Violation Probability:** ${violationScore}%`,
          `**Threat Level:** ${rating.level}`,
          `**Assessment:** ${rating.assessment}`,
          `**Historical Precedent:** ${precedent}`,
          '',
          `### What is the Prime Directive?`,
          pdContext,
        ].join('\n\n');

        return { content: [{ type: 'text' as const, text: withAttribution(assessment) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error performing Prime Directive assessment: ${msg}` }] };
      }
    }
  );
}

function computeViolationScore(action: string): number {
  const lowerAction = action.toLowerCase();
  let score = 30; // base

  const highRiskTerms = ['technology', 'warp', 'weapon', 'interfere', 'reveal', 'identity', 'cure', 'disease'];
  const mediumRiskTerms = ['help', 'assist', 'contact', 'communicate', 'trade', 'share'];
  const lowRiskTerms = ['observe', 'study', 'scan', 'monitor', 'record'];

  for (const term of highRiskTerms) {
    if (lowerAction.includes(term)) score += 15;
  }
  for (const term of mediumRiskTerms) {
    if (lowerAction.includes(term)) score += 8;
  }
  for (const term of lowRiskTerms) {
    if (lowerAction.includes(term)) score -= 10;
  }

  if (lowerAction.includes('pre-warp') || lowerAction.includes('primitive')) score += 20;
  if (lowerAction.includes('natural development')) score += 15;

  return Math.max(0, Math.min(100, score));
}

function getViolationRating(score: number): { level: string; assessment: string } {
  if (score >= 80) return { level: 'RED ALERT', assessment: 'Clear violation. Expect a court martial and a very stern look from Admiral Nechayev.' };
  if (score >= 60) return { level: 'YELLOW ALERT', assessment: 'Probable violation. Captain Kirk would do it anyway. Captain Picard would agonize about it for the whole episode.' };
  if (score >= 40) return { level: 'CAUTION', assessment: 'Gray area. Recommend consulting your ship\'s counselor and a good Starfleet lawyer.' };
  if (score >= 20) return { level: 'LOW RISK', assessment: 'Probably fine. Even Worf wouldn\'t object (much).' };
  return { level: 'ALL CLEAR', assessment: 'No violation detected. Carry on, Ensign.' };
}

function getKirkPrecedent(score: number): string {
  if (score >= 70) return 'Captain Kirk violated the Prime Directive approximately 9 times. He was promoted to Admiral. Make of that what you will.';
  if (score >= 40) return 'Captain Janeway once bent the Prime Directive so far it nearly snapped. She still made it home.';
  return 'Even Captain Picard would approve. And he once let an entire civilization die rather than violate the Prime Directive. (See: "Homeward", "Pen Pals")';
}
