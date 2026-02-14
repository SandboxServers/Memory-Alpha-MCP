import wtf from 'wtf_wikipedia';
import { cleanWikitext, stripHtml } from '../utils/text.js';

export function extractSection(wikitext: string, heading: string): string | null {
  const doc = wtf(wikitext);
  for (const section of doc.sections()) {
    if (section.title()?.toLowerCase() === heading.toLowerCase()) {
      return cleanText(section.text({}));
    }
  }

  // Regex fallback
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(
    `==+\\s*${escapedHeading}\\s*==+\\n([\\s\\S]*?)(?=\\n==|$)`,
    'i'
  );
  const match = wikitext.match(regex);
  if (match) {
    return cleanText(match[1]);
  }

  return null;
}

export function extractIntro(wikitext: string): string {
  const doc = wtf(wikitext);
  const sections = doc.sections();
  if (sections.length > 0) {
    return cleanText(sections[0].text({}));
  }
  return cleanText(doc.text({})).split('\n\n')[0] ?? '';
}

export function listSectionHeadings(wikitext: string): string[] {
  const doc = wtf(wikitext);
  return doc.sections()
    .map(s => s.title())
    .filter((t): t is string => !!t);
}

function cleanText(text: string): string {
  return stripHtml(cleanWikitext(text)).replace(/\n{3,}/g, '\n\n').trim();
}
