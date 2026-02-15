import { z } from 'zod';
import { getArticleWikitext } from '../api/parse.js';
import { withAttribution } from '../utils/attribution.js';
import { TTLCache } from '../utils/cache.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

interface Rule {
  number: number;
  text: string;
}

const rulesCache = new TTLCache<Rule[]>(300_000, 1); // 5 min TTL, 1 entry

async function loadRules(): Promise<Rule[]> {
  const cached = rulesCache.get('rules');
  if (cached) return cached;

  const { wikitext } = await getArticleWikitext('Rules of Acquisition');
  const rules: Rule[] = [];

  // Match patterns like "Rule 1: Once you have their money, you never give it back"
  // or "#1 - Once you have their money..."
  // or table rows with rule numbers and text
  const patterns = [
    /(?:Rule|#)\s*(\d+)\s*[-:–]\s*"?([^"\n]+)"?/gi,
    /\|\s*(\d+)\s*\|\|?\s*"?([^"|"\n]+)"?/g,
    /'''(\d+)'''\s*[-–:]\s*"?([^"\n]+)"?/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(wikitext)) !== null) {
      const num = parseInt(match[1], 10);
      // Skip implausible rule numbers (years, page IDs, etc.)
      if (num > 500 || num < 1) continue;
      let text = match[2].trim()
        .replace(/'+$/, '')
        .replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, '$2')
        .replace(/\}\}+/g, '')  // Strip leaked template braces
        .trim();
      if (!text || text.length < 3) continue;
      // Deduplicate by number; also skip if identical text already exists
      if (!rules.some(r => r.number === num) && !rules.some(r => r.text === text)) {
        rules.push({ number: num, text });
      }
    }
  }

  rules.sort((a, b) => a.number - b.number);
  rulesCache.set('rules', rules);
  return rules;
}

export function registerRulesOfAcquisitionTool(server: McpServer): void {
  server.tool(
    'rules_of_acquisition',
    'Look up Ferengi Rules of Acquisition by number, randomly, or search by keyword',
    {
      rule_number: z.number().optional().describe('Specific rule number to look up'),
      random: z.boolean().default(false).describe('Get a random Rule of Acquisition'),
      search: z.string().max(500).optional().describe('Search rules by keyword'),
    },
    async ({ rule_number, random, search }) => {
      try {
        const rules = await loadRules();

        if (rules.length === 0) {
          return { content: [{ type: 'text' as const, text: 'Could not parse Rules of Acquisition from Memory Alpha.' }] };
        }

        let result: string;

        if (rule_number !== undefined) {
          const rule = rules.find(r => r.number === rule_number);
          if (rule) {
            result = `**Rule of Acquisition #${rule.number}:** "${rule.text}"`;
          } else {
            const available = rules.slice(0, 10).map(r => `#${r.number}`).join(', ');
            result = `Rule #${rule_number} not found. Available rules include: ${available}...`;
          }
        } else if (random) {
          const rule = rules[Math.floor(Math.random() * rules.length)];
          result = `**Rule of Acquisition #${rule.number}:** "${rule.text}"`;
        } else if (search) {
          const matches = rules.filter(r =>
            r.text.toLowerCase().includes(search.toLowerCase())
          );
          if (matches.length > 0) {
            result = matches.map(r => `**#${r.number}:** "${r.text}"`).join('\n');
          } else {
            result = `No Rules of Acquisition match "${search}".`;
          }
        } else {
          const sample = rules.slice(0, 15);
          result = `## Ferengi Rules of Acquisition\n\n${sample.map(r => `**#${r.number}:** "${r.text}"`).join('\n')}\n\n*${rules.length} rules available. Use rule_number, random, or search to explore.*`;
        }

        return { content: [{ type: 'text' as const, text: withAttribution(result) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error loading Rules of Acquisition: ${msg}` }] };
      }
    }
  );
}
