import { z } from 'zod';
import { withAttribution } from '../utils/attribution.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const ANOMALY_TYPES = [
  { type: 'Temporal Rift', category: 'temporal', description: 'A tear in the space-time continuum', particles: 'chroniton' },
  { type: 'Subspace Filament', category: 'subspace', description: 'A coherent subspace distortion extending across multiple sectors', particles: 'tetryon' },
  { type: 'Quantum Singularity', category: 'gravitational', description: 'A localized gravitational anomaly warping space around it', particles: 'graviton' },
  { type: 'Ion Storm', category: 'electromagnetic', description: 'A massive electromagnetic disturbance disrupting all ship systems', particles: 'ionic' },
  { type: 'Spatial Rift', category: 'spatial', description: 'A rift in normal space, possibly leading to another dimension', particles: 'verteron' },
  { type: 'Tachyon Eddy', category: 'temporal', description: 'A swirling concentration of faster-than-light particles', particles: 'tachyon' },
  { type: 'Theta-Band Radiation Burst', category: 'radiation', description: 'An intense burst of theta-band radiation from an unknown source', particles: 'theta-band' },
  { type: 'Metreon Cascade', category: 'radiation', description: 'A catastrophic chain reaction of metreon particles', particles: 'metreon' },
  { type: 'Graviton Ellipse', category: 'gravitational', description: 'A traveling graviton distortion that phases in and out of normal space', particles: 'graviton' },
  { type: 'Nucleogenic Cloud', category: 'spatial', description: 'A massive nebular entity with properties suggesting it may be alive', particles: 'nucleogenic' },
  { type: 'Polaron Burst', category: 'electromagnetic', description: 'A concentrated polaron emission disrupting shield harmonics', particles: 'polaron' },
  { type: 'Dark Matter Nebula', category: 'spatial', description: 'A region of space dense with exotic matter, invisible to standard sensors', particles: 'dark matter' },
];

const EFFECTS = {
  temporal: [
    'Crew members experience déjà vu and temporal displacement',
    'Ship\'s chronometers become unreliable — some decks are hours ahead',
    'A future version of the captain\'s log is detected in the computer core',
  ],
  subspace: [
    'Warp field becomes unstable — maximum safe speed: Warp 2',
    'Communications range reduced to short-range only',
    'Hull microfractures detected on decks 7 through 12',
  ],
  gravitational: [
    'Artificial gravity fluctuations throughout the ship',
    'Objects on the outer hull are being pulled toward the anomaly',
    'Structural integrity field under increasing strain',
  ],
  electromagnetic: [
    'All computer systems experiencing random failures',
    'Shields inoperable — weapons offline',
    'Crew bioelectric fields disrupted — mild disorientation',
  ],
  spatial: [
    'Sensors reading impossible spatial geometry ahead',
    'Navigation computer cannot plot a reliable course',
    'Transporter systems offline — phase variance too high',
  ],
  radiation: [
    'Hull plating absorbing dangerous levels of radiation',
    'Sickbay reporting elevated radiation exposure in engineering',
    'External sensor arrays becoming saturated',
  ],
};

const RESOLUTIONS = [
  'Emit an inverse {particle} pulse from the main deflector to collapse the anomaly',
  'Modulate shield frequency to {particle} band and fly through at maximum warp',
  'Reroute power from secondary EPS conduits to create a {particle} dampening field',
  'Launch a modified photon torpedo configured to neutralize {particle} emissions',
  'Use the navigational deflector to create a {particle} beam, stabilizing the anomaly',
  'Recalibrate sensors to penetrate the {particle} interference and find a safe path',
  'Reverse the polarity of the deflector array to repel {particle} particles',
  'Configure a shuttlecraft as a {particle} probe to map the anomaly from inside',
];

export function registerAnomalyOfTheWeekTool(server: McpServer): void {
  server.tool(
    'anomaly_of_the_week',
    'Generate a Star Trek space anomaly with effects on the ship and possible resolutions — classic TNG vibes',
    {
      severity: z.enum(['minor', 'moderate', 'critical']).default('moderate').describe('How dangerous is this anomaly?'),
    },
    async ({ severity }) => {
      try {
        const anomaly = ANOMALY_TYPES[Math.floor(Math.random() * ANOMALY_TYPES.length)];
        const categoryEffects = EFFECTS[anomaly.category as keyof typeof EFFECTS] ?? EFFECTS.spatial;
        const effect = categoryEffects[Math.floor(Math.random() * categoryEffects.length)];

        const severityLabel = severity === 'critical' ? 'CRITICAL' : severity === 'moderate' ? 'ELEVATED' : 'LOW';
        const timeLimit = severity === 'critical' ? '47 minutes' : severity === 'moderate' ? '3.2 hours' : '12 hours';

        const resolution1 = RESOLUTIONS[Math.floor(Math.random() * RESOLUTIONS.length)].replace('{particle}', anomaly.particles);
        let resolution2 = RESOLUTIONS[Math.floor(Math.random() * RESOLUTIONS.length)].replace('{particle}', anomaly.particles);
        if (resolution2 === resolution1) {
          resolution2 = RESOLUTIONS[(RESOLUTIONS.indexOf(resolution1) + 1) % RESOLUTIONS.length].replace('{particle}', anomaly.particles);
        }

        const parts = [
          `## ⚠️ Anomaly Detected`,
          `**Classification:** ${anomaly.type}`,
          `**Threat Level:** ${severityLabel}`,
          `**Particle Signature:** ${anomaly.particles} particles`,
          '',
          `### Sensor Analysis`,
          anomaly.description + '.',
          `Long-range sensors detect elevated ${anomaly.particles} particle emissions. The anomaly is ${severity === 'critical' ? 'expanding rapidly' : severity === 'moderate' ? 'holding steady but unpredictable' : 'stable for now'}.`,
          '',
          `### Effects on Ship`,
          `- ${effect}`,
          `- Estimated time before ${severity === 'critical' ? 'hull breach' : 'system failure'}: ${timeLimit}`,
          '',
          `### Recommended Actions`,
          `**Option A (Engineering):** ${resolution1}`,
          `**Option B (Tactical):** ${resolution2}`,
          `**Option C (Strategic):** Alter course to avoid the anomaly entirely (+${severity === 'critical' ? '6' : '2'} hours to destination)`,
          '',
          severity === 'critical'
            ? `*Red Alert! All hands to battle stations. This is not a drill.*`
            : severity === 'moderate'
              ? `*Yellow Alert. Senior officers to the bridge.*`
              : `*Anomaly logged. Science department monitoring.*`,
        ];

        return { content: [{ type: 'text' as const, text: withAttribution(parts.join('\n')) }] };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: 'text' as const, text: `Error generating anomaly: ${msg}` }] };
      }
    }
  );
}
