import wtf from 'wtf_wikipedia';
import { stripHtml, cleanWikitext, truncate } from '../utils/text.js';
import { extractSidebarFromWikitext } from './infobox.js';

export interface ParsedArticle {
  title: string;
  summary: string;
  fullText: string;
  sections: ParsedSection[];
  infobox: Record<string, string> | null;
  links: string[];
  categories: string[];
  isDisambiguation: boolean;
}

export interface ParsedSection {
  title: string;
  depth: number;
  text: string;
}

export function parseWikitext(rawWikitext: string, title: string): ParsedArticle {
  // Strip interlanguage links before wtf_wikipedia parsing (it converts them to plain text remnants)
  const strippedWikitext = rawWikitext.replace(/\[\[[a-z]{2,3}:[^\]]*\]\]/g, '');
  const doc = wtf(strippedWikitext);

  const sections: ParsedSection[] = doc.sections().map(s => ({
    title: s.title() || '',
    depth: s.depth(),
    text: cleanSection(s.text({})),
  }));

  const infobox = extractInfobox(doc, rawWikitext);
  const links: string[] = doc.links()
    .map((l: unknown) => {
      if (typeof l === 'string') return l;
      if (l && typeof l === 'object' && typeof (l as Record<string, unknown>).page === 'function') {
        return (l as { page: () => string }).page();
      }
      return String(l);
    })
    .filter(Boolean);
  const categories = doc.categories().map(c => String(c));
  // Match actual disambiguation page templates (no params = page marker), NOT hatnotes (with params):
  // {{disambig}}, {{disambiguation}}, {{dis}} — page markers (no params, followed by }})
  // {{ep disambiguation|...}} — episode disambiguation pages (always a page marker)
  // {{disambiguation|desc|target}} — hatnote on regular articles, NOT matched (has params)
  // {{disambiguate|...}}, {{dis|...}} — hatnotes, NOT matched (has params)
  // CASE-SENSITIVE for {{dis}} to avoid matching {{DIS}} (Star Trek: Discovery abbreviation)
  const disambigTemplatePattern = /\{\{[Dd]isambig(uation)?\s*\}\}|\{\{dis\s*\}\}|\{\{[Ee]p\s*disambiguation/;
  const isDisambiguation = title.includes('(disambiguation)') ||
    categories.some(c => c.toLowerCase().includes('disambiguation')) ||
    disambigTemplatePattern.test(rawWikitext);

  const fullText = cleanSection(doc.text({}));
  const introSection = sections.length > 0 ? sections[0].text : fullText;
  const summary = truncate(introSection, 2500);

  return {
    title,
    summary,
    fullText,
    sections,
    infobox,
    links,
    categories,
    isDisambiguation,
  };
}

function extractInfobox(doc: ReturnType<typeof wtf>, rawWikitext: string): Record<string, string> | null {
  const infoboxes = doc.infoboxes();
  if (infoboxes.length > 0) {
    const ib = infoboxes[0];
    const result: Record<string, string> = {};
    const data = ib.json() as Record<string, { text?: string }>;
    for (const [key, val] of Object.entries(data)) {
      if (key === 'template') continue;
      if (val && typeof val === 'object' && 'text' in val) {
        result[key] = String(val.text ?? '');
      } else {
        result[key] = String(val ?? '');
      }
    }
    if (Object.keys(result).length > 0) return result;
  }

  return extractSidebarFromWikitext(rawWikitext);
}

function cleanSection(text: string): string {
  return stripHtml(cleanWikitext(text)).replace(/\n{3,}/g, '\n\n').trim();
}
