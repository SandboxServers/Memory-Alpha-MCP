import { log, logError } from '../utils/logger.js';
import { apiCache } from '../utils/cache.js';

const BASE_URL = 'https://memory-alpha.fandom.com/api.php';
const USER_AGENT = 'MemoryAlphaMCP/1.0 (MCP Server; +https://www.npmjs.com/package/memory-alpha-mcp)';
const TIMEOUT_MS = 10_000;
const MAX_RETRIES = 1;
const MIN_REQUEST_INTERVAL_MS = 200; // 5 req/s

let lastRequestTime = 0;
let requestQueue: Promise<void> = Promise.resolve();

async function rateLimit(): Promise<void> {
  const ticket = requestQueue.then(async () => {
    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - elapsed));
    }
    lastRequestTime = Date.now();
  });
  requestQueue = ticket.catch((err) => { logError('Rate limit queue error', err); });
  await ticket;
}

export async function apiRequest<T>(params: Record<string, string>): Promise<T> {
  const searchParams = new URLSearchParams({
    ...params,
    format: 'json',
    origin: '*',
  });

  const cacheKey = searchParams.toString();
  const cached = apiCache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as T;
  }

  await rateLimit();

  const url = `${BASE_URL}?${searchParams.toString()}`;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        if (response.status >= 500 && attempt < MAX_RETRIES) {
          log(`Server error ${response.status}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as T & { error?: { code: string; info: string } };
      if (data.error) {
        throw new Error(`MediaWiki API error: ${data.error.info} (${data.error.code})`);
      }
      apiCache.set(cacheKey, JSON.stringify(data));
      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (error instanceof DOMException && error.name === 'AbortError') {
        lastError = new Error('Request timed out');
      }
      if (attempt < MAX_RETRIES) {
        logError(`Request failed (attempt ${attempt + 1})`, lastError);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error('Request failed');
}
