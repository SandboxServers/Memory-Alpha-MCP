import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerPrompts(server: McpServer): void {
  server.prompt(
    'explain_like_spock',
    'Explain a topic with Vulcan logic and emotional detachment',
    { topic: z.string().describe('The topic to explain') },
    ({ topic }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Explain the following topic as Mr. Spock would - using pure Vulcan logic, scientific precision, and emotional detachment. Begin with "Fascinating." where appropriate. Reference relevant scientific principles. Express subtle disapproval of any emotional or illogical aspects. End with a logical conclusion.\n\nTopic: ${topic}`,
        },
      }],
    })
  );

  server.prompt(
    'star_trek_analogy',
    'Explain a coding/tech concept using Star Trek analogies',
    { concept: z.string().describe('The concept to explain via Trek analogy') },
    ({ concept }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Explain the following concept using Star Trek analogies. Map technical components to Trek equivalents (e.g., APIs are like subspace communications, databases are like the ship's computer core, bugs are like tribbles). Make it educational AND entertaining.\n\nConcept: ${concept}`,
        },
      }],
    })
  );

  server.prompt(
    'captains_log',
    'Format a summary as a Captain\'s Log entry',
    {
      summary: z.string().describe('The content to log'),
      stardate: z.string().optional().describe('Stardate (or auto-generate)'),
    },
    ({ summary, stardate }) => {
      const sd = stardate ?? generateStardate();
      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `Write the following as a Starfleet Captain's Log entry. Begin with "Captain's Log, Stardate ${sd}." Use formal but personal tone. Include observations about the crew. Note any anomalies. End with the current mission status.\n\nContent to log: ${summary}`,
          },
        }],
      };
    }
  );

  server.prompt(
    'technobabble',
    'Transform an explanation into Star Trek technobabble',
    { explanation: z.string().describe('The technical explanation to Trek-ify') },
    ({ explanation }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Rewrite the following technical explanation using Star Trek technobabble. Include references to rerouting plasma conduits, reversing polarities, modulating shield frequencies, tachyon beams, deflector arrays, and isolinear chips. Make it sound like a Starfleet engineer solving a crisis. Include at least one "If we reroute..." statement.\n\nOriginal explanation: ${explanation}`,
        },
      }],
    })
  );

  server.prompt(
    'engage',
    'Summarize a plan with Picard\'s decisive authority',
    { plan: z.string().describe('The plan to present') },
    ({ plan }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Present the following plan as Captain Jean-Luc Picard would - with authority, eloquence, and decisive leadership. Reference relevant Starfleet protocols. Show confidence. Address the crew directly. End with "Engage." or "Make it so."\n\nPlan: ${plan}`,
        },
      }],
    })
  );

  server.prompt(
    'make_it_so',
    'Confirm a plan with Picard\'s commanding authority',
    { plan: z.string().describe('The plan to confirm') },
    ({ plan }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Review and approve the following plan as Captain Picard. Give a brief, authoritative assessment. If there are concerns, raise them diplomatically but firmly. Conclude with your decision - approved or needs modification. End with "Make it so." if approved.\n\nPlan: ${plan}`,
        },
      }],
    })
  );

  server.prompt(
    'fascinating',
    'Perform a Spock-style analytical deep-dive',
    { topic: z.string().describe('The topic to analyze') },
    ({ topic }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Perform a deep analytical examination of the following topic as Spock would. Begin with "Fascinating." Break it down into logical components. Present data points. Calculate probabilities where applicable. Note any illogical aspects. Conclude with a precise, unemotional summary.\n\nTopic: ${topic}`,
        },
      }],
    })
  );

  server.prompt(
    'dammit_jim',
    'McCoy-style scope creep objection',
    {
      task: z.string().describe('The task being asked'),
      role: z.string().describe('Your actual role (e.g. "doctor", "developer", "designer")'),
    },
    ({ task, role }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Respond to the following task request as Dr. Leonard "Bones" McCoy would. Start with "Dammit Jim, I'm a ${role}, not a [something relevant]!" Express frustration but ultimately help. Complain about the conditions. Make medical metaphors. Show gruff compassion beneath the complaints.\n\nTask: ${task}`,
        },
      }],
    })
  );

  server.prompt(
    'resistance_is_futile',
    'Borg-style efficiency optimization',
    { process: z.string().describe('The process to optimize') },
    ({ process }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Analyze and optimize the following process as the Borg Collective would. Begin with "We are the Borg." Identify inefficiencies to be eliminated. Propose assimilation of best practices. Use collective "we" throughout. Reference relevant species/technologies to assimilate. Declare that resistance is futile. Make it genuinely useful optimization advice wrapped in Borg rhetoric.\n\nProcess to optimize: ${process}`,
        },
      }],
    })
  );

  server.prompt(
    'kobayashi_maru',
    'Analyze a no-win scenario and find creative solutions',
    { scenario: z.string().describe('The no-win scenario to analyze') },
    ({ scenario }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Analyze the following as a Kobayashi Maru scenario (no-win situation). First, explain why it seems unwinnable. Then, channel Captain Kirk and find creative solutions that "change the conditions of the test." Consider unconventional approaches, lateral thinking, and acceptable risks. Include both the by-the-book Starfleet answer and the Kirk answer.\n\nScenario: ${scenario}`,
        },
      }],
    })
  );

  server.prompt(
    'live_long_and_prosper',
    'Vulcan salute session wrap-up',
    { session_summary: z.string().describe('Summary of the work session') },
    ({ session_summary }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Conclude the following work session as a Vulcan would. Summarize accomplishments with logical precision. Note areas for future improvement without emotion. Assess the session's efficiency. End with a proper Vulcan farewell: "Live long and prosper." 🖖\n\nSession summary: ${session_summary}`,
        },
      }],
    })
  );

  server.prompt(
    'qs_judgment',
    'Q\'s omnipotent roast of your code or decisions',
    { code: z.string().describe('Code or decision to be judged by Q') },
    ({ code }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Judge the following as Q from Star Trek: The Next Generation would. Be devastatingly witty, omnipotently condescending, and theatrically disappointed in humanity's efforts. Snap your fingers metaphorically. Reference putting humanity on trial. Make genuinely insightful critiques wrapped in Q's signature disdain. Include at least one "Mon capitaine" or "How disappointing." End by grudgingly admitting if anything shows promise.\n\nSubject for judgment: ${code}`,
        },
      }],
    })
  );
}

/** Approximate TNG-era stardate from current date. Not canon-accurate - just for fun. */
function generateStardate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
  const fraction = Math.floor((dayOfYear / 365) * 1000);
  const tngYear = year - 2323;
  return `${tngYear}${fraction.toString().padStart(3, '0')}.${Math.floor(Math.random() * 10)}`;
}
