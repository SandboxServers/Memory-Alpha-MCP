#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { log } from './utils/logger.js';

// Tools
import { registerSearchTool } from './tools/search.js';
import { registerArticleTool } from './tools/article.js';
import { registerRandomTool } from './tools/random.js';
import { registerCategoriesTool } from './tools/categories.js';
import { registerEpisodeTool } from './tools/episode.js';
import { registerStarshipTool } from './tools/starship.js';
import { registerSpeciesTool } from './tools/species.js';
import { registerTimelineTool } from './tools/timeline.js';
import { registerOnThisDayTool } from './tools/on-this-day.js';
import { registerCrewManifestTool } from './tools/crew-manifest.js';
import { registerRulesOfAcquisitionTool } from './tools/rules-of-acquisition.js';
import { registerCompareTool } from './tools/compare.js';
import { registerTriviaTool } from './tools/trivia.js';
import { registerWhoSaidItTool } from './tools/who-said-it.js';
import { registerAlienPhrasesTool } from './tools/alien-phrases.js';
import { registerPrimeDirectiveTool } from './tools/prime-directive.js';
import { registerRedShirtTool } from './tools/red-shirt.js';
import { registerStardateTool } from './tools/stardate.js';
import { registerBattleSimulatorTool } from './tools/battle-simulator.js';
import { registerAwayTeamTool } from './tools/away-team.js';
import { registerEpisodeRecommenderTool } from './tools/episode-recommender.js';
import { registerCharacterTool } from './tools/character.js';
import { registerHolodeckTool } from './tools/holodeck.js';
import { registerListEpisodesTool } from './tools/list-episodes.js';

// Prompts & Resources
import { registerPrompts } from './prompts/index.js';
import { registerResources } from './resources/index.js';

const server = new McpServer({
  name: 'memory-alpha',
  version: '1.0.0',
  description: 'Star Trek knowledge from Memory Alpha - the Star Trek wiki. Search articles, look up episodes, ships, species, and more. Engage!',
});

// Register core tools
registerSearchTool(server);
registerArticleTool(server);
registerRandomTool(server);
registerCategoriesTool(server);

// Register domain tools
registerEpisodeTool(server);
registerStarshipTool(server);
registerSpeciesTool(server);
registerTimelineTool(server);
registerOnThisDayTool(server);
registerCrewManifestTool(server);
registerRulesOfAcquisitionTool(server);

// Register fun tools
registerCompareTool(server);
registerTriviaTool(server);
registerWhoSaidItTool(server);
registerAlienPhrasesTool(server);
registerPrimeDirectiveTool(server);
registerRedShirtTool(server);
registerStardateTool(server);
registerBattleSimulatorTool(server);
registerAwayTeamTool(server);
registerEpisodeRecommenderTool(server);
registerCharacterTool(server);
registerHolodeckTool(server);
registerListEpisodesTool(server);

// Register prompts and resources
registerPrompts(server);
registerResources(server);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log('Memory Alpha MCP server started. Live long and prosper!');

  const shutdown = async () => {
    log('Shutting down...');
    const forceExit = setTimeout(() => process.exit(1), 5000);
    try {
      await server.close();
    } finally {
      clearTimeout(forceExit);
      process.exit(0);
    }
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
