import { z } from 'zod';
import { withAttribution } from '../utils/attribution.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

interface CrewMember {
  name: string;
  role: string;
  specialty: string;
  survivalBonus: string;
}

const CREW_DATABASE: CrewMember[] = [
  { name: 'Commander Riker', role: 'Away Team Leader', specialty: 'Tactics, diplomacy, improvisation', survivalBonus: 'Plot armor (first officer)' },
  { name: 'Lt. Commander Data', role: 'Science/Operations', specialty: 'Analysis, computation, superhuman strength', survivalBonus: 'Android — immune to most hazards' },
  { name: 'Lt. Commander Worf', role: 'Security Chief', specialty: 'Combat, threat assessment, Klingon intimidation', survivalBonus: 'Klingon redundant organs' },
  { name: 'Lt. Commander La Forge', role: 'Chief Engineer', specialty: 'Engineering, repairs, technical improvisation', survivalBonus: 'VISOR detects anomalies others miss' },
  { name: 'Dr. Crusher', role: 'Chief Medical Officer', specialty: 'Medicine, xenobiology, field triage', survivalBonus: 'Can keep the team alive (literally)' },
  { name: 'Counselor Troi', role: 'Ship\'s Counselor', specialty: 'Empathy, sensing deception, psychology', survivalBonus: 'Detects hostile intent before contact' },
  { name: 'Lt. Commander Tuvok', role: 'Security/Tactical', specialty: 'Logic, Vulcan nerve pinch, infiltration', survivalBonus: 'Vulcan physiology + mental discipline' },
  { name: 'Seven of Nine', role: 'Science Specialist', specialty: 'Borg knowledge, nanoprobes, adaptation', survivalBonus: 'Borg implants + encyclopedic knowledge' },
  { name: 'Chief O\'Brien', role: 'Operations/Engineer', specialty: 'Repairs under fire, transporter expertise', survivalBonus: 'Survives everything (canonically unlucky but immortal)' },
  { name: 'Lt. Commander Jadzia Dax', role: 'Science Officer', specialty: '7 lifetimes of experience, diplomacy, combat', survivalBonus: 'Trill symbiont wisdom' },
  { name: 'Ensign Expendable', role: 'Security', specialty: 'Drawing enemy fire', survivalBonus: 'None. Godspeed.' },
];

interface RoleRecommendation {
  role: string;
  reason: string;
  recommended: CrewMember;
}

