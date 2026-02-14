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

  server.resource(
    'technobabble',
    'trek://technobabble',
    { description: 'Star Trek particles, fields, and phenomena for generating authentic technobabble', mimeType: 'text/plain' },
    async () => ({
      contents: [{
        uri: 'trek://technobabble',
        text: TECHNOBABBLE_DATA,
        mimeType: 'text/plain',
      }],
    })
  );

  server.resource(
    'starship-classes',
    'trek://starship-classes',
    { description: 'Star Trek starship classes with era, role, and notable vessels', mimeType: 'text/plain' },
    async () => ({
      contents: [{
        uri: 'trek://starship-classes',
        text: STARSHIP_CLASSES_DATA,
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

const TECHNOBABBLE_DATA = `# Star Trek Technobabble Reference

## Particles
- **Tachyon** — Faster-than-light particles used in detection grids and communication
- **Chroniton** — Temporal particles associated with time travel and phase shifts
- **Neutrino** — Subatomic particles that pass through most matter
- **Graviton** — Particles that mediate gravitational force, used in tractor beams
- **Antiproton** — Antimatter counterpart to the proton, used in weapons and sensors
- **Verteron** — Particles associated with the Bajoran wormhole
- **Tetryon** — Particles from subspace, disruptive to normal-space technology
- **Metreon** — Highly volatile particles, can be weaponized (metreon cascade)
- **Photon** — Light particles, basis for photon torpedoes
- **Polaron** — Particles used in Dominion weapons that penetrate Federation shields

## Fields & Phenomena
- **Subspace field** — Distortion in subspace, basis for warp drive
- **Warp field** — Bubble of warped spacetime enabling FTL travel
- **Deflector field** — Protective energy barrier around starships
- **Dampening field** — Suppresses energy weapons and power systems
- **Multiphasic** — Existing across multiple phase states simultaneously
- **Subspace anomaly** — Disruption in the fabric of subspace
- **Temporal anomaly** — Disruption in the flow of time
- **Spatial rift** — Tear in normal space, often leading to other dimensions
- **Quantum singularity** — A black hole; used as power source in Romulan warbirds
- **Ion storm** — Electromagnetic disturbance in space affecting ship systems

## Engineering Actions
- **Reroute** — "Reroute power through the secondary EPS conduits"
- **Reverse the polarity** — "Reverse the polarity of the deflector array"
- **Modulate** — "Modulate the shield frequency to match their weapons"
- **Recalibrate** — "Recalibrate the sensor array for tachyon emissions"
- **Realign** — "Realign the dilithium matrix"
- **Reinitialize** — "Reinitialize the warp core"
- **Compensate** — "Compensate for the gravitational shear"
- **Bypass** — "Bypass the primary ODN relay"
- **Purge** — "Purge the plasma injectors"
- **Emit** — "Emit an inverse tachyon pulse from the main deflector"

## Systems
- **EPS conduit** — Electro-Plasma System, main power distribution
- **ODN relay** — Optical Data Network, shipboard data transmission
- **Isolinear chip** — Standard data storage medium (24th century)
- **Bio-neural gel pack** — Organic computer processing (Voyager-era)
- **Dilithium matrix** — Crystal assembly regulating matter-antimatter reactions
- **Plasma injector** — Component feeding plasma into the warp nacelles
- **Pattern buffer** — Transporter component storing matter patterns during transport
- **Heisenberg compensator** — Transporter component overcoming quantum uncertainty

Note: These are original reference descriptions for generating authentic technobabble. For detailed canon information, use the article tools.`;

const STARSHIP_CLASSES_DATA = `# Star Trek Starship Classes

## Federation / Starfleet

| Class | Era | Role | Notable Vessels |
|-------|-----|------|-----------------|
| NX | 22nd century | Explorer (first warp 5) | Enterprise NX-01 |
| Constitution | 23rd century | Heavy cruiser / explorer | USS Enterprise NCC-1701, USS Defiant |
| Constitution (refit) | Late 23rd century | Upgraded heavy cruiser | USS Enterprise NCC-1701-A |
| Miranda | 23rd-24th century | Light cruiser / science | USS Reliant NCC-1864 |
| Excelsior | Late 23rd century | Explorer / battleship | USS Excelsior NCC-2000, USS Enterprise NCC-1701-B |
| Oberth | 23rd-24th century | Science vessel | USS Grissom |
| Ambassador | Early 24th century | Heavy cruiser | USS Enterprise NCC-1701-C |
| Nebula | 24th century | Multi-mission cruiser | USS Sutherland, USS Phoenix |
| Galaxy | 24th century | Explorer (flagship class) | USS Enterprise NCC-1701-D, USS Yamato |
| Defiant | 24th century | Warship / escort | USS Defiant NX-74205 |
| Intrepid | 24th century | Long-range science vessel | USS Voyager NCC-74656 |
| Sovereign | Late 24th century | Explorer / battleship | USS Enterprise NCC-1701-E |
| Akira | 24th century | Heavy cruiser / carrier | USS Thunderchild |
| Steamrunner | 24th century | Cruiser | USS Appalachia |
| Nova | 24th century | Planetary survey | USS Equinox |
| California | Late 24th century | Support vessel | USS Cerritos NCC-75567 |
| Prometheus | Late 24th century | Tactical cruiser (MVAM) | USS Prometheus |
| Protostar | 25th century | Experimental | USS Protostar NCC-97937 |

## Klingon Empire

| Class | Role | Notable Vessels |
|-------|------|-----------------|
| D7 | Battle cruiser | IKS Gr'oth |
| K't'inga | Battle cruiser (refit D7) | IKS Amar |
| Bird-of-Prey | Scout / raider (cloaking) | IKS Rotarran, HMS Bounty |
| Vor'cha | Attack cruiser | IKS Bortas |
| Negh'Var | Warship (flagship) | IKS Negh'Var |

## Romulan Star Empire

| Class | Role | Notable Vessels |
|-------|------|-----------------|
| Bird-of-Prey (Romulan) | Warbird (23rd century) | Various |
| D'deridex | Warbird (24th century, dual hull) | IRW Khazara |
| Valdore | Warbird (late 24th century) | IRW Valdore |

## Cardassian Union

| Class | Role | Notable Vessels |
|-------|------|-----------------|
| Galor | Warship | Various |
| Keldon | Advanced warship | Various |

## Borg Collective

| Type | Role |
|------|------|
| Cube | Standard vessel (heavily armed) |
| Sphere | Scout / auxiliary |
| Tactical Cube | Enhanced combat variant |

## Dominion

| Type | Role |
|------|------|
| Jem'Hadar attack ship | Fighter / patrol |
| Jem'Hadar battle cruiser | Capital ship |
| Jem'Hadar battleship | Heavy capital ship |

Note: This is original reference data. For detailed specifications, use the get_starship tool.`;
