import { z } from 'zod';
import { getArticleWikitext } from '../api/parse.js';
import { parseWikitext } from '../parser/wikitext.js';
import { extractSidebarFromWikitext } from '../parser/infobox.js';
import { withAttribution } from '../utils/attribution.js';
import { formatKey } from '../utils/text.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerBattleSimulatorTool(server: McpServer): void {
  server.tool(
    'battle_simulator',
    'Pit two Star Trek ships against each other in a tactical analysis based on their specs',
    {
      ship1: z.string().max(500).describe('First ship (e.g. "USS Enterprise (NCC-1701-D)")'),
      ship2: z.string().max(500).describe('Second ship (e.g. "Borg cube")'),
    },
    async ({ ship1, ship2 }) => {
      try {
        const [data1, data2] = await Promise.all([
          fetchShipData(ship1),
          fetchShipData(ship2),
        ]);

        const score1 = computeCombatScore(data1.info);
        const score2 = computeCombatScore(data2.info);
        const total = score1 + score2 || 1;
        const pct1 = Math.round((score1 / total) * 100);
        const pct2 = 100 - pct1;

        const winner = pct1 > pct2 ? data1.title : pct2 > pct1 ? data2.title : null;

        const parts: string[] = [
          `## Battle Simulation: ${data1.title} vs ${data2.title}`,
          `### Tactical Assessment`,
          `| Metric | ${data1.title} | ${data2.title} |`,
          `|--------|${'-'.repeat(data1.title.length + 2)}|${'-'.repeat(data2.title.length + 2)}|`,
        ];

        // Add spec comparison rows
        const allKeys = new Set([
          ...Object.keys(data1.info),
          ...Object.keys(data2.info),
        ]);
        const combatKeys = [...allKeys].filter(k =>
          /armament|weapon|shield|speed|crew|length|mass|deck|torpedo|phaser|disruptor|defense/i.test(k)
        );
        for (const key of combatKeys) {
          const v1 = data1.info[key] ?? '—';
          const v2 = data2.info[key] ?? '—';
          parts.push(`| ${formatKey(key)} | ${v1.replace(/\|/g, '\\|')} | ${v2.replace(/\|/g, '\\|')} |`);
        }

        parts.push(
          '',
          `### Combat Probability`,
          `- **${data1.title}:** ${pct1}% chance of victory`,
          `- **${data2.title}:** ${pct2}% chance of victory`,
          '',
          winner
            ? `### Predicted Victor: **${winner}**`
            : `### Predicted Outcome: **Mutual Destruction** (evenly matched)`,
          '',
          generateBattleNarrative(data1.title, data2.title, pct1),
          '',
          `*Simulation based on known specifications. Actual results may vary depending on crew competence, plot armor, and whether the main characters are aboard.*`,
        );

        return { content: [{ type: 'text' as const, text: withAttribution(parts.join('\n')) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error running battle simulation: ${msg}` }] };
      }
    }
  );
}

interface ShipData {
  title: string;
  info: Record<string, string>;
}

async function fetchShipData(name: string): Promise<ShipData> {
  const { wikitext, title } = await getArticleWikitext(name);
  const parsed = parseWikitext(wikitext, title);
  const sidebar = extractSidebarFromWikitext(wikitext, 'starship') ??
    extractSidebarFromWikitext(wikitext, 'ship');
  return { title, info: sidebar ?? parsed.infobox ?? {} };
}

function computeCombatScore(info: Record<string, string>): number {
  let score = 50; // base
  const text = Object.values(info).join(' ').toLowerCase();

  // Weapons
  const phaserCount = (text.match(/phaser/g) || []).length;
  const torpedoCount = (text.match(/torpedo/g) || []).length;
  const disruptorCount = (text.match(/disruptor/g) || []).length;
  score += phaserCount * 8 + torpedoCount * 10 + disruptorCount * 9;

  // Shields
  if (text.includes('shield')) score += 15;
  if (text.includes('ablative')) score += 20;
  if (text.includes('regenerative')) score += 18;

  // Speed
  if (text.includes('warp 9') || text.includes('warp nine')) score += 10;
  if (text.includes('transwarp')) score += 25;
  if (text.includes('slipstream')) score += 25;

  // Size/crew indicators
  const crewMatch = text.match(/(\d{3,})\s*(?:crew|personnel|complement)/);
  if (crewMatch) score += Math.min(parseInt(crewMatch[1], 10) / 50, 30);

  // Special capabilities
  if (text.includes('cloak')) score += 20;
  if (text.includes('borg')) score += 30;
  if (text.includes('quantum torpedo')) score += 15;

  return score;
}

function generateBattleNarrative(ship1: string, ship2: string, pct1: number): string {
  if (pct1 > 75) {
    return `### Battle Narrative\n*The ${ship1} decloaks off the port bow of the ${ship2}, unleashing a devastating volley. The engagement is brief. Starfleet Academy will study this encounter for generations — as an example of what not to fly against.*`;
  }
  if (pct1 > 55) {
    return `### Battle Narrative\n*A tense engagement unfolds as both vessels exchange fire. The ${ship1} gains the advantage through superior firepower, executing a textbook Picard Maneuver to deliver the decisive blow. The ${ship2} limps away, trailing plasma.*`;
  }
  if (pct1 > 45) {
    return `### Battle Narrative\n*An evenly matched slugfest. Both ships take heavy damage, shields failing, hull breaches on multiple decks. The outcome depends entirely on which captain makes the more creative desperate gamble in the final moments.*`;
  }
  if (pct1 > 25) {
    return `### Battle Narrative\n*The ${ship2} demonstrates clear tactical superiority from the opening salvo. The ${ship1} fights valiantly but is outgunned. Their best hope: a creative engineering solution, a conveniently timed nebula, or a main character having a Really Good Idea.*`;
  }
  return `### Battle Narrative\n*The ${ship2} opens fire. The ${ship1}'s shields collapse almost immediately. It's less a battle and more a demonstration. Somewhere, a Klingon is laughing.*`;
}
