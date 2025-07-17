var zombies = [];
var humans = [];

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

// Compute turns for Ash to reach a point and kill (within 2000 units)
function turnsForAsh(x, y, targetX, targetY) {
    const dist = distance(x, y, targetX, targetY);
    return Math.ceil((dist - 2000) / 1000); // Turns to get within 2000 units
}

// Compute turns for a zombie to reach a point
function turnsForZombie(zombie, targetX, targetY) {
    const dist = distance(zombie.x, zombie.y, targetX, targetY);
    return Math.ceil(dist / 400); // Zombies move 400 units per turn
}

// Find the most threatened human and whether they can be saved
function getMostThreatenedHumanIndex(ashX, ashY) {
    let mostThreatenedIndex = -1;
    let minTurnsToDeath = Infinity;
    let canBeSaved = false;
    
    for (let i = 0; i < humans.length; i++) {
        const human = humans[i];
        let minTurnsToZombie = Infinity;
        let closestZombie = null;
        
        // Find the closest zombie to this human
        for (let j = 0; j < zombies.length; j++) {
            const zombie = zombies[j];
            const turns = turnsForZombie(zombie, human.x, human.y);
            if (turns < minTurnsToZombie) {
                minTurnsToZombie = turns;
                closestZombie = zombie;
            }
        }
        
        // Compute turns for Ash to save this human
        const turnsAsh = turnsForAsh(ashX, ashY, human.x, human.y);
        
        // A human is savable if Ash can get within range before the zombie
        const savable = turnsAsh < minTurnsToZombie;
        
        // Prioritize the human who will die soonest (smallest minTurnsToZombie)
        if (minTurnsToZombie < minTurnsToDeath) {
            minTurnsToDeath = minTurnsToZombie;
            mostThreatenedIndex = i;
            canBeSaved = savable;
        }
    }
    
    return { index: mostThreatenedIndex, savable: canBeSaved };
}

// Find the zombie most threatening to humans
function getMostThreateningZombieIndex() {
    let mostThreateningIndex = 0;
    let minTurnsToHuman = Infinity;
    
    for (let i = 0; i < zombies.length; i++) {
        const zombie = zombies[i];
        for (let j = 0; j < humans.length; j++) {
            const hu[48;47;165;1692;2970tman = humans[j];
            const turns = turnsForZombie(zombie, human.x, human.y);
            if (turns < minTurnsToHuman) {
                minTurnsToHuman = turns;
                mostThreateningIndex = i;
            }
        }
    }
    return mostThreateningIndex;
}

while (true) {
    var inputs = readline().split(' ');
    const currentX = parseInt(inputs[0]);
    const currentY = parseInt(inputs[1]);
    
    humans = [];
    const currentHumanCount = parseInt(readline());
    for (let i = 0; i < currentHumanCount; i++) {
        var inputs = readline().split(' ');
        const humanId = parseInt(inputs[0]);
        const humanX = parseInt(inputs[1]);
        const humanY = parseInt(inputs[2]);
        humans.push({ id: humanId, x: humanX, y: humanY });
    }
    
    zombies = [];
    const currentZombieCount = parseInt(readline());
    for (let i = 0; i < currentZombieCount; i++) {
        var inputs = readline().split(' ');
        const zombieId = parseInt(inputs[0]);
        const zombieX = parseInt(inputs[1]);
        const zombieY = parseInt(inputs[2]);
        const zombieXNext = parseInt(inputs[3]);
        const zombieYNext = parseInt(inputs[4]);
        zombies.push({ id: zombieId, x: zombieX, y: zombieY, nextX: zombieXNext, nextY: zombieYNext });
    }

    // Find the most threatened human
    const { index: humanIndex, savable } = getMostThreatenedHumanIndex(currentX, currentY);
    
    let targetX, targetY;
    if (humanIndex >= 0 && savable) {
        // If a human can be saved, move toward them
        targetX = humans[humanIndex].x;
        targetY = humans[humanIndex].y;
    } else {
        // Otherwise, target the most threatening zombie's NEXT position to intercept
        const zombieIndex = getMostThreateningZombieIndex();
        targetX = zombies[zombieIndex].nextX;
        targetY = zombies[zombieIndex].nextY;
    }
    
    console.log(`${targetX} ${targetY}`); // Your destination coordinates
}
