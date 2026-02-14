import { z } from 'zod';
import { withAttribution } from '../utils/attribution.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerRedShirtTool(server: McpServer): void {
  server.tool(
    'red_shirt_analysis',
    'Assess survival odds in classic Trek redshirt style - because someone has to be the away team expendable',
    {
      description: z.string().max(1000).describe('Describe the mission or situation (e.g. "Exploring an uncharted planet with strange energy readings")'),
    },
    async ({ description }) => {
      try {
        const risk = analyzeRisk(description);

        const assessment = [
          `## Red Shirt Risk Assessment`,
          `**Mission:** ${description}`,
          `**Survival Probability:** ${risk.survival}%`,
          `**Risk Rating:** ${risk.rating}`,
          `**Cause of Probable Demise:** ${risk.cause}`,
          `**Recommendation:** ${risk.recommendation}`,
          `**Last Words Likelihood:** "${risk.lastWords}"`,
          '',
          `### Risk Factors`,
          risk.factors.map(f => `- ${f}`).join('\n'),
          '',
          `*Based on analysis of ${Math.floor(Math.random() * 50 + 20)} historical Starfleet away missions.*`,
        ].join('\n\n');

        return { content: [{ type: 'text' as const, text: withAttribution(assessment) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error performing red shirt analysis: ${msg}` }] };
      }
    }
  );
}

interface RiskResult {
  survival: number;
  rating: string;
  cause: string;
  recommendation: string;
  lastWords: string;
  factors: string[];
}

function analyzeRisk(description: string): RiskResult {
  const lower = description.toLowerCase();
  let survival = 70;
  const factors: string[] = [];

  if (lower.includes('unknown') || lower.includes('uncharted') || lower.includes('unexplored')) {
    survival -= 20; factors.push('Unknown territory: +20% risk');
  }
  if (lower.includes('energy') || lower.includes('radiation') || lower.includes('anomaly')) {
    survival -= 15; factors.push('Anomalous energy readings: +15% risk');
  }
  if (lower.includes('planet') || lower.includes('surface')) {
    survival -= 10; factors.push('Planetary surface mission: +10% risk');
  }
  if (lower.includes('hostile') || lower.includes('enemy') || lower.includes('klingon') || lower.includes('romulan')) {
    survival -= 25; factors.push('Hostile presence: +25% risk');
  }
  if (lower.includes('captain') || lower.includes('commander')) {
    survival += 15; factors.push('Senior officer present: -15% risk (they have plot armor)');
  }
  if (lower.includes('alone') || lower.includes('solo') || lower.includes('separated')) {
    survival -= 30; factors.push('Alone/separated from team: +30% risk (CRITICAL)');
  }
  if (lower.includes('cave') || lower.includes('tunnel')) {
    survival -= 15; factors.push('Underground location: +15% risk');
  }
  if (lower.includes('negotiate') || lower.includes('diplomatic')) {
    survival += 10; factors.push('Diplomatic mission: -10% risk');
  }
  if (lower.includes('engineering') || lower.includes('repair')) {
    survival -= 5; factors.push('Engineering task: +5% risk (plasma conduits are unpredictable)');
  }

  if (factors.length === 0) {
    factors.push('Standard away mission parameters: baseline risk');
  }

  survival = Math.max(5, Math.min(95, survival));

  const rating = survival >= 80 ? 'GREEN (Relatively Safe)'
    : survival >= 60 ? 'YELLOW (Moderate Risk)'
    : survival >= 40 ? 'ORANGE (High Risk - Update your will)'
    : survival >= 20 ? 'RED (Extreme Risk - Say goodbye to loved ones)'
    : 'CRIMSON (Basically a death sentence - Why did you even beam down?)';

  const causes = [
    'Disintegration by unknown energy weapon',
    'Mysterious alien virus',
    'Eaten by silicon-based life form',
    'Absorbed into collective consciousness',
    'Temporal paradox erasure',
    'Transporter malfunction',
    'Phaser overload',
    'Rock monster encounter',
    'Holodeck safety protocol failure',
    'Salt vampire attack',
  ];

  const lastWordsOptions = [
    "Captain, I'm detecting something str—",
    "What's that noi—",
    "It seems perfectly saf—",
    "I'll go check it out alone, what could go wr—",
    "The readings are off the sca—",
    "Sir, I don't think we're alo—",
  ];

  const recommendations = survival >= 60
    ? 'Proceed with standard caution. Keep your phaser set to stun and stay with the group.'
    : survival >= 30
    ? 'Strongly recommend sending a probe first. If you must go, bring extra security and update your Starfleet life insurance.'
    : 'Do NOT beam down. Send a probe. If Kirk orders you to go anyway, fake a transporter malfunction.';

  return {
    survival,
    rating,
    cause: causes[Math.floor(Math.random() * causes.length)],
    recommendation: recommendations,
    lastWords: lastWordsOptions[Math.floor(Math.random() * lastWordsOptions.length)],
    factors,
  };
}
