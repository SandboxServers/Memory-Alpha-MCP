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
  const doc = wtf(rawWikitext);

  const sections: ParsedSection[] = doc.sections().map(s => ({
    title: s.title() || '',
    depth: s.depth(),
    text: cleanSection(s.text({})),
  }));

  const infobox = extractInfobox(doc, rawWikitext);
  const links = doc.links().filter(Boolean);
  const categories = doc.categories().map(c => String(c));
  const isDisambiguation = title.includes('(disambiguation)') ||
    categories.some(c => c.toLowerCase().includes('disambiguation')) ||
    rawWikitext.toLowerCase().includes('{{disambig');

  const fullText = cleanSection(doc.text({}));
  const introSection = sections.length > 0 ? sections[0].text : fullText;
  const summary = truncate(introSection, 1000);

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
