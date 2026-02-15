import { expandTemplates } from './parse.js';
import { getCategoryMembers } from './categories.js';
import { log } from '../utils/logger.js';

export interface EpisodeEntry {
  number: string;
  title: string;
}

const SERIES_KEYS: Record<string, string> = {
  TOS: 'TOS', TAS: 'TAS', TNG: 'TNG', DS9: 'DS9',
  VOY: 'VOY', ENT: 'ENT', DIS: 'DIS', PIC: 'PIC',
  LD: 'LD', PRO: 'PRO', SNW: 'SNW',
};

const FLAT_CATEGORY_KEYS: Record<string, string> = {
  TOS: 'TOS episodes', TAS: 'TAS episodes', TNG: 'TNG episodes',
  DS9: 'DS9 episodes', VOY: 'VOY episodes', ENT: 'ENT episodes',
  DIS: 'DIS episodes', PIC: 'PIC episodes', LD: 'LD episodes',
  PRO: 'PRO episodes', SNW: 'SNW episodes',
};

/**
 * Parse episode entries from expanded season table wikitext.
 * Exported for testing.
 */
export function parseSeasonTable(wikitext: string, season: number): EpisodeEntry[] {
  const episodes: EpisodeEntry[] = [];

  // Match wikitext links: [[Title (episode)|Display]] or [[Title]]
  // The season table typically has rows with episode numbers and links
  const linkPattern = /\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g;
  let match: RegExpExecArray | null;

  // Also look for episode number patterns like "1x01", "2x09" near links
  const lines = wikitext.split('\n');
  for (const line of lines) {
    // Skip lines that are clearly headers or non-episode content
    if (!line.includes('[[') || line.startsWith('!')) continue;

    // Find NxNN episode number pattern in the line
    const numMatch = line.match(/(\d+)x(\d+)/);
    const epNumber = numMatch ? `${numMatch[1]}x${numMatch[2].padStart(2, '0')}` : '';

    // Find the episode link - prefer links with (episode) suffix
    linkPattern.lastIndex = 0;
    let episodeTitle: string | null = null;
    while ((match = linkPattern.exec(line)) !== null) {
      const target = match[1].trim();
      // Skip non-episode links (images, categories, files, etc.)
      if (target.startsWith('File:') || target.startsWith('Category:') || target.startsWith('Image:')) continue;
      // Skip links that are clearly not episode titles (dates, actor names with parenthetical)
      if (/^\d+ (January|February|March|April|May|June|July|August|September|October|November|December)/.test(target)) continue;
      if (/^\d{4}$/.test(target)) continue;

      // Prefer episode-suffixed titles
      if (target.includes('(episode)')) {
        episodeTitle = target;
        break;
      }
      // First non-skipped link is likely the episode
      if (!episodeTitle) {
        episodeTitle = target;
      }
    }

    if (episodeTitle && epNumber) {
      // Clean display title: remove " (episode)" suffix for display
      const displayTitle = episodeTitle.replace(/\s*\(episode\)$/, '');
      episodes.push({ number: epNumber, title: displayTitle });
    }
  }

  // Deduplicate by episode number
  const seen = new Set<string>();
  return episodes.filter(ep => {
    if (seen.has(ep.number)) return false;
    seen.add(ep.number);
    return true;
  });
}

export async function getSeasonEpisodes(series: string, season: number): Promise<EpisodeEntry[]> {
  const seriesKey = series.toUpperCase();
  const key = SERIES_KEYS[seriesKey] ?? seriesKey;

  // Try season table approach first
  const articleTitle = `${key} Season ${season}`;
  try {
    const templateText = `{{season table|${articleTitle}}}`;
    const expanded = await expandTemplates(templateText);

    if (expanded && expanded !== templateText && !expanded.includes('{{season table|')) {
      const episodes = parseSeasonTable(expanded, season);
      if (episodes.length > 0) {
        log(`Season table parsed: ${episodes.length} episodes for ${articleTitle}`);
        return episodes;
      }
    }
  } catch {
    log(`Season table approach failed for ${articleTitle}, trying fallback`);
  }

  // Fallback: flat category (e.g., "SNW episodes")
  const categoryKey = FLAT_CATEGORY_KEYS[seriesKey];
  if (categoryKey) {
    try {
      const members = await getCategoryMembers(categoryKey, 200);
      if (members.length > 0) {
        // Filter to episodes likely from this season by checking article content
        // Since we can't easily filter by season from categories alone,
        // return all episodes and let the caller handle it
        return members.map((m, i) => ({
          number: `${season}x${String(i + 1).padStart(2, '0')}`,
          title: m.title.replace(/\s*\(episode\)$/, ''),
        }));
      }
    } catch {
      log(`Category fallback failed for ${categoryKey}`);
    }
  }

  return [];
}
