// Mock readline for local testing
const inputLines = [
    "10 10",
    "##########",
    "#........#",
    "#.######.#",
    "#........#",
    "########.#",
    "#..#.###.#",
    "#.##...#.#",
    "#..###.#.#",
    "#........#",
    "##########",
    "3 3",
    "8 3",
    "1",
    "2 3 7 3 1"
];
let inputIndex = 0;
const readline = () => inputLines[inputIndex++];

// Parse grid dimensions
const inputs = readline().split(' ');
const width = parseInt(inputs[0]); // columns
const height = parseInt(inputs[1]); // rows

// Read grid
const grid = [];
for (let i = 0; i < height; i++) {
    const line = readline();
    grid.push(line.split(''));
}

// Parse start and target positions
const startInputs = readline().split(' ');
const startX = parseInt(startInputs[0]);
const startY = parseInt(startInputs[1]);
const targetInputs = readline().split(' ');
const targetX = parseInt(targetInputs[0]);
const targetY = parseInt(targetInputs[1]);

// Parse switches and blocks
const switchCount = parseInt(readline());
const switches = [];
for (let i = 0; i < switchCount; i++) {
    const switchInputs = readline().split(' ');
    const switchX = parseInt(switchInputs[0]);
    const switchY = parseInt(switchInputs[1]);
    const blockX = parseInt(switchInputs[2]);
    const blockY = parseInt(switchInputs[3]);
    const initialState = parseInt(switchInputs[4]);
    switches.push({ switchX, switchY, blockX, blockY, initialState });
}

// Function to find teleporter pairs
function findTeleporterPairs(grid, height, width) {
    const teleporters = new Map();
    const tPositions = [];
    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            if (grid[r][c] === 'T') {
                tPositions.push([r, c]);
            }
        }
    }
    if (tPositions.length >= 2) {
        const key1 = `${tPositions[0][0]},${tPositions[0][1]}`;
        const key2 = `${tPositions[1][0]},${tPositions[1][1]}`;
        teleporters.set(key1, tPositions[1]);
        teleporters.set(key2, tPositions[0]);
    }
    return teleporters;
}

// Check if a position is valid
function isValidMove(x, y, blockStates) {
    if (x < 0 || x >= width || y < 0 || y >= height) {
        console.error(`Move to (${x},${y}) invalid: out of bounds`);
        return false;
    }
    if (grid[y][x] === '#') {
        console.error(`Move to (${x},${y}) invalid: wall at grid[${y}][${x}]`);
        return false;
    }
    for (let i = 0; i < switches.length; i++) {
        if (x === switches[i].blockX && y === switches[i].blockY && blockStates[i] === 1) {
            console.error(`Move to (${x},${y}) invalid: block active (state=${blockStates[i]})`);
            return false;
        }
    }
    console.error(`Move to (${x},${y}) valid, blockStates: ${blockStates}`);
    return true;
}

// Solve for the path
function solveBender() {
    const teleporters = findTeleporterPairs(grid, height, width);
    
    // Movement directions
    const normalPriority = [
        { dir: 'L', dx: -1, dy: 0 },  // left: decrease x
        { dir: 'R', dx: 1, dy: 0 },   // right: increase x
        { dir: 'U', dx: 0, dy: -1 },  // up: decrease y
        { dir: 'D', dx: 0, dy: 1 }    // down: increase y
    ];
    const invertedPriority = [
        { dir: 'U', dx: 0, dy: -1 },  // up: decrease y
        { dir: 'L', dx: -1, dy: 0 },  // left: decrease x
        { dir: 'D', dx: 0, dy: 1 },   // down: increase y
        { dir: 'R', dx: 1, dy: 0 }    // right: increase x
    ];

    // Initial block states
    const initialBlockStates = switches.map(s => s.initialState);
    
    // BFS queue: [x, y, isInverted, blockStates, path]
    const queue = [[startX, startY, false, initialBlockStates, '']];
    const visited = new Set([`${startX},${startY},false,${initialBlockStates.join('')}`]);

    console.error(`Starting at (${startX},${startY}), Target: (${targetX},${targetY}), Initial blockStates: ${initialBlockStates}`);

    while (queue.length > 0) {
        const [x, y, isInverted, blockStates, path] = queue.shift();

        if (x === targetX && y === targetY) {
            console.error(`Target reached! Path: ${path}, Position: (${x},${y}), Inverted: ${isInverted}, BlockStates: ${blockStates}`);
            return path;
        }

        let nextInverted = isInverted;
        if (grid[y][x] === 'I') {
            nextInverted = !isInverted;
            console.error(`Inversion at (${x},${y}), New inverted state: ${nextInverted}`);
        }

        let newBlockStates = blockStates.slice();
        for (let i = 0; i < switches.length; i++) {
            if (x === switches[i].switchX && y === switches[i].switchY) {
                newBlockStates[i] = 1 - newBlockStates[i];
                console.error(`Switch toggled at (${x},${y}), Block (${switches[i].blockX},${switches[i].blockY}) now ${newBlockStates[i]}`);
            }
        }

        const posKey = `${x},${y}`;
        if (grid[y][x] === 'T' && teleporters.has(posKey)) {
            const nextPos = teleporters.get(posKey);
            const nextKey = `${nextPos[0]},${nextPos[1]},${nextInverted},${newBlockStates.join('')}`;
            if (!visited.has(nextKey)) {
                visited.add(nextKey);
                queue.push([nextPos[0], nextPos[1], nextInverted, newBlockStates, path]);
                console.error(`Teleported from (${x},${y}) to (${nextPos[0]},${nextPos[1]}), Path: ${path}`);
            }
        }

        const directions = isInverted ? invertedPriority : normalPriority;
        for (const { dir, dx, dy } of directions) {
            const newX = x + dx;
            const newY = y + dy;
            if (isValidMove(newX, newY, newBlockStates)) {
                const nextKey = `${newX},${newY},${nextInverted},${newBlockStates.join('')}`;
                if (!visited.has(nextKey)) {
                    visited.add(nextKey);
                    queue.push([newX, newY, nextInverted, newBlockStates, path + dir]);
                    console.error(`Move ${dir} to (${newX},${newY}), Inverted: ${nextInverted}, BlockStates: ${newBlockStates}, Path: ${path + dir}`);
                }
            }
        }
    }

    console.error('No path found');
    return '';
}

// Run and output result
const result = solveBender();
console.log(result);