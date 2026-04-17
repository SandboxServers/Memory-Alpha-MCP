import { z } from 'zod';
import { withAttribution } from '../utils/attribution.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const FACTIONS = [
  'Federation', 'Klingon Empire', 'Romulan Star Empire', 'Cardassian Union',
  'Dominion', 'Borg Collective', 'Ferengi Alliance', 'Tholian Assembly',
  'Breen Confederacy', 'Bajoran Republic', 'Vulcan', 'Andorian Empire',
  'Orion Syndicate', 'Gorn Hegemony', 'Xindi Council',
];

interface FactionTraits {
  style: string;
  priority: string;
  weakness: string;
  opening: string;
}

const FACTION_TRAITS: Record<string, FactionTraits> = {
  'Federation': { style: 'Diplomatic, principled', priority: 'Peaceful coexistence, mutual benefit', weakness: 'Idealism can be exploited', opening: 'We come in peace and seek mutual understanding.' },
  'Klingon Empire': { style: 'Direct, honor-bound', priority: 'Honor, territory, warrior glory', weakness: 'Pride can be manipulated', opening: 'Speak plainly or not at all. We have no patience for deception.' },
  'Romulan Star Empire': { style: 'Deceptive, calculating', priority: 'Security, intelligence superiority', weakness: 'Paranoia creates blind spots', opening: 'How... interesting that you wish to negotiate. We are listening.' },
  'Cardassian Union': { style: 'Bureaucratic, interrogative', priority: 'Order, territorial expansion', weakness: 'Rigidity, resource dependency', opening: 'The Cardassian Union is always open to... arrangements.' },
  'Dominion': { style: 'Authoritarian, absolute', priority: 'Order through control', weakness: 'Underestimates individuality', opening: 'The Founders have authorized this discussion. Do not waste our time.' },
  'Ferengi Alliance': { style: 'Transactional, shrewd', priority: 'Profit above all', weakness: 'Greed is predictable', opening: 'Let\'s talk terms. Everything has a price — even peace.' },
};

export function registerDiplomaticScenarioTool(server: McpServer): void {
  server.tool(
    'diplomatic_scenario',
    'Generate a Star Trek diplomatic negotiation scenario between two factions, with positions, demands, and leverage points',
    {
      faction_a: z.string().max(200).describe('First faction (e.g. "Federation", "Klingon Empire")'),
      faction_b: z.string().max(200).describe('Second faction (e.g. "Romulan Star Empire", "Cardassian Union")'),
      dispute: z.string().max(500).optional().describe('Optional: the subject of the dispute (e.g. "contested border system", "trade route access")'),
    },
    async ({ faction_a, faction_b, dispute }) => {
      try {
        const traitsA = FACTION_TRAITS[faction_a] ?? { style: 'Unknown', priority: 'Unknown', weakness: 'Unknown', opening: 'We are here to negotiate.' };
        const traitsB = FACTION_TRAITS[faction_b] ?? { style: 'Unknown', priority: 'Unknown', weakness: 'Unknown', opening: 'State your terms.' };

        const disputes = [
          'a contested star system rich in dilithium deposits',
          'access to a newly discovered stable wormhole',
          'the fate of a pre-warp civilization caught between both territories',
          'a border incursion that may or may not have been authorized',
          'the extradition of a political dissident',
          'trade route access through a demilitarized zone',
          'salvage rights to a derelict vessel of unknown origin',
          'a joint response to a Borg incursion threatening both powers',
        ];
        const subject = dispute ?? disputes[Math.floor(Math.random() * disputes.length)];

        const parts = [
          `## Diplomatic Scenario: ${faction_a} vs. ${faction_b}`,
          `**Subject of Negotiation:** ${subject}`,
          '',
          `### ${faction_a}`,
          `- **Negotiation Style:** ${traitsA.style}`,
          `- **Core Priority:** ${traitsA.priority}`,
          `- **Vulnerability:** ${traitsA.weakness}`,
          `- **Opening Position:** "${traitsA.opening}"`,
          '',
          `### ${faction_b}`,
          `- **Negotiation Style:** ${traitsB.style}`,
          `- **Core Priority:** ${traitsB.priority}`,
          `- **Vulnerability:** ${traitsB.weakness}`,
          `- **Opening Position:** "${traitsB.opening}"`,
          '',
          `### Leverage Points`,
          `- ${faction_a} leverage: Knowledge of ${faction_b}'s vulnerability (${traitsB.weakness})`,
          `- ${faction_b} leverage: Knowledge of ${faction_a}'s vulnerability (${traitsA.weakness})`,
          `- Neutral ground: A Federation starbase or neutral planet could host talks`,
          `- Wild card: A third party (Ferengi mediator? Q interference?) could shift dynamics`,
          '',
          `### Possible Outcomes`,
          `1. **Treaty** — Both sides compromise; a formal agreement is drafted`,
          `2. **Cold War** — Talks break down; both sides fortify positions`,
          `3. **Alliance** — A mutual threat forces cooperation`,
          `4. **Conflict** — Negotiations fail; military engagement follows`,
          '',
          `*"Diplomacy is the art of saying 'nice doggy' until you can find a rock." — Will Rogers (frequently quoted by Kirk)*`,
        ];

        return { content: [{ type: 'text' as const, text: withAttribution(parts.join('\n')) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error generating diplomatic scenario: ${msg}` }] };
      }
    }
  );
}
