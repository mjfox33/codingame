const fs = require('fs');

// Read and parse commands.txt
let commands;
try {
  const rawData = fs.readFileSync('commands.txt', 'utf8').trim();
  if (!rawData) throw new Error('commands.txt is empty');
  commands = rawData.split('\n').map((line, index) => {
    if (!line.trim()) {
      console.warn(`Empty line at index ${index}`);
      return [];
    }
    try {
      return line.split(',').map(cmd => {
        const [angle, thrust] = cmd.trim().split(' ').map(Number);
        if (isNaN(angle) || isNaN(thrust)) throw new Error(`Invalid command format in line ${index + 1}: ${cmd}`);
        return [angle, thrust];
      });
    } catch (err) {
      throw new Error(`Parsing error in line ${index + 1}: ${err.message}`);
    }
  }).filter(arr => arr.length > 0);
  if (!commands.length) throw new Error('No valid commands found in commands.txt');
} catch (err) {
  console.error('Error reading commands.txt:', err.message);
  process.exit(1);
}

// Test 1 initial conditions
const initialState = {
  X: 6500, Y: 2800, hSpeed: -90, vSpeed: 0, fuel: 750, rotate: 90, power: 0 
};
const landingX = 4750, landingY = 150;
const landingXMin = 4000, landingXMax = 5500;

// Test 1 commands
const initialCommands = commands[2] || [];
if (!initialCommands.length) {
  console.error('No commands for test 1');
  process.exit(1);
}

const G = -3.711;
const MAX_Y = 3000;

// Simulate trajectory
function simulate(commands, initialState) {
  if (!initialState || typeof initialState !== 'object') throw new Error('Invalid initialState');
  let state = { ...initialState };
  let trajectory = [{ ...state }];
  let crashed = false;
  let landed = false;

  for (let t = 0; t < commands.length; t++) {
    let [angle, thrust] = commands[t];
    if (t > 0) {
      angle = Math.max(commands[t-1][0] - 15, Math.min(commands[t-1][0] + 15, angle));
      thrust = Math.max(commands[t-1][1] - 1, Math.min(commands[t-1][1] + 1, thrust));
    }
    angle = Math.max(-90, Math.min(90, angle));
    thrust = Math.max(0, Math.min(4, thrust));

    let a_x = thrust * Math.sin(angle * Math.PI / 180);
    let a_y = thrust * Math.cos(angle * Math.PI / 180) + G;
    state.hSpeed += a_x;
    state.vSpeed += a_y;
    state.X += state.hSpeed;
    state.Y += state.vSpeed;
    state.fuel -= thrust;
    state.rotate = angle;
    state.power = thrust;

    if (state.Y > MAX_Y || state.Y < 0) {
      crashed = true;
      break;
    }

    if (state.Y <= landingY) {
      if (landingXMin <= state.X && state.X <= landingXMax &&
          Math.abs(state.hSpeed) <= 20 && state.vSpeed >= -40) {
        landed = true;
      } else {
        crashed = true;
      }
      break;
    }

    trajectory.push({ ...state });
  }

  return { trajectory, landed, crashed, finalState: trajectory[trajectory.length - 1] };
}

// Cost function
function computeCost(trajectory, landed, crashed) {
  let finalState = trajectory[trajectory.length - 1];
  let fuelUsed = initialState.fuel - finalState.fuel;
  let xError = Math.abs(finalState.X - landingX);
  let yError = Math.abs(finalState.Y - landingY);
  let hSpeedPenalty = Math.max(0, Math.abs(finalState.hSpeed) - 20);
  let vSpeedPenalty = Math.max(0, -finalState.vSpeed - 40);
  let crashPenalty = crashed || !landed ? 10000 : 0;

  return fuelUsed + 100 * xError + 100 * yError + 1000 * hSpeedPenalty + 1000 * vSpeedPenalty + 10000 * crashPenalty;
}

// Generate neighbor
function getNeighbor(commands) {
  let newCommands = commands.map(cmd => [...cmd]);
  let numChanges = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < numChanges; i++) {
    let t = Math.floor(Math.random() * commands.length);
    let changeType = Math.random();
    if (changeType < 0.7) {
      newCommands[t][1] = Math.max(0, newCommands[t][1] - 1);
    } else if (changeType < 0.85) {
      newCommands[t][1] = Math.min(4, newCommands[t][1] + 1);
    } else {
      let delta = Math.floor(Math.random() * 11) - 5;
      newCommands[t][0] = Math.max(-90, Math.min(90, newCommands[t][0] + delta));
    }
  }
  return newCommands;
}

// Simulated Annealing
function simulatedAnnealing(initialCommands, initialState, maxIterations = 2000) {
  if (!Array.isArray(initialCommands)) throw new Error('initialCommands must be an array');
  let currentCommands = initialCommands.map(cmd => [...cmd]);
  let { trajectory, landed, crashed } = simulate(currentCommands, initialState);
  let currentCost = computeCost(trajectory, landed, crashed);
  let bestCommands = currentCommands;
  let bestCost = currentCost;

  let T = 100;
  let coolingRate = 0.99;

  for (let i = 0; i < maxIterations; i++) {
    let newCommands = getNeighbor(currentCommands);
    let { trajectory: newTraj, landed: newLanded, crashed: newCrashed } = simulate(newCommands, initialState);
    let newCost = computeCost(newTraj, newLanded, newCrashed);

    let deltaCost = newCost - currentCost;
    if (deltaCost < 0 || Math.random() < Math.exp(-deltaCost / T)) {
      currentCommands = newCommands;
      currentCost = newCost;
      if (newCost < bestCost) {
        bestCommands = newCommands;
        bestCost = newCost;
      }
    }

    T *= coolingRate;
    if (T < 0.01) break;
  }

  return { bestCommands, bestCost, fuelUsed: initialState.fuel - simulate(bestCommands, initialState).finalState.fuel };
}

// Run SA and write to t1commands.txt
try {
  let result = simulatedAnnealing(initialCommands, initialState);
  const output = result.bestCommands.map(([angle, thrust]) => `${angle} ${thrust}`).join(',');
  fs.writeFileSync('t3commands.txt', output);
  console.log('Fuel Used:', result.fuelUsed);
  console.log('Fuel Remaining:', initialState.fuel - result.fuelUsed);
  console.log('Commands written to t3commands.txt');
} catch (err) {
  console.error('Error in simulated annealing:', err.message);
}
