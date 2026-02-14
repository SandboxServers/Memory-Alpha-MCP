import { cleanWikitext } from '../utils/text.js';

const SIDEBAR_MARKER = '{{sidebar ';

/** Extract the content of the first `{{sidebar <type> ... }}` template using brace-balanced matching. */
function extractSidebarContent(wikitext: string, templateType?: string): { type: string; content: string } | null {
  let i = 0;
  while (i < wikitext.length) {
    const idx = wikitext.toLowerCase().indexOf(SIDEBAR_MARKER, i);
    if (idx === -1) break;

    // Extract the type name after "{{sidebar "
    const afterSidebar = wikitext.slice(idx + SIDEBAR_MARKER.length);
    const typeMatch = afterSidebar.match(/^([\w][\w\s-]*?)(?=\s*[\n|])/);
    const foundType = typeMatch ? typeMatch[1].trim() : '';

    // If a specific type was requested, check for a case-insensitive match
    if (templateType && foundType.toLowerCase() !== templateType.toLowerCase()) {
      i = idx + 2;
      continue;
    }

    // Brace-balanced extraction
    let depth = 0;
    let j = idx;
    while (j < wikitext.length) {
      if (wikitext[j] === '{' && wikitext[j + 1] === '{') {
        depth++;
        j += 2;
      } else if (wikitext[j] === '}' && wikitext[j + 1] === '}') {
        depth--;
        j += 2;
        if (depth === 0) {
          // Extract everything between the opening marker+type and closing `}}`
          const fullMatch = wikitext.slice(idx, j);
          // Find the actual end of the header (after "{{sidebar " + type + optional whitespace)
          const headerEnd = SIDEBAR_MARKER.length + foundType.length;
          const content = fullMatch.slice(headerEnd, -2);
          return { type: foundType, content };
        }
      } else {
        j++;
      }
    }
    // Unbalanced braces - skip this match
    i = idx + 2;
  }
  return null;
}

const PARAM_PATTERN = /\|\s*([\w][\w\s]*?)\s*=\s*([\s\S]*?)(?=\n\s*\||\n\s*\}\}|$)/g;

function parseParams(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  const re = new RegExp(PARAM_PATTERN.source, PARAM_PATTERN.flags);
  let m;
  while ((m = re.exec(content)) !== null) {
    const key = m[1].trim().toLowerCase().replace(/\s+/g, '_');
    const value = cleanWikitext(m[2].trim());
    if (key && value) {
      result[key] = value;
    }
  }
  return result;
}

export function extractSidebarFromWikitext(wikitext: string, templateType?: string): Record<string, string> | null {
  const match = extractSidebarContent(wikitext, templateType);
  if (!match) return null;

  const result = parseParams(match.content);
  return Object.keys(result).length > 0 ? result : null;
}
