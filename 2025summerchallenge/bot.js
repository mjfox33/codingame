const myId = parseInt(readline()); // Your player id (0 or 1)
const agentCount = parseInt(readline()); // Total number of agents in the game
const agents = [];

for (let i = 0; i < agentCount; i++) {
  const currAgent = {};  
  const agentInputs = readline().split(' ');
  currAgent.agentId = parseInt(agentInputs[0]); // Unique identifier for this agent
  currAgent.player = parseInt(agentInputs[1]); // Player id of this agent
  currAgent.shootCooldown = parseInt(agentInputs[2]); // Number of turns between each of this agent's shots
  currAgent.optimalRange = parseInt(agentInputs[3]); // Maximum manhattan distance for greatest damage output
  currAgent.soakingPower = parseInt(agentInputs[4]); // Damage output within optimal conditions
  currAgent.splashBombs = parseInt(agentInputs[5]); // Number of splash bombs this can throw this game
  agents.push(currAgent);
}

const gameMap = {};
const mapInputs = readline().split(' ');
gameMap.width = parseInt(mapInputs[0]); // Width of the game map
gameMap.height = parseInt(mapInputs[1]); // Height of the game map
gameMap.board = [];
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
  const wetestAgent = { id: 0, wetness: -1 };
  const agentCount = parseInt(readline());
  const agents = [];
  for (let i = 0; i < agentCount; i++) {
    const agent = {};
    const inputs = readline().split(' ');
    agent.agentId = parseInt(inputs[0]);
    agent.x = parseInt(inputs[1]);
    agent.y = parseInt(inputs[2]);
    agent.cooldown = parseInt(inputs[3]); // Number of turns before this agent can shoot
    agent.splashBombs = parseInt(inputs[4]);
    agent.wetness = parseInt(inputs[5]); // Damage (0-100) this agent has taken
    agents.push(agent);
    if (agent.wetness > wetestAgent.wetness) {
      wetestAgent.id = agent.agentId;
      wetestAgent.wetness = agent.wetness;
    }
  }
    
  const myAgentCount = parseInt(readline()); // Number of alive agents controlled by you
  for (let i = 0; i < myAgentCount; i++) {

        // Write an action using console.log()
        // To debug: console.error('Debug messages...');


    // One line per agent: <agentId>;<action1;action2;...> actions are "MOVE x y | SHOOT id | THROW x y | HUNKER_DOWN | MESSAGE text"
    console.log(`SHOOT ${wetestAgent.id}`);
  }
}
