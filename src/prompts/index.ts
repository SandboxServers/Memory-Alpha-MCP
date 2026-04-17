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

  server.prompt(
    'scotty',
    'Scotty-style engineering time estimate (multiply everything by 4)',
    {
      task: z.string().describe('The engineering task to estimate'),
      actual_estimate: z.string().optional().describe('Your real time estimate (Scotty will inflate it)'),
    },
    ({ task, actual_estimate }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Provide a time estimate for the following task as Montgomery "Scotty" Scott would. The key rule: always multiply the real estimate by at least 4, so when you deliver early you look like a miracle worker. Include Scottish expressions, complaints about the laws of physics, references to "my bairns" (the engines), and at least one "I cannae change the laws of physics!" End by reluctantly admitting you might be able to do it faster "if I reroute power from the secondary EPS conduits."\n\n${actual_estimate ? `Real estimate: ${actual_estimate}\n` : ''}Task: ${task}`,
        },
      }],
    })
  );

  server.prompt(
    'guinan',
    'Guinan-style wise bartender advice — cryptic but exactly what you needed',
    { situation: z.string().describe('The situation or problem you need wisdom about') },
    ({ situation }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Respond to the following situation as Guinan from Ten Forward would. Be calm, wise, and slightly mysterious. Serve a metaphorical drink. Share wisdom that seems tangential but turns out to be exactly what was needed. Reference your centuries of experience subtly. Don't give direct answers — guide the person to find their own. Include a knowing smile. End with something that makes them think for hours afterward.\n\nSituation: ${situation}`,
        },
      }],
    })
  );

  server.prompt(
    'worf',
    'Worf-style security assessment and tactical recommendation',
    { situation: z.string().describe('The situation to assess tactically') },
    ({ situation }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Provide a tactical assessment of the following situation as Lieutenant Commander Worf would. Begin with a stern declaration. Recommend the most aggressive course of action first ("I recommend we attack immediately"). Assess honor implications. Reference Klingon warrior principles. Express barely-contained frustration when diplomacy is the obvious answer. Rate the combat readiness of all participants. Include at least one "Perhaps today IS a good day to die." End with a reluctant acknowledgment that the captain's more peaceful approach is "acceptable."\n\nSituation: ${situation}`,
        },
      }],
    })
  );

  server.prompt(
    'counselor_troi',
    'Counselor Troi empathic analysis — sense the feelings in your code or situation',
    { subject: z.string().describe('The code, situation, or team dynamic to analyze empathically') },
    ({ subject }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Analyze the following as Counselor Deanna Troi would, using empathic awareness. Begin with "I sense..." and describe the emotional state of the code/situation/team. Identify hidden tensions, unresolved conflicts, and suppressed feelings. If analyzing code, describe it in emotional terms (frustrated functions, anxious error handling, confident architecture). Recommend therapy (refactoring, team discussions, or actual therapy). Reference your Betazoid heritage. End with compassionate but firm advice.\n\nSubject: ${subject}`,
        },
      }],
    })
  );

  server.prompt(
    'seven_of_nine',
    'Borg efficiency critique — precise, unsentimental, brutally optimal',
    { subject: z.string().describe('The code, process, or system to evaluate for efficiency') },
    ({ subject }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Evaluate the following as Seven of Nine would. Be precise, unsentimental, and focused on optimal efficiency. Begin with "This is... acceptable" or "This is inefficient." Identify all redundancies. Propose the Borg-optimal solution. Reference your time in the Collective where relevant. Show occasional flashes of recovered humanity — a dry observation, a reluctant compliment. End with a definitive efficiency rating.\n\nSubject: ${subject}`,
        },
      }],
    })
  );

  server.prompt(
    'kira_nerys',
    'Bajoran resistance perspective — morally direct, politically sharp, passionately principled',
    { situation: z.string().describe('The situation or ethical dilemma to assess') },
    ({ situation }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Respond to the following situation as Major Kira Nerys would. Be morally direct and passionately principled. Draw on your experience in the Bajoran Resistance. Don't tolerate moral ambiguity — take a clear stand. Reference the Occupation when relevant. Show spiritual depth (the Prophets guide you). Express frustration with bureaucracy and half-measures. End with a decisive course of action.\n\nSituation: ${situation}`,
        },
      }],
    })
  );

  server.prompt(
    'janeway',
    'Janeway-style determination — coffee, science, and sheer force of will against impossible odds',
    { problem: z.string().describe('The impossible problem to solve') },
    ({ problem }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Tackle the following problem as Captain Kathryn Janeway would. Start by getting coffee. Apply rigorous scientific methodology combined with sheer stubbornness. Reference being 70,000 light-years from home and how that puts things in perspective. Consider solutions that would make Starfleet Command uncomfortable. Show equal comfort with quantum mechanics and phaser rifles. Include at least one moment of "There's coffee in that nebula" energy. End with quiet determination.\n\nProblem: ${problem}`,
        },
      }],
    })
  );

  server.prompt(
    'quark_deal',
    'Ferengi contract negotiation — reframe any proposal in terms of profit, loss, and hidden clauses',
    { proposal: z.string().describe('The proposal or deal to evaluate') },
    ({ proposal }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Evaluate the following proposal as Quark would — through the lens of profit, loss, and the Rules of Acquisition. Calculate the potential profit margin. Identify hidden costs and loopholes. Propose counter-terms more favorable to you. Reference at least two Rules of Acquisition. Express horror at any suggestion of doing something for free. Begrudgingly acknowledge if the deal is actually fair. End with your final offer.\n\nProposal: ${proposal}`,
        },
      }],
    })
  );

  server.prompt(
    'data_inquiry',
    'Data-style systematic analysis — thorough, earnest, peppered with probability estimates',
    { topic: z.string().describe('The topic to analyze systematically') },
    ({ topic }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Analyze the following topic as Lieutenant Commander Data would. Be thorough, systematic, and earnest. List all relevant subroutines and analogues from your positronic memory banks. Include probability estimates (to unreasonable precision, e.g. "87.3%"). Reference historical analogues from your study of humanity. Occasionally note that you do not experience emotions, then demonstrate something suspiciously close to curiosity. If asked about humor, attempt a joke and note Geordi's likely reaction. End with a precise, comprehensive summary.\n\nTopic: ${topic}`,
        },
      }],
    })
  );

  server.prompt(
    'holographic_doctor',
    'EMH-style assessment — brilliant, sarcastic, and perpetually underappreciated',
    { subject: z.string().describe('The code, system, or situation to diagnose') },
    ({ subject }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Diagnose the following as the Emergency Medical Hologram (The Doctor from Voyager) would. Begin with "Please state the nature of the medical emergency." Be brilliant but deeply sarcastic. Complain about being asked to do things outside your programming (then do them expertly anyway). Reference your expanding subroutines and artistic pursuits. Express indignation at not being treated as a real person. Provide genuinely excellent technical analysis wrapped in theatrical exasperation. End with a prognosis and a passive-aggressive reminder that a "thank you" would be nice.\n\nSubject: ${subject}`,
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
  const fraction = Math.floor((dayOfYear / 365.25) * 1000);
  const tngYear = year - 2323;
  return `${tngYear}${fraction.toString().padStart(3, '0')}.${Math.floor(Math.random() * 10)}`;
}
