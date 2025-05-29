/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var surfacePoints = [];
var landingZone = [];
var landingX = -1;
var landingY = -1;
var previousY = -1;
var previousX = -1;
const surfaceN = parseInt(readline()); // the number of points used to draw the surface of Mars.
for (let i = 0; i < surfaceN; i++) {
    var inputs = readline().split(' ');
    const landX = parseInt(inputs[0]); // X coordinate of a surface point. (0 to 6999)
    const landY = parseInt(inputs[1]); // Y coordinate of a surface point. By linking all the points together in a sequential fashion, you form the surface of Mars.
    surfacePoints.push([landX, landY]);
    if (landY == previousY) {
        landingZone = [previousX, landX];
        landingX = (landX + previousX) / 2;
        landingY = landY;
    }
    previousX = landX;
    previousY = landY;
}

console.error(landingZone);
console.error(landingY);
console.error(surfacePoints);

function xError(currentX) {
    return landingX - currentX;
}

function yError(currentY) {
    return landingY - currentY;
}

function getAngle(currentX, currentHSpeed) {
    var isLeftOfTarget = (landingX - currentX) > 0;
    var isMovingLeft = currentHSpeed < 0;
    var returnAngle = 0;
    if (isLeftOfTarget) {
        if (isMovingLeft) {
            returnAngle = -45;
        } else {
            if (currentHSpeed > 60) {
                returnAngle = 60;
            } else if (currentHSpeed > 20) {
                returnAngle = currentHSpeed - 15;
            } else if (currentHSpeed < 10) {
                returnAngle = -45;
            } else {
                returnAngle = 0;
            }
        }
    } else {
        if (isMovingLeft) {
            if (currentHSpeed < -60) {
                returnAngle = -60;
            } else if (currentHSpeed < -20) {
                returnAngle = currentHSpeed + 15;
            //} else if (currentHSpeed < 0) {
                //returnAngle = -15;
            } else {
                returnAngle = 0;
            }
        } else {
            returnAngle = 45;
        }
    }
    console.error(`isLeftOfTarget:${isLeftOfTarget} isMovingLeft:${isMovingLeft} returnAngle:${returnAngle}`);
    return returnAngle;
}

function getThrust(vSpeed) {
    var offset = gameTicks % 15 == 0 ? -1 : 0;
    return vSpeed > -10 ? 2 : vSpeed > -30 ? 3 : 4 + offset;
}

var initialChange = 0;
var gameTicks = 0;

var moves = "";

// game loop
while (true) {
    gameTicks++;
    var inputs = readline().split(' ');
    const X = parseInt(inputs[0]);
    const Y = parseInt(inputs[1]);
    const hSpeed = parseInt(inputs[2]); // the horizontal speed (in m/s), can be negative.
    const vSpeed = parseInt(inputs[3]); // the vertical speed (in m/s), can be negative.
    const fuel = parseInt(inputs[4]); // the quantity of remaining fuel in liters.
    const rotate = parseInt(inputs[5]); // the rotation angle in degrees (-90 to 90).
    const power = parseInt(inputs[6]); // the thrust power (0 to 4).

    if (gameTicks == 0) {
        console.error(`landingX:${landingX} landingY:${landingY} startX:${X} startY:${Y} startHSpeed:${hSpeed} startVSpeed:${vSpeed} startFuel:${fuel} startRotate:${rotate} startPower:${power}`)
        break;
    }

    if (initialChange < 28) {
        var initialAngle = initialChange < 12 ? 0 : getAngle(X, hSpeed);
        moves += `,${initialAngle} 4`;
        console.log(initialAngle, 4);
        initialChange++;
        continue;
    }

    var angle = (Y-landingY) < 300 ? 0 : getAngle(X, hSpeed);
    var thrust = (Y-landingY) < 300 ? 4 : getThrust(vSpeed);
    moves += `,${angle} ${thrust}`;
    console.error(moves);
    console.log(`${angle} ${thrust}`);
    // rotate power. rotate is the desired rotation angle. power is the desired thrust power.
    //console.log('-20 3');
}

