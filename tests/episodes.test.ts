import { describe, it, expect } from 'vitest';
import { parseSeasonTable } from '../src/api/episodes.js';

// Simplified sample of expanded season table wikitext
const SAMPLE_SEASON_TABLE = `{| class="wikitable"
|-
! # !! Title !! Airdate
|-
| 3x01 || [[The Xindi (episode)|The Xindi]] || 10 September 2003
|-
| 3x02 || [[Anomaly (ENT episode)|Anomaly]] || 17 September 2003
|-
| 3x03 || [[Extinction (episode)|Extinction]] || 24 September 2003
|-
| 3x04 || [[Rajiin]] || 1 October 2003
|-
| 3x05 || [[Impulse (episode)|Impulse]] || 8 October 2003
|-
| 3x06 || [[Exile (episode)|Exile]] || 15 October 2003
|-
| 3x07 || [[The Shipment]] || 29 October 2003
|-
| 3x08 || [[Twilight (episode)|Twilight]] || 5 November 2003
|-
| 3x09 || [[North Star (episode)|North Star]] || 12 November 2003
|-
| 3x10 || [[Similitude]] || 19 November 2003
|}`;

const SAMPLE_SNW_S2 = `{| class="wikitable"
|-
! # !! Title !! Airdate
|-
| 2x01 || [[The Broken Circle]] || 15 June 2023
|-
| 2x02 || [[Ad Astra per Aspera]] || 22 June 2023
|-
| 2x03 || [[Tomorrow and Tomorrow and Tomorrow]] || 29 June 2023
|-
| 2x04 || [[Among the Lotus Eaters]] || 6 July 2023
|-
| 2x05 || [[Charades (episode)|Charades]] || 13 July 2023
|-
| 2x06 || [[Lost in Translation (episode)|Lost in Translation]] || 20 July 2023
|-
| 2x07 || [[Those Old Scientists]] || 27 July 2023
|-
| 2x08 || [[Under the Cloak of War]] || 3 August 2023
|-
| 2x09 || [[Subspace Rhapsody]] || 10 August 2023
|-
| 2x10 || [[Hegemony (episode)|Hegemony]] || 17 August 2023
|}`;

describe('parseSeasonTable', () => {
  it('extracts episodes from ENT season 3 table', () => {
    const episodes = parseSeasonTable(SAMPLE_SEASON_TABLE, 3);
    expect(episodes).toHaveLength(10);
    expect(episodes[0]).toEqual({ number: '3x01', title: 'The Xindi' });
    expect(episodes[7]).toEqual({ number: '3x08', title: 'Twilight' });
    expect(episodes[9]).toEqual({ number: '3x10', title: 'Similitude' });
  });

  it('extracts episodes from SNW season 2 table', () => {
    const episodes = parseSeasonTable(SAMPLE_SNW_S2, 2);
    expect(episodes).toHaveLength(10);
    expect(episodes[0]).toEqual({ number: '2x01', title: 'The Broken Circle' });
    expect(episodes[8]).toEqual({ number: '2x09', title: 'Subspace Rhapsody' });
    expect(episodes[9]).toEqual({ number: '2x10', title: 'Hegemony' });
  });

  it('strips (episode) suffix from display titles', () => {
    const episodes = parseSeasonTable(SAMPLE_SEASON_TABLE, 3);
    const twilight = episodes.find(e => e.number === '3x08');
    expect(twilight?.title).toBe('Twilight');
    expect(twilight?.title).not.toContain('(episode)');
  });

  it('handles links without (episode) suffix', () => {
    const episodes = parseSeasonTable(SAMPLE_SEASON_TABLE, 3);
    const rajiin = episodes.find(e => e.number === '3x04');
    expect(rajiin?.title).toBe('Rajiin');
  });

  it('returns empty array for empty input', () => {
    const episodes = parseSeasonTable('', 1);
    expect(episodes).toEqual([]);
  });

  it('returns empty array for non-table content', () => {
    const episodes = parseSeasonTable('This is just some text with no episode data.', 1);
    expect(episodes).toEqual([]);
  });

  it('deduplicates episodes by number', () => {
    const duplicated = `| 1x01 || [[Pilot (episode)|Pilot]] || 1 January 2000
| 1x01 || [[Pilot (episode)|Pilot]] || 1 January 2000
| 1x02 || [[Second (episode)|Second]] || 8 January 2000`;
    const episodes = parseSeasonTable(duplicated, 1);
    expect(episodes).toHaveLength(2);
  });

  it('pads single-digit episode numbers', () => {
    const input = `| 1x1 || [[Pilot (episode)|Pilot]] || 1 January 2000`;
    const episodes = parseSeasonTable(input, 1);
    // 1x1 should be normalized to 1x01
    expect(episodes[0]?.number).toBe('1x01');
  });

  it('skips non-episode links like dates and files', () => {
    const input = `| 2x05 || [[File:Episode.jpg]] [[Charades (episode)|Charades]] || [[13 July]] 2023`;
    const episodes = parseSeasonTable(input, 2);
    expect(episodes).toHaveLength(1);
    expect(episodes[0].title).toBe('Charades');
  });
});
