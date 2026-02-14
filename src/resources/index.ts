import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerResources(server: McpServer): void {
  server.resource(
    'series',
    'trek://series',
    { description: 'Reference listing of all Star Trek series', mimeType: 'text/plain' },
    async () => ({
      contents: [{
        uri: 'trek://series',
        text: SERIES_DATA,
        mimeType: 'text/plain',
      }],
    })
  );

  server.resource(
    'glossary',
    'trek://glossary',
    { description: 'Key Star Trek terminology and definitions', mimeType: 'text/plain' },
    async () => ({
      contents: [{
        uri: 'trek://glossary',
        text: GLOSSARY_DATA,
        mimeType: 'text/plain',
      }],
    })
  );
}

const SERIES_DATA = `# Star Trek Series Reference

| Abbr | Series | Years | Seasons | Setting | Primary Ship/Station | Captain/Commander |
|------|--------|-------|---------|---------|---------------------|-------------------|
| TOS | The Original Series | 1966-1969 | 3 | 2266-2269 | USS Enterprise NCC-1701 | James T. Kirk |
| TAS | The Animated Series | 1973-1974 | 2 | 2269-2270 | USS Enterprise NCC-1701 | James T. Kirk |
| TNG | The Next Generation | 1987-1994 | 7 | 2364-2370 | USS Enterprise NCC-1701-D | Jean-Luc Picard |
| DS9 | Deep Space Nine | 1993-1999 | 7 | 2369-2375 | Deep Space 9 / USS Defiant | Benjamin Sisko |
| VOY | Voyager | 1995-2001 | 7 | 2371-2378 | USS Voyager NCC-74656 | Kathryn Janeway |
| ENT | Enterprise | 2001-2005 | 4 | 2151-2155 | Enterprise NX-01 | Jonathan Archer |
| DIS | Discovery | 2017-2024 | 5 | 2256-2258, 3189+ | USS Discovery NCC-1031 | Michael Burnham |
| PIC | Picard | 2020-2023 | 3 | 2399-2402 | La Sirena / USS Titan-A | Jean-Luc Picard |
| LD | Lower Decks | 2020-2024 | 5 | 2380-2382 | USS Cerritos NCC-75567 | Carol Freeman |
| PRO | Prodigy | 2022-2024 | 2 | 2383-2385 | USS Protostar NCC-97937 | Dal R'El (acting) |
| SNW | Strange New Worlds | 2022-present | 3+ | 2259-2261 | USS Enterprise NCC-1701 | Christopher Pike |

Note: This is reference data only. For detailed information, use the search or article tools.`;

const GLOSSARY_DATA = `# Star Trek Glossary

**Away Team** - A group sent from a starship to a planet surface or another vessel for missions.
**Borg** - A cybernetic collective that assimilates other species and technologies.
**Cloaking Device** - Technology that renders a vessel invisible to sensors and the naked eye.
**Communicator** - A handheld device for person-to-person voice communication.
**Deflector Shield** - Energy barriers protecting a vessel from weapons fire and hazards.
**Dilithium** - A crystalline substance used to regulate matter-antimatter reactions in warp cores.
**Holodeck** - A room using holograms, forcefields, and replicators to simulate environments.
**Impulse Drive** - Sub-light propulsion system for travel within a star system.
**LCARS** - Library Computer Access/Retrieval System, the standard Starfleet computer interface.
**Phaser** - Directed energy weapon used by Starfleet, with settings from stun to kill.
**Photon Torpedo** - A matter-antimatter warhead weapon used by Starfleet vessels.
**Prime Directive** - Starfleet General Order #1: no interference with the development of alien civilizations.
**Quadrant** - One of four galactic divisions: Alpha, Beta, Gamma, Delta.
**Red Alert** - Maximum alert status indicating imminent danger or combat.
**Replicator** - Device that synthesizes food, objects, and materials from stored patterns.
**Stardate** - The timekeeping system used in Starfleet logs and communications.
**Starfleet** - The deep-space exploratory, peacekeeping, and military service of the United Federation of Planets.
**Subspace** - A domain underlying normal space, used for faster-than-light communication.
**Transporter** - Technology that converts matter to energy, beams it to a location, and reassembles it.
**Tricorder** - A multifunction handheld scanning and computing device.
**Turbolift** - High-speed elevator system used throughout Starfleet vessels and starbases.
**United Federation of Planets** - An interstellar union of planetary governments and species.
**VISOR** - Visual Instrument and Sensory Organ Replacement, a device worn by Geordi La Forge.
**Warp Drive** - Propulsion system enabling faster-than-light travel by warping spacetime.
**Warp Factor** - A unit of measurement for speeds achieved with warp drive (Warp 1 = speed of light).

Note: These are original reference-style definitions. For detailed canon information, use the article tools.`;
