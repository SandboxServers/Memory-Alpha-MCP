import wtf from 'wtf_wikipedia';
import { cleanWikitext, stripHtml } from '../utils/text.js';

export function extractSection(wikitext: string, heading: string): string | null {
  const doc = wtf(wikitext);
  const allSections = doc.sections();

  // Find the matching section
  let matchIdx = -1;
  for (let i = 0; i < allSections.length; i++) {
    if (allSections[i].title()?.toLowerCase() === heading.toLowerCase()) {
      matchIdx = i;
      break;
    }
  }

  if (matchIdx >= 0) {
    const matchDepth = allSections[matchIdx].depth();
    const parts: string[] = [cleanText(allSections[matchIdx].text({}))];

    // Walk forward collecting all child subsections (greater depth)
    for (let i = matchIdx + 1; i < allSections.length; i++) {
      const childDepth = allSections[i].depth();
      if (childDepth <= matchDepth) break; // sibling or parent — stop

      const relativeDepth = childDepth - matchDepth;
      const mdHeading = '#'.repeat(relativeDepth + 2); // start at ### for first child
      const title = allSections[i].title();
      const text = cleanText(allSections[i].text({}));
      if (title && text) {
        parts.push(`${mdHeading} ${title}\n${text}`);
      } else if (text) {
        parts.push(text);
      }
    }

    const result = parts.filter(Boolean).join('\n\n');
    if (result) return result;
  }

  // Regex fallback — stop at same-or-lesser depth headings
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const headingMatch = wikitext.match(new RegExp(`(={2,})\\s*${escapedHeading}\\s*\\1`, 'i'));
  if (headingMatch) {
    const level = headingMatch[1].length; // number of = signs
    const startIdx = wikitext.indexOf(headingMatch[0]) + headingMatch[0].length;
    // Match up to next heading of same or lesser depth
    const restText = wikitext.slice(startIdx);
    const endPattern = new RegExp(`\\n={2,${level}}\\s+[^=]`, 'i');
    const endMatch = restText.match(endPattern);
    const sectionText = endMatch
      ? restText.slice(0, endMatch.index)
      : restText;
    const cleaned = cleanText(sectionText);
    if (cleaned) return cleaned;
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
