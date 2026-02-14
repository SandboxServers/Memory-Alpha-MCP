import { z } from 'zod';
import { getArticleWikitext } from '../api/parse.js';
import { parseWikitext, type ParsedArticle } from '../parser/wikitext.js';
import { extractSection } from '../parser/sections.js';
import { withAttribution } from '../utils/attribution.js';
import { truncate, formatKey, escapeMdTableCell } from '../utils/text.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerCompareTool(server: McpServer): void {
  server.tool(
    'compare',
    'Compare two Star Trek subjects side-by-side (characters, ships, species, etc.)',
    {
      subject1: z.string().max(500).describe('First subject (e.g. "USS Enterprise (NCC-1701-D)")'),
      subject2: z.string().max(500).describe('Second subject (e.g. "USS Voyager")'),
    },
    async ({ subject1, subject2 }) => {
      try {
        const [raw1, raw2] = await Promise.all([
          getArticleWikitext(subject1),
          getArticleWikitext(subject2),
        ]);
        const data1 = parseWikitext(raw1.wikitext, raw1.title);
        const data2 = parseWikitext(raw2.wikitext, raw2.title);

        const parts: string[] = [`## Comparison: ${data1.title} vs ${data2.title}`];

        // Side-by-side infobox comparison
        if (data1.infobox || data2.infobox) {
          const allKeys = new Set([
            ...Object.keys(data1.infobox ?? {}),
            ...Object.keys(data2.infobox ?? {}),
          ]);

          const rows = [...allKeys].map(key => {
            const v1 = escapeMdTableCell(data1.infobox?.[key] ?? '—');
            const v2 = escapeMdTableCell(data2.infobox?.[key] ?? '—');
            return `| ${formatKey(key)} | ${v1} | ${v2} |`;
          });

          const h1 = escapeMdTableCell(data1.title);
          const h2 = escapeMdTableCell(data2.title);
          parts.push(
            `| Attribute | ${h1} | ${h2} |`,
            '|-----------|' + '-'.repeat(h1.length + 2) + '|' + '-'.repeat(h2.length + 2) + '|',
            ...rows
          );
        }

        parts.push(
          `### ${data1.title}\n${truncate(data1.summary, 2500)}`,
          `### ${data2.title}\n${truncate(data2.summary, 2500)}`
        );

        // Find a matching section for deeper context
        const contextSection = findMatchingSection(data1, data2, raw1.wikitext, raw2.wikitext);
        if (contextSection) {
          parts.push(contextSection);
        }

        return { content: [{ type: 'text' as const, text: withAttribution(parts.join('\n\n')) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error comparing "${subject1}" and "${subject2}": ${msg}` }] };
      }
    }
  );
}

function findMatchingSection(
  data1: ParsedArticle, data2: ParsedArticle,
  wikitext1: string, wikitext2: string
): string | null {
  const contextHeadings = [
    'History', 'Career', 'Service history', 'Culture',
    'Physiology', 'Technical data', 'Armament',
  ];

  const headings1 = new Set(data1.sections.map(s => s.title?.toLowerCase()));
  const headings2 = new Set(data2.sections.map(s => s.title?.toLowerCase()));

  for (const heading of contextHeadings) {
    const lower = heading.toLowerCase();
    if (headings1.has(lower) && headings2.has(lower)) {
      const s1 = extractSection(wikitext1, heading);
      const s2 = extractSection(wikitext2, heading);
      if (s1 && s2) {
        return `### ${heading} Comparison\n**${data1.title}:** ${truncate(s1, 1500)}\n\n**${data2.title}:** ${truncate(s2, 1500)}`;
      }
    }
  }
  return null;
}
