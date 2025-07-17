const fs = require('fs');

// Test parameters
const tests = [
  {
    initialState: { X: 2500, Y: 2700, hSpeed: 0, vSpeed: 0, fuel: 550, rotate: 0, power: 0 },
    landingX: 4750, landingY: 150, landingXMin: 4000, landingXMax: 5500,
    commandIndex: 0,
    surface: [[0, 100], [1000, 500], [1500, 1500], [3000, 1000], [4000, 150], [5500, 150], [6999, 800]]
  },
  {
    initialState: { X: 6500, Y: 2800, hSpeed: -100, vSpeed: 0, fuel: 600, rotate: 90, power: 0 },
    landingX: 2250, landingY: 100, landingXMin: 2000, landingXMax: 2500,
    commandIndex: 1,
    surface: [[0, 100], [1000, 500], [1500, 100], [3000, 100], [3500, 500], [3700, 200], [5000, 1500], [5800, 300], [6000, 1000], [6999, 2000]]
  },
  {
    initialState: { X: 6500, Y: 2800, hSpeed: -90, vSpeed: 0, fuel: 750, rotate: 90, power: 0 },
    landingX: 4750, landingY: 150, landingXMin: 4000, landingXMax: 5500,
    commandIndex: 2,
    surface: [[0, 100], [1000, 500], [1500, 1500], [3000, 1000], [4000, 150], [5500, 150], [6999, 800]]
  },
  {
    initialState: { X: 500, Y: 2700, hSpeed: 100, vSpeed: 0, fuel: 800, rotate: -90, power: 0 },
    landingX: 4500, landingY: 200, landingXMin: 4000, landingXMax: 5000,
    commandIndex: 3,
    surface: [[0, 1000], [300, 1500], [350, 1400], [500, 2000], [800, 1800], [1000, 2500], [1200, 2100], [1500, 2400], [2000, 1000], [2200, 500], [2500, 100], [2900, 800], [3000, 500], [3200, 1000], [3500, 2000], [3800, 800], [4000, 200], [5000, 200], [5500, 1500], [6999, 2800]]
  },
  {
    initialState: { X: 6500, Y: 2700, hSpeed: -50, vSpeed: 0, fuel: 1000, rotate: 90, power: 0 },
    landingX: 1000, landingY: 2100, landingXMin: 500, landingXMax: 1500,
    commandIndex: 4,
    surface: [[0, 1000], [300, 1500], [350, 1400], [500, 2100], [1500, 2100], [2000, 200], [2500, 500], [2900, 300], [3000, 200], [3200, 1000], [3500, 500], [3800, 800], [4000, 200], [4200, 800], [4800, 600], [5000, 1200], [5500, 900], [6000, 500], [6500, 300], [6999, 500]]
  }
];

// Read commands.txt
let commands;
try {
  const rawData = fs.readFileSync('commands.txt', 'utf8').trim();
  if (!rawData) throw new Error('commands.txt is empty');
  commands = rawData.split('\n').map((line, index) => {
    if (!line.trim()) throw new Error(`Empty line at index ${index}`);
    return line.split(',').map(cmd => {
      const [angle, thrust] = cmd.trim().split(' ').map(Number);
      if (isNaN(angle) || isNaN(thrust)) throw new Error(`Invalid command at line ${index + 1}`);
      return [angle, thrust];
    });
  });
  if (commands.length < 5) throw new Error('commands.txt must have 5 lines');
} catch (err) {
  console.error('Error reading commands.txt:', err.message);
  process.exit(1);
}

const G = -3.711;
const MAX_Y = 3000;

// Segment intersection check
function segmentsIntersect(p1, p2, q1, q2) {
  const ccw = (a, b, c) => (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0]);
  return (ccw(p1, q1, q2) !== ccw(p2, q1, q2)) && (ccw(p1, p2, q1) !== ccw(p1, p2, q2));
}

