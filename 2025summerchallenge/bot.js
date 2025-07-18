// Victory Conditions
// In this league, you will have exactly 1 turn to get both 
// your agents behind the best of two adjacent tiles behind 
// cover then shoot the opposing enemy with the least protection 
// from cover (of the two closest enemies).
const myId = parseInt(readline()); // Your player id (0 or 1)
const agentCount = parseInt(readline()); // Total number of agents in the game
const myAgents = [];
const myAgentIds = new Set();
const oppAgents = [];
const oppAgentIds = new Set();
const TILE_EMPTY = 0;
const TILE_LOW_COVER = 1;
const TILE_HIGH_COVER = 2;

for (let i = 0; i < agentCount; i++) {
  const agentInputs = readline().split(' ');
  
  const currAgent = {  
    agentId: parseInt(agentInputs[0]), // Unique identifier for this agent
    player: parseInt(agentInputs[1]), // Player id of this agent
    shootCooldown: parseInt(agentInputs[2]), // Number of turns between each of this agent's shots
    optimalRange: parseInt(agentInputs[3]), // Maximum manhattan distance for greatest damage output
    soakingPower: parseInt(agentInputs[4]), // Damage output within optimal conditions
    splashBombs: parseInt(agentInputs[5]), // Number of splash bombs this can throw this game
  };

  if (myId == currAgent.player) {
    myAgentIds.add(currAgent.agentId);
    myAgents.push(currAgent);
  } else {
    oppAgentIds.add(currAgent.agentId);
    oppAgents.push(currAgent);
  }

}


const mapInputs = readline().split(' ');
const gameMap = {
  width: parseInt(mapInputs[0]), // Width of the game map
  height: parseInt(mapInputs[1]), // Height of the game map
  board: [],
};

for (let i = 0; i < gameMap.height; i++) {
  const row = [];
  const boardInputs = readline().split(' ');
  for (let j = 0; j < gameMap.width; j++) {
    const x = parseInt(boardInputs[3*j]);// X coordinate, 0 is left edge
    const y = parseInt(boardInputs[3*j+1]);// Y coordinate, 0 is top edge
    const tileType = parseInt(boardInputs[3*j+2]);
    row.push(tileType);  
  }
  gameMap.board.push(row);
}

// game loop
while (true) {
  const agentCount = parseInt(readline());
  const agents = [];
  for (let i = 0; i < agentCount; i++) {
    const inputs = readline().split(' ');
    const agent = {
      agentId: parseInt(inputs[0]),
      x: parseInt(inputs[1]),
      y: parseInt(inputs[2]),
      cooldown: parseInt(inputs[3]), // Number of turns before this agent can shoot
      splashBombs: parseInt(inputs[4]),
      wetness: parseInt(inputs[5]), // Damage (0-100) this agent has taken
    };
    
    agents.push(agent);
  }

  const moves = [];
  for (const agent of agents) {
    if (myAgentIds.has(agent.agentId)) {
      const xOffset = agent.x == 0 ? 1 : -1;
      let move = "";
      if (gameMap.board[agent.y - 1][agent.x + xOffset] > gameMap.board[agent.y + 1][agent.x + xOffset]) {
        move += `${agent.agentId}; MOVE ${agent.x} ${agent.y - 1};`;
      } else {
        move += `${agent.agentId}; MOVE ${agent.x} ${agent.y + 1};`;
      }

      let targetAgentId = -1;
      const agentOffset = agent.agentId == 1 ? 2 : 4;
      const targetOffset = agent.x == 0 ? -1 : 1;
      const tile1 = gameMap.board[agents[agentOffset].y][agents[agentOffset].x + targetOffset];
      const tile2 = gameMap.board[agents[agentOffset + 1].y][agents[agentOffset + 1].x + targetOffset];
      targetAgentId = tile1 < tile2 ? agentOffset + 1 : agentOffset + 2;
      move += `SHOOT ${targetAgentId}`;
      moves.push(move);
    }
  }
  
    
  const myAgentCount = parseInt(readline()); // Number of alive agents controlled by you
  for (let i = 0; i < myAgentCount; i++) {

        // Write an action using console.log()
        // To debug: console.error('Debug messages...');


    // One line per agent: <agentId>;<action1;action2;...> actions are "MOVE x y | SHOOT id | THROW x y | HUNKER_DOWN | MESSAGE text"
    console.log(`${moves[i]}`);
  }
}
