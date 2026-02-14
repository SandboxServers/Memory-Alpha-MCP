import { apiRequest } from './client.js';
import type { SearchResponse, SearchResult } from './types.js';

export async function searchArticles(query: string, limit = 10): Promise<SearchResult[]> {
  const data = await apiRequest<SearchResponse>({
    action: 'query',
    list: 'search',
    srsearch: query,
    srlimit: String(limit),
    srnamespace: '0',
    srprop: 'snippet|size|wordcount',
  });
  return data.query.search;
}
