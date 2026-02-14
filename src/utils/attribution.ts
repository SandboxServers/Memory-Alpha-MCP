const ATTRIBUTION = '\n\n---\n*Source: [Memory Alpha](https://memory-alpha.fandom.com/) (CC-BY-SA) | Unofficial fan project - not affiliated with CBS/Paramount*';

export function withAttribution(text: string): string {
  return text + ATTRIBUTION;
}
