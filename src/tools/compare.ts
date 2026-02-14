import { z } from 'zod';
import { getArticleWikitext } from '../api/parse.js';
import { parseWikitext } from '../parser/wikitext.js';
import { withAttribution } from '../utils/attribution.js';
import { formatKey, escapeMdTableCell } from '../utils/text.js';
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
        const [data1, data2] = await Promise.all([
          getArticleWikitext(subject1).then(d => parseWikitext(d.wikitext, d.title)),
          getArticleWikitext(subject2).then(d => parseWikitext(d.wikitext, d.title)),
        ]);

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
          `### ${data1.title}\n${data1.summary}`,
          `### ${data2.title}\n${data2.summary}`
        );

        return { content: [{ type: 'text' as const, text: withAttribution(parts.join('\n\n')) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error comparing "${subject1}" and "${subject2}": ${msg}` }] };
      }
    }
  );
}
