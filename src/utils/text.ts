/** Star Trek film number → title mapping for {{film|N}} templates. */
const FILM_TITLES: Record<string, string> = {
  '1': 'Star Trek: The Motion Picture',
  '2': 'Star Trek II: The Wrath of Khan',
  '3': 'Star Trek III: The Search for Spock',
  '4': 'Star Trek IV: The Voyage Home',
  '5': 'Star Trek V: The Final Frontier',
  '6': 'Star Trek VI: The Undiscovered Country',
  '7': 'Star Trek Generations',
  '8': 'Star Trek: First Contact',
  '9': 'Star Trek: Insurrection',
  '10': 'Star Trek Nemesis',
  '11': 'Star Trek',
  '12': 'Star Trek Into Darkness',
  '13': 'Star Trek Beyond',
};

export function truncate(text: string, maxLength = 6000): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('. ');
  const cutoff = lastPeriod > maxLength * 0.7 ? lastPeriod + 1 : maxLength;
  return truncated.slice(0, cutoff) + '\n\n[...truncated]';
}

export function stripHtml(text: string): string {
  return text
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '')
    .replace(/<ref[^>]*\/>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

export function cleanWikitext(text: string): string {
  const processed = processTemplates(text);
  return processed
    .replace(/\[\[File:[^\]]*\]\]/gi, '')
    .replace(/\[\[Image:[^\]]*\]\]/gi, '')
    .replace(/\[\[Category:[^\]]*\]\]/gi, '')
    .replace(/\[\[[a-z]{2,3}:[^\]]*\]\]/g, '')
    .replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1')
    .replace(/\[\[([^\]]*)\]\]/g, '$1')
    .replace(/'{2,3}/g, '')
    .replace(/^[a-z]{2,3}:.*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Process known content-bearing templates before stripping the rest.
 * Handles USS, quote, dis, aka, class templates — unknown templates are stripped.
 */
export function processTemplates(text: string): string {
  // Process known templates by regex before brace-balanced stripping
  let result = text;

  // {{USS|Enterprise|NCC-1701}} → "USS Enterprise (NCC-1701)"
  // {{USS|Enterprise}} → "USS Enterprise"
  result = result.replace(/\{\{USS\|([^|}]+)\|([^|}]+)\}\}/gi, 'USS $1 ($2)');
  result = result.replace(/\{\{USS\|([^|}]+)\}\}/gi, 'USS $1');

  // {{class|Galaxy}} → "Galaxy-class"
  result = result.replace(/\{\{class\|([^|}]+)\}\}/gi, '$1-class');

  // {{dis|name}} → "name"
  result = result.replace(/\{\{dis\|([^|}]+)(?:\|[^}]*)?\}\}/gi, '$1');

  // {{aka|name}} → "name"
  result = result.replace(/\{\{aka\|([^|}]+)(?:\|[^}]*)?\}\}/gi, '$1');

  // {{quote|text|speaker}} → '"text" – speaker'
  // {{quote|text}} → '"text"'
  result = result.replace(/\{\{quote\|([^|}]+)\|([^|}]+)(?:\|[^}]*)?\}\}/gi, '"$1" – $2');
  result = result.replace(/\{\{quote\|([^|}]+)\}\}/gi, '"$1"');

  // Series episode templates: {{TNG|Episode Name}} → "Episode Name"
  const seriesAbbrevs = ['TOS', 'TAS', 'TNG', 'DS9', 'VOY', 'ENT', 'DIS', 'PIC', 'LD', 'PRO', 'SNW', 'STP', 'VST'];
  for (const s of seriesAbbrevs) {
    result = result.replace(new RegExp(`\\{\\{${s}\\|([^|}]+)(?:\\|[^}]*)?\\}\\}`, 'gi'), '$1');
  }

  // {{e|Episode Name}} → "Episode Name" (generic episode reference)
  result = result.replace(/\{\{e\|([^|}]+)(?:\|[^}]*)?\}\}/gi, '$1');

  // {{s|Series/Movie Title}} → "Series/Movie Title"
  result = result.replace(/\{\{s\|([^|}]+)(?:\|[^}]*)?\}\}/gi, '$1');

  // {{y|YYYY}} → "YYYY" (year link)
  result = result.replace(/\{\{y\|([^|}]+)\}\}/gi, '$1');

  // {{film|N}} → film title from lookup
  result = result.replace(/\{\{film\|(\d+)\}\}/gi, (_match, n) => {
    return FILM_TITLES[n] ?? `Star Trek film ${n}`;
  });

  // Strip remaining unknown templates
  result = stripTemplates(result);

  return result;
}

/** Strip top-level `{{...}}` templates using brace-balanced matching. */
export function stripTemplates(text: string): string {
  let result = '';
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{' && text[i + 1] === '{') {
      depth++;
      i++; // skip second brace
    } else if (text[i] === '}' && text[i + 1] === '}') {
      if (depth > 0) depth--;
      i++; // skip second brace
    } else if (depth === 0) {
      result += text[i];
    }
  }
  return result;
}

export function formatKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function escapeMdTableCell(value: string): string {
  return value.replace(/\|/g, '\\|');
}
