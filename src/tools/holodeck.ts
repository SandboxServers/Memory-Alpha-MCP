import { z } from 'zod';
import { withAttribution } from '../utils/attribution.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerHolodeckTool(server: McpServer): void {
  server.tool(
    'holodeck_program',
    'Generate a Star Trek holodeck program designation, safety assessment, and malfunction probability',
    {
      scenario: z.string().max(1000).describe('Describe the desired holodeck scenario (e.g. "A noir detective mystery in 1940s San Francisco")'),
      safety_protocols: z.boolean().default(true).describe('Whether safety protocols are enabled (default: true)'),
    },
    async ({ scenario, safety_protocols }) => {
      try {
        const program = generateProgram(scenario, safety_protocols);

        const parts: string[] = [
          `## Holodeck Program Loaded`,
          `**Program:** ${program.designation}`,
          `**Classification:** ${program.classification}`,
          `**Safety Protocols:** ${safety_protocols ? 'ENABLED' : '**DISABLED** (Warning: Starfleet Regulation 7.31 requires authorization from a senior officer)'}`,
          `**Malfunction Probability:** ${program.malfunctionPct}%`,
          `**Holoemitter Load:** ${program.complexity}`,
          '',
          `### Program Description`,
          program.description,
          '',
          `### Environmental Parameters`,
          program.parameters.map(p => `- ${p}`).join('\n'),
          '',
          `### Safety Assessment`,
          program.safetyAssessment,
          '',
          `### Known Risks`,
          program.risks.map(r => `- ${r}`).join('\n'),
          '',
          `*${program.disclaimer}*`,
        ];

        return { content: [{ type: 'text' as const, text: withAttribution(parts.join('\n')) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error generating holodeck program: ${msg}` }] };
      }
    }
  );
}

interface HolodeckProgram {
  designation: string;
  classification: string;
  description: string;
  malfunctionPct: number;
  complexity: string;
  parameters: string[];
  safetyAssessment: string;
  risks: string[];
  disclaimer: string;
}

function generateProgram(scenario: string, safetyProtocols: boolean): HolodeckProgram {
  const lower = scenario.toLowerCase();

  // Generate designation
  const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Theta', 'Omega'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  const designation = `Holodeck Program ${prefix}-${num}`;

  // Classify the program
  let classification = 'Recreation';
  if (lower.includes('training') || lower.includes('combat') || lower.includes('tactical')) classification = 'Training Simulation';
  else if (lower.includes('mystery') || lower.includes('detective') || lower.includes('adventure')) classification = 'Interactive Narrative';
  else if (lower.includes('relax') || lower.includes('beach') || lower.includes('vacation')) classification = 'Relaxation';
  else if (lower.includes('historical') || lower.includes('history') || lower.includes('century')) classification = 'Historical Recreation';
  else if (lower.includes('sport') || lower.includes('game') || lower.includes('competition')) classification = 'Athletic Competition';

  // Calculate malfunction probability
  let malfunctionPct = 12; // Base malfunction rate (surprisingly high for Federation tech)
  if (!safetyProtocols) malfunctionPct += 35;
  if (lower.includes('sentien') || lower.includes('conscious') || /\bartificial intelligence\b|\bai\b/.test(lower)) malfunctionPct += 25;
  if (lower.includes('villain') || lower.includes('enemy') || lower.includes('moriarty')) malfunctionPct += 20;
  if (lower.includes('simple') || lower.includes('basic') || lower.includes('relax')) malfunctionPct -= 8;
  if (lower.includes('combat') || lower.includes('weapon') || lower.includes('battle')) malfunctionPct += 15;
  malfunctionPct = Math.max(3, Math.min(98, malfunctionPct));

  // Complexity
  const complexity = malfunctionPct > 60 ? 'EXTREME (multiple holoemitter arrays at maximum capacity)'
    : malfunctionPct > 40 ? 'HIGH (significant holomatrix processing required)'
    : malfunctionPct > 20 ? 'MODERATE (standard holoemitter load)'
    : 'LOW (minimal holomatrix resources)';

  // Generate parameters
  const parameters: string[] = [
    `**Setting:** ${scenario}`,
    `**Photon count:** ${(Math.floor(Math.random() * 900) + 100).toLocaleString()} million`,
    `**Force field matrix:** ${safetyProtocols ? 'Active (impact dampening enabled)' : 'Unrestricted (full contact enabled)'}`,
    `**Character AI level:** ${malfunctionPct > 40 ? 'Advanced neural patterns' : 'Standard behavioral subroutines'}`,
  ];

  if (lower.includes('outdoor') || lower.includes('planet') || lower.includes('nature') || lower.includes('forest') || lower.includes('beach')) {
    parameters.push('**Weather simulation:** Active');
    parameters.push(`**Atmospheric mix:** Earth-standard (adjustable)`);
  }

  // Safety assessment
  let safetyAssessment: string;
  if (!safetyProtocols) {
    safetyAssessment = 'WARNING: Safety protocols DISABLED. All injuries will be real. Holographic weapons will cause actual damage. The Chief Medical Officer has been notified and is standing by. This is a terrible idea and everyone knows it.';
  } else if (malfunctionPct > 50) {
    safetyAssessment = 'CAUTION: Program complexity creates elevated malfunction risk. Recommend limiting session to 2 hours. Keep a combadge active at all times. Consider having Engineering on standby.';
  } else if (malfunctionPct > 25) {
    safetyAssessment = 'MODERATE RISK: Standard safety protocols should be sufficient. Minor glitches possible but non-threatening. Report any sentient holographic characters immediately.';
  } else {
    safetyAssessment = 'LOW RISK: Simple program within normal holodeck parameters. Enjoy your session. Try not to fall in love with any holograms.';
  }

  // Risks
  const risks: string[] = [];
  if (!safetyProtocols) risks.push('Physical injury or death (safety protocols disabled)');
  if (malfunctionPct > 30) risks.push('Holographic character gaining sentience (it happens more than you\'d think)');
  if (lower.includes('villain') || lower.includes('moriarty')) risks.push('Antagonist exceeding programmed parameters');
  if (lower.includes('historical')) risks.push('Accidental temporal contamination (theoretical)');
  risks.push('Holodeck addiction (see: Lt. Barclay, Reginald)');
  risks.push('Arch failing to appear when you say "Computer, exit"');
  if (malfunctionPct > 50) risks.push('Program refusing to end (classic holodeck failure mode)');

  const disclaimers = [
    'Starfleet assumes no liability for injuries sustained during holodeck use. Seriously, have you READ the incident reports?',
    'If the holodeck characters start asking questions about the nature of their reality, end the program immediately and contact Engineering.',
    'Remember: what happens on the holodeck stays on the holodeck. Except when it doesn\'t. Which is alarmingly often.',
    'The holodeck has a better survival rate than away missions, but that\'s a very low bar.',
  ];

  return {
    designation,
    classification,
    description: `An immersive holographic recreation: ${scenario}. Program utilizes ${malfunctionPct > 40 ? 'advanced' : 'standard'} character AI and environmental simulation.`,
    malfunctionPct,
    complexity,
    parameters,
    safetyAssessment,
    risks,
    disclaimer: disclaimers[Math.floor(Math.random() * disclaimers.length)],
  };
}