export function registerAwayTeamTool(server: McpServer): void {
  server.tool(
    'away_team_builder',
    'Recommend an optimal away team composition for a mission based on crew specialties',
    {
      mission: z.string().max(1000).describe('Describe the mission (e.g. "Negotiate peace treaty with hostile species on a volcanic planet")'),
      team_size: z.number().min(2).max(6).default(4).describe('Number of team members (default: 4)'),
    },
    async ({ mission, team_size }) => {
      try {
        const roles = analyzeNeededRoles(mission);
        const team = selectTeam(roles, team_size);
        const risk = assessMissionRisk(mission);

        const parts: string[] = [
          `## Away Team Recommendation`,
          `**Mission:** ${mission}`,
          `**Team Size:** ${team_size}`,
          `**Mission Risk Level:** ${risk.level}`,
          '',
          `### Recommended Team`,
          ...team.map((r, i) => [
            `**${i + 1}. ${r.recommended.name}** — ${r.recommended.role}`,
            `   - *Why:* ${r.reason}`,
            `   - *Specialty:* ${r.recommended.specialty}`,
            `   - *Survival Edge:* ${r.recommended.survivalBonus}`,
          ].join('\n')),
          '',
          `### Mission Analysis`,
          `- **Required Capabilities:** ${roles.map(r => r.role).join(', ')}`,
          `- **Primary Threat:** ${risk.threat}`,
          `- **Recommended Equipment:** ${risk.equipment.join(', ')}`,
          `- **Red Shirt Requirement:** ${risk.redShirts}`,
          '',
          `*"${risk.captainQuote}"*`,
        ];

        return { content: [{ type: 'text' as const, text: withAttribution(parts.join('\n')) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error building away team: ${msg}` }] };
      }
    }
  );
}

function analyzeNeededRoles(mission: string): RoleRecommendation[] {
  const lower = mission.toLowerCase();
  const roles: RoleRecommendation[] = [];

  // Always need a leader
  roles.push({
    role: 'Away Team Leader',
    reason: 'Every away team needs someone in charge (preferably not the captain, but we know how that goes)',
    recommended: CREW_DATABASE[0], // Riker
  });

  if (lower.includes('hostile') || lower.includes('combat') || lower.includes('attack') || lower.includes('weapon') || lower.includes('war')) {
    roles.push({ role: 'Security', reason: 'Hostile threat detected — need someone who can fight', recommended: CREW_DATABASE[2] }); // Worf
  }

  if (lower.includes('negotiate') || lower.includes('diplomacy') || lower.includes('peace') || lower.includes('treaty') || lower.includes('first contact')) {
    roles.push({ role: 'Diplomat/Counselor', reason: 'Diplomatic mission requires empathic awareness and communication skills', recommended: CREW_DATABASE[5] }); // Troi
  }

  if (lower.includes('repair') || lower.includes('engineer') || lower.includes('technical') || lower.includes('power') || lower.includes('system')) {
    roles.push({ role: 'Engineer', reason: 'Technical challenges require engineering expertise', recommended: CREW_DATABASE[3] }); // La Forge
  }

  if (lower.includes('disease') || lower.includes('medical') || lower.includes('injured') || lower.includes('virus') || lower.includes('plague') || lower.includes('radiation')) {
    roles.push({ role: 'Medical Officer', reason: 'Medical threat present — need a doctor on site', recommended: CREW_DATABASE[4] }); // Crusher
  }

  if (lower.includes('scan') || lower.includes('analyz') || lower.includes('research') || lower.includes('anomaly') || lower.includes('scientific') || lower.includes('unknown')) {
    roles.push({ role: 'Science Officer', reason: 'Unknown phenomena require scientific analysis', recommended: CREW_DATABASE[1] }); // Data
  }

  if (lower.includes('borg') || lower.includes('assimilat')) {
    roles.push({ role: 'Borg Specialist', reason: 'Borg encounter — need someone who knows the Collective', recommended: CREW_DATABASE[7] }); // Seven
  }

  if (lower.includes('infiltrat') || lower.includes('stealth') || lower.includes('undercover') || lower.includes('spy')) {
    roles.push({ role: 'Infiltration Specialist', reason: 'Covert mission requires stealth and discipline', recommended: CREW_DATABASE[6] }); // Tuvok
  }

  // Ensure at least 2 roles beyond leader
  if (roles.length < 2) {
    roles.push({ role: 'Science Officer', reason: 'Standard away team protocol requires a science officer', recommended: CREW_DATABASE[1] });
  }
  if (roles.length < 3) {
    roles.push({ role: 'Security', reason: 'Standard protocol: always bring security', recommended: CREW_DATABASE[2] });
  }

  return roles;
}

function selectTeam(roles: RoleRecommendation[], size: number): RoleRecommendation[] {
  // Deduplicate by crew member
  const seen = new Set<string>();
  const unique: RoleRecommendation[] = [];
  for (const r of roles) {
    if (!seen.has(r.recommended.name)) {
      seen.add(r.recommended.name);
      unique.push(r);
    }
  }

  // Trim to size, filling with expendables if needed
  while (unique.length > size) unique.pop();
  while (unique.length < size) {
    unique.push({
      role: 'Security Escort',
      reason: 'Standard away team protocol. Someone has to check behind the rocks.',
      recommended: CREW_DATABASE[CREW_DATABASE.length - 1], // Ensign Expendable
    });
  }

  return unique;
}

function assessMissionRisk(mission: string): { level: string; threat: string; equipment: string[]; redShirts: string; captainQuote: string } {
  const lower = mission.toLowerCase();
  let riskScore = 3;

  if (lower.includes('hostile') || lower.includes('combat')) riskScore += 3;
  if (lower.includes('unknown') || lower.includes('uncharted')) riskScore += 2;
  if (lower.includes('volcanic') || lower.includes('radiation') || lower.includes('toxic')) riskScore += 2;
  if (lower.includes('borg')) riskScore += 4;
  if (lower.includes('negotiate') || lower.includes('diplomatic')) riskScore -= 1;
  if (lower.includes('planet') || lower.includes('surface')) riskScore += 1;

  const level = riskScore >= 8 ? 'EXTREME' : riskScore >= 6 ? 'HIGH' : riskScore >= 4 ? 'MODERATE' : 'LOW';

  const threats = ['Environmental hazards', 'Hostile forces', 'Unknown phenomena', 'Technical failure', 'Alien wildlife', 'Communication interference'];
  const threat = riskScore >= 6 ? 'Multiple simultaneous threats likely' : threats[riskScore % threats.length];

  const equipment = ['Type-2 phasers', 'Tricorders'];
  if (riskScore >= 4) equipment.push('Pattern enhancers');
  if (riskScore >= 6) equipment.push('Phaser rifles', 'Emergency transport armbands');
  if (lower.includes('radiation') || lower.includes('toxic')) equipment.push('Environmental suits');
  if (lower.includes('medical') || lower.includes('disease')) equipment.push('Field medical kits');

  const redShirts = riskScore >= 8 ? 'Mandatory. Bring extras.'
    : riskScore >= 6 ? 'Recommended. They know what they signed up for.'
    : riskScore >= 4 ? 'Optional, but they add a comforting buffer.'
    : 'Unnecessary. Save them for a deadlier mission.';

  const quotes = [
    'Make it so. — Picard',
    'Energize. — Every captain ever',
    'I have a bad feeling about this. — Wrong franchise, but still applicable',
    'Today is a good day to die. — Worf (he says this a LOT)',
    'Resistance is futile. — The Borg (not encouraging)',
  ];
  const captainQuote = quotes[riskScore % quotes.length];

  return { level, threat, equipment, redShirts, captainQuote };
}
