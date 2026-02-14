import { apiRequest } from './client.js';
import type { ParseResponse } from './types.js';

export async function getArticleWikitext(title: string): Promise<{ title: string; pageid: number; wikitext: string }> {
  const data = await apiRequest<ParseResponse>({
    action: 'parse',
    page: title,
    prop: 'wikitext',
    redirects: '1',
  });
  return {
    title: data.parse.title,
    pageid: data.parse.pageid,
    wikitext: data.parse.wikitext?.['*'] ?? '',
  };
}
