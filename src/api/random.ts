import { apiRequest } from './client.js';
import type { RandomResponse, RandomPage } from './types.js';

export async function getRandomArticles(count = 1): Promise<RandomPage[]> {
  const data = await apiRequest<RandomResponse>({
    action: 'query',
    list: 'random',
    rnnamespace: '0',
    rnlimit: String(Math.min(count, 10)),
  });
  return data.query.random;
}
