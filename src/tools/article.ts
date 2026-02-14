import { z } from 'zod';
import { getArticleWikitext } from '../api/parse.js';
import { parseWikitext } from '../parser/wikitext.js';
import { extractSection } from '../parser/sections.js';
import { withAttribution } from '../utils/attribution.js';
import { truncate, formatKey } from '../utils/text.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerArticleTool(server: McpServer): void {
  server.tool(
    'get_article',
    'Get a full or partial article from Memory Alpha. Use exact article titles for best results.',
    {
      title: z.string().max(500).describe('Article title (e.g. "James T. Kirk", "Warp drive")'),
      section: z.string().max(500).optional().describe('Specific section heading to retrieve (e.g. "Background information")'),
      summary_only: z.boolean().default(false).describe('Return only the intro summary'),
    },
    async ({ title, section, summary_only }) => {
      try {
        const { wikitext, title: resolvedTitle } = await getArticleWikitext(title);
        const parsed = parseWikitext(wikitext, resolvedTitle);

        let content: string;

        if (parsed.isDisambiguation && !section) {
          const links = parsed.links.slice(0, 20).map(l => `- ${l}`).join('\n');
          content = `## ${resolvedTitle}\n\n*This is a disambiguation page.* Here are the available articles:\n\n${links}`;
          return { content: [{ type: 'text' as const, text: withAttribution(content) }] };
        }

        if (section) {
          const sectionText = extractSection(wikitext, section);
          if (!sectionText) {
            const available = parsed.sections.map(s => s.title).filter(Boolean).join(', ');
            content = `Section "${section}" not found in "${resolvedTitle}".\n\nAvailable sections: ${available}`;
          } else {
            content = `## ${resolvedTitle} — ${section}\n\n${truncate(sectionText)}`;
          }
        } else if (summary_only) {
          content = `## ${resolvedTitle}\n\n${parsed.summary}`;
        } else {
          const parts: string[] = [`## ${resolvedTitle}`];
          if (parsed.infobox) {
            const infoboxLines = Object.entries(parsed.infobox)
              .map(([k, v]) => `- **${formatKey(k)}**: ${v}`)
              .join('\n');
            parts.push(`### Quick Facts\n${infoboxLines}`);
          }
          parts.push(truncate(parsed.fullText));
          content = parts.join('\n\n');
        }

        return { content: [{ type: 'text' as const, text: withAttribution(content) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Could not retrieve article "${title}": ${msg}` }] };
      }
    }
  );
}
