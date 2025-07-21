// Victory Conditions
// In this league, there are four groups of barricaded agents, 
// one of which includes one of your own agents. 
// You must eliminate all three groups of only enemy agents 
// with your limited splash bomb supply. Shooting is disabled.
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

// get four zones
let x0 = 0;
let x3 = gameMap.width - 1;
let y0 = 0;
let y3 = gameMap.height - 1;

let x1 = 0;
let x2 = 0;
let y1 = 0;
let y2 = 0;

let wall = 1;
for (let col = 0; col < gameMap.width; col++) {
  if (gameMap.board[0][col] == 0) {
    if (wall == 1) {
      wall = 0;
      if (x1 == 0) {
        x1 = col - 1;
      }
    }
  } else {
    if (wall == 0) {
      wall = 1;
      if (x2 == 0) {
        x2 = col;
      }
    }
  }
}

wall = 1;
for (let row = 0; row < gameMap.height; row++) {
  if (gameMap.board[row][0] == 0) {
    if (wall == 1) {
      wall = 0;
      if (y1 == 0) {
        y1 = row - 1;
      }
    }
  } else {
    if (wall == 0) {
      wall = 1;
      if (y2 == 0) {
        y2 = row;
      }
    }
  }
}

const groups = [
  [ x0, x1, y0, y1 ],
  [ x2, x3, y0, y1 ],
  [ x0, x1, y2, y3 ],
  [ x2, x3, y2, y3 ]
]

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

  let ignoreGroup = -1;
  let ignoreAgent = -1;
  let workingAgent = -1;
  let bombsLeft = -1;
  for (const agent of agents) {
    if (myAgentIds.has(agent.agentId)) {
      for (let i = 0; i < groups.length; i++) {
        if (agent.x > groups[i][0] && agent.x < groups[i][1] && agent.y > groups[i][2] && agent.y < groups[i][3]) {
          ignoreGroup = i;
          ignoreAgent = agent.agentId;
        }
      }
      if (ignoreAgent == -1) {
        workingAgent = agent.agentId;
        bombsLeft = agent.splashBombs;
      }
    }  
  }
  
  let targetGroup = 3 - bombsLeft;
  if (targetGroup >= ignoreGroup) {
    targetGroup++;
  }
  
  const targetX = Math.floor(Math.round((groups[targetGroup][0] + groups[targetGroup][1]) / 2, 0));
  const targetY = Math.floor(Math.round((groups[targetGroup][2] + groups[targetGroup][3]) / 2, 0));
  const myAgentCount = parseInt(readline()); // Number of alive agents controlled by you
  for (let i = 0; i < myAgentCount; i++) {
    console.log(`${workingAgent};MOVE ${targetX} ${targetY}; THROW ${targetX} ${targetY}`)
  }
}
