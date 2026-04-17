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

  server.resource(
    'factions',
    'trek://factions',
    { description: 'Major Star Trek factions — government type, home region, notable treaties, diplomatic stance', mimeType: 'text/plain' },
    async () => ({
      contents: [{
        uri: 'trek://factions',
        text: FACTIONS_DATA,
        mimeType: 'text/plain',
      }],
    })
  );

  server.resource(
    'prime-directive-cases',
    'trek://prime-directive-cases',
    { description: 'Canonical episodes where the Prime Directive was tested, with dilemmas and outcomes', mimeType: 'text/plain' },
    async () => ({
      contents: [{
        uri: 'trek://prime-directive-cases',
        text: PRIME_DIRECTIVE_CASES_DATA,
        mimeType: 'text/plain',
      }],
    })
  );

  server.resource(
    'technology-index',
    'trek://technology-index',
    { description: 'Key Star Trek technologies — how they work, notable failures, and series of origin', mimeType: 'text/plain' },
    async () => ({
      contents: [{
        uri: 'trek://technology-index',
        text: TECHNOLOGY_INDEX_DATA,
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

const FACTIONS_DATA = `# Star Trek Major Factions

| Faction | Government Type | Home Region | Capital/Homeworld | Notable Treaties |
|---------|----------------|-------------|-------------------|-----------------|
| United Federation of Planets | Federal republic (representative democracy) | Alpha/Beta Quadrant | Earth (Paris, San Francisco) | Khitomer Accords (Klingon), Treaty of Algeron (Romulan), Bajoran Accession |
| Klingon Empire | Feudal monarchy (High Council) | Beta Quadrant | Qo'noS | Khitomer Accords (Federation), brief alliance with Cardassians |
| Romulan Star Empire | Oligarchic senate + Tal Shiar (secret police) | Beta Quadrant | Romulus | Treaty of Algeron (Federation), temporary Dominion War alliance |
| Cardassian Union | Military dictatorship (Central Command / Detapa Council) | Alpha Quadrant | Cardassia Prime | Federation-Cardassian Treaty, Dominion alliance (later betrayed) |
| Dominion | Theocratic empire (Founders/Changelings as gods) | Gamma Quadrant | Great Link (Founders' homeworld) | Dominion War ceasefire, non-aggression pacts with multiple Alpha powers |
| Borg Collective | Hive mind (no individual government) | Delta Quadrant | Unimatrix Zero / various unicomplexes | None — the Borg do not negotiate (except briefly with Voyager, Species 8472 conflict) |
| Ferengi Alliance | Plutocratic oligarchy (Grand Nagus + Commerce Authority) | Alpha Quadrant | Ferenginar | Trade agreements with most powers; officially neutral during Dominion War |
| Tholian Assembly | Isolationist autocracy | Alpha Quadrant (border) | Tholia | Territorial agreements; extremely hostile to trespassers |
| Breen Confederacy | Unknown (secretive) | Alpha Quadrant | Breen | Late Dominion War alliance with the Dominion |
| Bajoran Republic | Theocratic democracy (Kai + First Minister) | Alpha Quadrant | Bajor | Federation Accession, temporary non-aggression pact with Dominion |

## Diplomatic Stances
- **Federation:** Diplomacy first, military last. Seeks alliances and mutual benefit. Will fight when cornered.
- **Klingon:** Respect through strength. Honor demands combat readiness but also values warrior's bonds.
- **Romulan:** Trust no one. Everything is intelligence gathering. Alliances are temporary tools.
- **Cardassian:** Order above all. Bureaucratic negotiation masking military intent.
- **Dominion:** Obedience or destruction. No middle ground unless strategically necessary.
- **Ferengi:** Everything is negotiable. Peace is good for business (Rule #35). War is good for business (Rule #34).

Note: These are original reference descriptions. For detailed canon information, use the article tools.`;

const PRIME_DIRECTIVE_CASES_DATA = `# Prime Directive — Canonical Test Cases

## 1. "Pen Pals" (TNG, S2E15)
**Dilemma:** Data receives a distress signal from a child on a pre-warp planet facing geological destruction.
**Decision:** Picard allows intervention to save the planet, then wipes the child's memory of contact.
**Precedent:** Compassion can override non-interference when a civilization faces extinction through natural causes.

## 2. "Who Watches the Watchers" (TNG, S3E4)
**Dilemma:** A Federation observation post is exposed to a pre-warp Mintakan civilization, who begin to worship Picard as a god.
**Decision:** Picard reveals himself as mortal to undo the cultural contamination.
**Precedent:** Correcting accidental contamination is preferable to allowing a false religion to form.

## 3. "Homeward" (TNG, S7E13)
**Dilemma:** Worf's foster brother secretly relocates a pre-warp village to save them from atmospheric dissipation.
**Decision:** Picard is furious but accepts the fait accompli. One villager who discovers the truth commits suicide.
**Precedent:** Even well-intentioned intervention can cause profound harm. The Prime Directive exists for a reason.

## 4. "Dear Doctor" (ENT, S1E13)
**Dilemma:** Phlox discovers a cure for a species-wide disease but the affected species dominates another species that evolution may favor.
**Decision:** Archer withholds the cure, providing only a treatment to slow the disease, in what many consider the proto-Prime Directive's darkest application.
**Precedent:** Deeply controversial. Some argue this is eugenics-by-inaction.

## 5. "A Private Little War" (TOS, S2E19)
**Dilemma:** Klingons are arming one faction on a pre-warp planet. Kirk considers arming the other side to maintain balance.
**Decision:** Kirk provides equivalent weapons — a "balance of power" approach. No one is happy.
**Precedent:** When another power is already interfering, maintaining balance may be the least-bad option.

## 6. "Justice" (TNG, S1E8)
**Dilemma:** Wesley Crusher accidentally violates a local law on an alien world; the punishment is death.
**Decision:** Picard refuses to allow the execution, directly overriding local law. Argues the Prime Directive is not a suicide pact.
**Precedent:** The Prime Directive does not require Starfleet to sacrifice its own people to local customs.

## 7. "Symbiosis" (TNG, S1E22)
**Dilemma:** One species is addicted to a "medicine" that is actually a narcotic, supplied by another species exploiting them.
**Decision:** Picard refuses to help repair the supply ships, allowing the supply to dwindle naturally.
**Precedent:** Indirect action (refusing to help perpetuate a system) is acceptable where direct intervention is not.

## 8. "The Omega Directive" (VOY, S4E21)
**Dilemma:** Omega particles are detected — the only known threat that overrides the Prime Directive per Starfleet General Order 0.
**Decision:** Janeway destroys the particles despite a species' claim to them as a spiritual artifact.
**Precedent:** The Omega Directive supersedes the Prime Directive. Some threats are too dangerous for non-interference.

## 9. "Bread and Circuses" (TOS, S2E25)
**Dilemma:** A planet has developed a Roman Empire-like civilization with 20th-century technology. A Starfleet captain has already violated the Prime Directive by interfering.
**Decision:** Kirk ultimately does not intervene further; the prior captain's interference is condemned.
**Precedent:** One violation does not justify further violations.

## 10. "First Contact" (TNG, S4E15)
**Dilemma:** Riker is injured on a pre-warp planet during a first contact survey. His alien anatomy is discovered.
**Decision:** Picard reveals the Federation to the planet's leader, who decides her people aren't ready and asks the Federation to leave.
**Precedent:** The contacted species' own assessment of readiness should be respected.

Note: These are original summaries. For detailed episode information, use the episode tools.`;

const TECHNOLOGY_INDEX_DATA = `# Star Trek Technology Index

## Warp Drive
**How It Works:** Creates a subspace bubble (warp field) that contracts space ahead and expands space behind the vessel, allowing effective FTL travel without violating relativity within the bubble.
**Key Components:** Dilithium crystals, matter-antimatter reactor (warp core), plasma injectors, warp nacelles
**Notable Failures:** Warp core breaches (catastrophic matter-antimatter containment failure), subspace damage from high-warp travel (TNG: "Force of Nature")
**Introduced:** ENT (NX-01, Warp 5); conceptually, Zefram Cochrane's first warp flight in 2063

## Transporter
**How It Works:** Converts matter to an energy pattern, transmits it via annular confinement beam, and reassembles it at the destination. The Heisenberg compensator handles quantum uncertainty (don't ask how).
**Key Components:** Pattern buffer, Heisenberg compensator, phase transition coils, targeting scanners
**Notable Failures:** Pattern degradation, transporter psychosis, duplicate creation (TNG: "Second Chances"), merging (VOY: "Tuvix")
**Introduced:** ENT (though treated with deep suspicion by early crews)

## Holodeck
**How It Works:** Combines holographic projections, force fields, and replicated matter to create immersive environments. Objects near the user are replicated; distant scenery is holographic.
**Key Components:** Holoemitters, force field generators, replicator systems, character AI subroutines
**Notable Failures:** Safety protocol failures (very frequent), characters gaining sentience (Moriarty, Vic Fontaine), addiction (Barclay)
**Introduced:** TNG (though TAS featured a "recreation room")

## Replicator
**How It Works:** Rearranges matter at the molecular level using transporter-derived technology. Can create food, tools, clothing, and components from stored energy and raw material.
**Key Limitations:** Cannot replicate living tissue, latinum, dilithium, or certain complex molecules. Replicated food is nutritionally identical but "not quite the same" according to purists.
**Introduced:** TNG (TOS used food synthesizers, a simpler predecessor)

## Shields (Deflector Shields)
**How It Works:** Projects an energy barrier around the vessel that absorbs and deflects incoming weapons fire, radiation, and debris.
**Key Components:** Shield generators, shield emitters, graviton polarity source
**Notable Failures:** Shield frequency can be matched by enemies (Borg adapt constantly), shield harmonics can be disrupted by specific weapon types
**Introduced:** TOS

## Cloaking Device
**How It Works:** Bends light and sensor emissions around a vessel, rendering it virtually invisible. Most cloaking devices prevent firing weapons while active.
**Key Limitation:** Treaty of Algeron prohibits Federation use of cloaking technology (with exceptions for the USS Defiant via Romulan agreement).
**Notable Variants:** Romulan (standard), Klingon (Bird-of-Prey), Suliban (temporal), Phasing cloak (illegal, TNG: "The Pegasus")
**Introduced:** TOS ("Balance of Terror")

## Universal Translator
**How It Works:** Analyzes language patterns, syntax, and context to provide real-time translation. Uses a database of known languages plus pattern-matching algorithms for new ones.
**Notable Failures:** Tamarian language (communicates entirely through metaphor/allegory — "Darmok and Jalad at Tanagra"), some non-verbal species
**Introduced:** TOS (handheld); ENT (less reliable, earlier version)

## Tricorder
**How It Works:** A multifunction handheld device combining sensors, computers, and recording equipment. Medical tricorders include additional bioscanners.
**Variants:** Standard (general survey), medical (biosigns, diagnosis), engineering (system diagnostics)
**Introduced:** TOS

Note: These are original reference descriptions. For detailed canon specifications, use the article tools.`;