// Simulate trajectory
function simulate(commands, initialState, landingX, landingY, landingXMin, landingXMax, surface) {
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
    let prevX = state.X, prevY = state.Y;
    state.X += state.hSpeed;
    state.Y += state.vSpeed;
    state.fuel -= thrust;
    state.rotate = angle;
    state.power = thrust;

    if (state.Y > MAX_Y || state.Y < 0) {
      crashed = true;
      break;
    }

    for (let i = 0; i < surface.length - 1; i++) {
      const [x1, y1] = surface[i];
      const [x2, y2] = surface[i + 1];
      if (segmentsIntersect([prevX, prevY], [state.X, state.Y], [x1, y1], [x2, y2])) {
        if (x1 === landingXMin && x2 === landingXMax && y1 === landingY && y2 === landingY &&
            landingXMin <= state.X && state.X <= landingXMax &&
            Math.abs(state.hSpeed) <= 20 && state.vSpeed >= -40) {
          landed = true;
        } else {
          crashed = true;
        }
        return { trajectory, landed, crashed, finalState: state };
      }
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
function computeCost(trajectory, landed, crashed, landingX, landingY, initialState) {
  let finalState = trajectory[trajectory.length - 1];
  let fuelUsed = initialState.fuel - finalState.fuel;
  let xError = Math.abs(finalState.X - landingX);
  let yError = Math.abs(finalState.Y - landingY);
  let hSpeedPenalty = Math.max(0, Math.abs(finalState.hSpeed) - 20) * 100000;
  let vSpeedPenalty = Math.max(0, -finalState.vSpeed - 40) * 100000;
  let crashPenalty = crashed || !landed ? 10000000 : 0;
  let fuelPenalty = fuelUsed > initialState.fuel * 0.3 ? fuelUsed * 300 : 0;

  return 20 * fuelUsed + 1000 * xError + 1000 * yError + hSpeedPenalty + vSpeedPenalty + crashPenalty + fuelPenalty;
}

// Generate neighbor
function getNeighbor(commands, initialState, landingX) {
  let newCommands = commands.map(cmd => [...cmd]);
  let t = Math.floor(Math.random() * Math.min(commands.length, 10)); // First 10 commands
  let changeType = Math.random();
  let hSpeed = initialState.hSpeed;
  let xDiff = landingX - initialState.X;
  let angleBias = hSpeed > 0 ? -1 : 1;
  if (xDiff * hSpeed > 0) angleBias *= -1;

  if (changeType < 0.98) {
    newCommands[t][1] = Math.max(0, newCommands[t][1] - 1); // 98% thrust reduction
  } else {
    newCommands[t][0] = Math.max(-90, Math.min(90, newCommands[t][0] + angleBias)); // ±1°
  }
  return newCommands;
}

// Simulated Annealing
function simulatedAnnealing(initialCommands, initialState, landingX, landingY, landingXMin, landingXMax, surface, maxIterations = 1000) {
  let currentCommands = initialCommands.map(cmd => [...cmd]);
  let { trajectory, landed, crashed } = simulate(currentCommands, initialState, landingX, landingY, landingXMin, landingXMax, surface);
  let currentCost = computeCost(trajectory, landed, crashed, landingX, landingY, initialState);
  let bestCommands = landed && !crashed ? currentCommands : null;
  let bestCost = landed && !crashed ? currentCost : Infinity;

  let T = 100;
  let coolingRate = 0.99;

  for (let i = 0; i < maxIterations; i++) {
    let newCommands = getNeighbor(currentCommands, initialState, landingX);
    let { trajectory: newTraj, landed: newLanded, crashed: newCrashed } = simulate(newCommands, initialState, landingX, landingY, landingXMin, landingXMax, surface);
    let newCost = computeCost(newTraj, newLanded, newCrashed, landingX, landingY, initialState);

    if (newLanded && !newCrashed) {
      let deltaCost = newCost - currentCost;
      if (deltaCost < 0 || Math.random() < Math.exp(-deltaCost / T)) {
        currentCommands = newCommands;
        currentCost = newCost;
        if (newCost < bestCost) {
          bestCommands = newCommands;
          bestCost = newCost;
        }
      }
    }

    T *= coolingRate;
    if (T < 0.1) break;
  }

  if (!bestCommands) {
    return { bestCommands: currentCommands, bestCost: currentCost, fuelUsed: initialState.fuel - simulate(currentCommands, initialState, landingX, landingY, landingXMin, landingXMax, surface).finalState.fuel };
  }

  return { bestCommands, bestCost, fuelUsed: initialState.fuel - simulate(bestCommands, initialState, landingX, landingY, landingXMin, landingXMax, surface).finalState.fuel };
}

// Run for all tests
const optimizedCommands = [];
try {
  let totalFuelRemaining = 0;
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const initialCommands = commands[test.commandIndex] || [];
    if (!initialCommands.length) {
      console.error(`No commands for test ${i + 1}`);
      continue;
    }
    const result = simulatedAnnealing(
      initialCommands,
      test.initialState,
      test.landingX,
      test.landingY,
      test.landingXMin,
      test.landingXMax,
      test.surface
    );
    const commandString = result.bestCommands.map(([angle, thrust]) => [angle, thrust]);
    optimizedCommands.push(commandString);
    const fuelRemaining = test.initialState.fuel - result.fuelUsed;
    totalFuelRemaining += fuelRemaining;
    console.log(`Test ${i + 1}: Fuel Used: ${result.fuelUsed}, Fuel Remaining: ${fuelRemaining}`);
  }
  console.log(`Total Fuel Remaining: ${totalFuelRemaining}`);

  // Write to optcommands.txt
  const output = `const commands = [\n${optimizedCommands.map(cmds => `  [${cmds.map(cmd => `[${cmd.join(', ')}]`).join(', ')}]`).join(',\n')}\n];`;
  fs.writeFileSync('optcommands.txt', output);
  console.log('Optimized commands written to optcommands.txt');
} catch (err) {
  console.error('Error:', err.message);
}
