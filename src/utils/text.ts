export function truncate(text: string, maxLength = 4000): string {
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
  const stripped = stripTemplates(text);
  return stripped
    .replace(/\[\[File:[^\]]*\]\]/gi, '')
    .replace(/\[\[Image:[^\]]*\]\]/gi, '')
    .replace(/\[\[Category:[^\]]*\]\]/gi, '')
    .replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1')
    .replace(/\[\[([^\]]*)\]\]/g, '$1')
    .replace(/'{2,3}/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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
