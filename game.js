// Pages I might need/want access to
// - Handling multiple keypresses at once
// -- https://medium.com/@dovern42/handling-multiple-key-presses-at-once-in-vanilla-javascript-for-game-controllers-6dcacae931b7
// - Tool for getting keyboard input names
// -- https://jsfiddle.net/4j54jqt2/4
// - Fixing modulus in javascript so numbers can wrap around (how one would expect)
// -- https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers


// Remember, Ctrl + Shift + R to reload the page as well as refresh the cache

const UNDEF = undefined;

// Initializes the stage, prints some relevant  info.
const WORLD_WIDTH = 1000;
const WORLD_HEIGHT = 600;

let world = new PIXI.Application({width: WORLD_WIDTH, height: WORLD_HEIGHT, backgroundColor: 0x000033});
document.body.appendChild(world.view);

console.log(window.innerWidth);
console.log(window.innerHeight);
console.log("Test");

let debug = new PIXI.Text("Example",{fontFamily : 'Courier New', fontSize: 11, fill : 0xffffff, align : 'left'});
world.stage.addChild(debug);

let debugBank = [100]; // Load debugging messages to be shown into here
// Makes it so that the length of the array is 100 already. Not sure if necessary.
for (string in debugBank)
{
    debugBank[string] = "";
}

// Initializes the input handlers
document.addEventListener("keydown", function(){keyHandler(event, true)}, false);
document.addEventListener("keyup", function(){keyHandler(event, false)}, false);


let sfxVolume = 0.1; // Ratio, 1 = 100%, 0.5 = 50%, 0 = 0%

let kD =        {up: false, down: false, left: false, right: false, shoot: false, increaseRadius: false, decreaseRadius: false}; // Stands for Input Key Down
let kDPrev =    {up: false, down: false, left: false, right: false, shoot: false, increaseRadius: false, decreaseRadius: false}; // kD values from the previous frame
let kJP =       {up: false, down: false, left: false, right: false, shoot: false, increaseRadius: false, decreaseRadius: false}; // Stands for Key Just Pressed

const kBKey = {up: ["w", "W"], down: ["s", "S"], left: ["a", "A"], right: ["d", "D"], shoot: [" "], increaseRadius: ["o", "O"], decreaseRadius: ["l", "L"]}; // Stands for Key Board Key

function keyHandler(event, setState)
{
    // I don't get why this doesn't throw an error whenever a key is pressed that isn't in the kbKey
    // What getKeyByValue returns here is "undefined" for any keys that aren't the ones already defined.
    // I don't see any error otherwise though. Oh well. It works! 
    kD[getKeyByValue(kBKey, event.key)] = setState;
}


// Returns the key name from an object passed to it which equals value (or if it is an array, one of the indices is equal to value)
function getKeyByValue(object, value)
{
    for (key in object)
    {
        if(object[key] === value)
        {
            return key;
        }
        else if((typeof object[key]) === 'object')
        {
            for (key2 in object[key])
            {
                if(object[key][key2] === value)
                {
                    return key;
                }
            }
        }
    }

    return null; // IDK what I should make this return. This seems to work though so -\('-')/-
    // return Object.keys(object).find(key => object[key] === value); // Old code, probably more efficient but not complex enough for what I need.
}

function justPressedHandler()
{
    // Handles justPressed functionality
    for (const key in kJP)
    {
        if(kDPrev[key] == false && kD[key] == true)
        {
            kJP[key] = true;
        }
        else
        {
            kJP[key] = false;
        }  
    }
}

function previousKeyHandler()
{
    // Stores the current state of key presses, which will lag behind by one frame on the next frame
    for (const key in kDPrev)
    {
        kDPrev[key] = kD[key];
    }
}

function playSound(path)
{
    let audio = new Audio(path);
    audio.volume = sfxVolume;
    audio.play();
}


// Shorter version of console.log();
function p(val)
{
    console.log(val);
}

// Accepts an object as an input, and number of decimal places of precision. The object's key is the name, and the value is the value.
function log(info, precision = 4, returnString = false, formatString = false)
{
    for(i in info)
    {
        info[i] = info[i].toFixed(precision);
        info[i] = parseFloat(info[i]);
    }

    p(info);

    if(returnString)
    {
        let newInfo = JSON.stringify(info);
        if(formatString)
        {
            return newInfo.replace(/[{}]/g, "").replace(/[,]/g, "\t\t\t");
        }

        return newInfo;
    }

    return info; // in case you wanna do something with it
}

// Turns an object with multiple key/value pairs, used for naming variables and describing their contents, into a string fit for display
// - info: the object, looking something like {"var1":val2, "var2":val2}
// - precision: how many decimal places to have (I'm pretty sure it rounds but not 100%)
// - print: whether or not to print the info to the console as well (defaults to not because this basically replaces the console lo)
// - varW: width of each block in characters for variable names
// - dataW: width of each block in characters for the data itself corresponding to the variable
function debugString(info, precision = 4, print = false, varW = 6, dataW = 10)
{
    let newKey = "";
    let negativeBuffer = " ";
    for(i in info)
    {
        newKey = i.substring(0, varW).concat("").padStart(varW + 1);

        // Replaces the key name
        if(newKey != i)
        {
            info[newKey] = info[i];
            delete info[i];
            i = newKey;
        }

        info[i] = parseFloat(info[i].toFixed(precision)); // Rounds to however many decimal places

        negativeBuffer = " "; // When the number isn't negative add an extra space to the start
        if(info[i] < 0)
        {
            negativeBuffer = ""; // If the number is negative, don't add the extra space
        }

        // Converts the value to a string, chops off anything after dataW, and pads whats left with spaces in case it's shorter than expected
        // Adds the buffer to the start before padding 
        info[i] = (negativeBuffer + JSON.stringify(info[i]).substring(0, dataW)).padEnd(dataW);
    }

    // Cleans up the output string to remove stuff like braces/brackets/punctuation
    // Colons are default delineator, could optionally add more spacing/padding between keys and values if desired
    let newInfo = JSON.stringify(info).replace(/[{}",]/g, "").replace(/[:]/g, ":");

    if(print) p(info);

    return newInfo;
}

// Returns parameter num clamped between min and max (inclusive)
function clamp(num, min, max)
{
    if(min > max)
    {
        return Math.min(Math.max(num, max), min);
    }

    return Math.min(Math.max(num, min), max);
}



// Creates the first sprite, adds it to the stage
// let sprite = PIXI.Sprite.from("random_goomba_head.png");
let player = new PIXI.Graphics();
player.beginFill(0x00CCAA);
player.drawRect(0, 0, 10, 10);
//player.x = (WORLD_WIDTH - 10) / 2;
// player.y = (WORLD_HEIGHT - 10) / 2;
player.x = WORLD_WIDTH / 2;
player.y = WORLD_HEIGHT / 2;
player.vx = 0;
player.vy = 0;
player.ax = 0;
player.ay = 0;
player.angleV = 0; // rotational velocity
player.angleA = 0; // rotational acceleration
player.visible = false;

const PLAYER_ACCEL_DECAY = 1;
const VEL_MAX = 2; // turning/drifting velocity maximum
const ACCEL_MAX = 2;

//player.drawTo(0, -20);

world.stage.addChild(player);

player.angle = (2 * Math.PI) * 0.75; // idk if this will break later or not

const RADIUS_COLOR = 0x555555;
// Draws a line for the rotation radius
let radiusLine = new PIXI.Graphics();
radiusLine.x = 0;
radiusLine.y = 0;
// radiusLine.lineStyle(5, 0xffffff).moveTo(player.x, player.y).lineTo(0, 0);
radiusLine.lineStyle(5, RADIUS_COLOR);
radiusLine.visible = false;

world.stage.addChild(radiusLine);

const MIN_RADIUS = 20; // Minimum radius allowed - more than 0 to make it interesting!
const MAX_RADIUS = 100;
let radius = MIN_RADIUS;


let playerShots = [];


// Debug stuff
// let accelVisualizer = new PIXI.Graphics();
// accelVisualizer.x = 0;
// accelVisualizer.y = 0;
// accelVisualizer.beginFill(0xCC0000);
// accelVisualizer.drawRect(0, 0, 5, 5);
// world.stage.addChild(accelVisualizer);

let dummy = new PIXI.Graphics();
dummy.x = (WORLD_WIDTH - 20) / 2;
dummy.y = WORLD_HEIGHT / 2;
dummy.vx = 0;
dummy.vy = 0;
dummy.ax = 0;
dummy.ay = 0;
dummy.angle = (3/2) * Math.PI;
dummy.angleV = 0;
dummy.angleA = 0;
dummy.beginFill(0x00CC00);
dummy.drawRect(0, 0, 10, 10);
world.stage.addChild(dummy);

// Main game loop
let elapsed = 0.0;
world.ticker.add((delta) => mainLoop(delta));

function mainLoop(delta)
{
    elapsed += delta;

    justPressedHandler(); 

    // GOOD?
    let cx = player.x - Math.cos(player.angle) * radius;
    let cy = player.y + Math.sin(player.angle) * radius;

    if(kD.right)
    {
        // p'x = cos(theta) * (px-ox) - sin(theta) * (py-oy) + ox
        // p'y = sin(theta) * (px-ox) + cos(theta) * (py-oy) + oy
        let rA = -(Math.PI/180) * delta; // 1 deg

        if(player.angle < 0)
        {
            player.angle += (2 * Math.PI);
        }
        else if(player.angle >= (2 * Math.PI))
        {
            player.angle -= (2 * Math.PI);
        }

        player.angleA += 0.3 / (radius / MAX_RADIUS) * rA * delta; // DEBUG
        

        debugBank[0] = debugString({"cx":cx, "cy":cy});

        // let dot = new PIXI.Graphics();
        // dot.beginFill(0x00CC00);
        // dot.drawRect(0, 0, 1, 1);
        // dot.x = cx;
        // dot.y = cy;
        // world.stage.addChild(dot);

        // DEBUG 2
        // let dot2 = new PIXI.Graphics();
        // dot2.beginFill(0x00CC00);
        // dot2.drawRect(0, 0, 1, 1);
        // dot2.x = cx;
        // dot2.y = cy;
        // world.stage.addChild(dot2);

        // dummy.angleV += rA;

        // dummy.angle += dummy.angleV;
        // dummy.angleV += rA;
        dummy.angleV = rA;
        dummy.angle += dummy.angleV * delta; // Good?

        if(dummy.angle < 0)
        {
            dummy.angle += (2 * Math.PI);
        }
        else if(dummy.angle >= (2 * Math.PI))
        {
            dummy.angle -= (2 * Math.PI);
        }

        // *** delta is measured in seconds

        // dummy.vx += Math.cos(dummy.angle);
        // dummy.vy += Math.sin(dummy.angle);
        // velocity adds the derivative of the trig of the angle instead:
        
        //dummy.vx = -Math.sin(dummy.angle) * delta * dummy.angleV * 10;
        //dummy.vy = Math.cos(dummy.angle) * delta * dummy.angleV * 10;
        
        // dummy.vx -= Math.cos(dummy.angleV)// * delta;
        // dummy.vy += Math.sin(dummy.angleV)// * delta;

        // dummy.vx = dummy.vx - (1) * Math.cos(dummy.angle) * radius * delta;
        // dummy.vy = dummy.vy + (1) * Math.sin(dummy.angle) * radius * delta;

        dummy.vx += -radius * Math.cos(dummy.angle);
        dummy.vy += -radius * Math.sin(dummy.angle);


        console.log(-Math.sin(dummy.angle) * delta * dummy.angleV * 10);
        console.log(Math.cos(dummy.angle) * delta * dummy.angleV * 10);
        console.log(((-Math.sin(dummy.angle) * delta * dummy.angleV * 10) ** 2) + ((Math.cos(dummy.angle) * delta * dummy.angleV * 10) ** 2));
    }

    dummy.x += dummy.vx;
    dummy.y += dummy.vy;

    

    // dummy.angleV *= 0.9; // limits to 0 reasonably fast
    // dummy.vx *= 0.95;
    // dummy.vy *= 0.95;
    if(false) // debug
    {
        if(dummy.angleV > 0)
        {
            dummy.angleV -= (Math.PI / 180) * delta * 0.5; // 1/10th of a degree

            if(dummy.angleV < 0)
            {
                dummy.angleV = 0;
            }
        }

        if(dummy.angleV < 0)
        {
            dummy.angleV += (Math.PI / 180) * delta * 0.5;// 1/10th of a degree;

            if(dummy.angleV > 0)
            {
                dummy.angleV = 0;
            }
        }
    

        dummy.angleV = clamp(dummy.angleV, -0.5, 0.5);
    }

    // dummy.x += Math.cos(dummy.angle) * ;
    // dummy.y += Math.sin(dummy.angle);
    
    debugBank[1] = debugString({"vx":dummy.vx, "vy":dummy.vy, "angV":dummy.angleV, "ang":dummy.angle * 180 / Math.PI});

    if(kD.left)
    {
        let rA = - (3.14/180) * delta; // 1 deg

        if(player.angle < 0)
        {
            player.angle += (2 * Math.PI);
        }
        else if(player.angle >= (2 * Math.PI))
        {
            player.angle -= (2 * Math.PI);
        }

        player.angleA -= 0.3 * rA * delta; // DEBUG

        debugBank[0] = debugString({"cx":cx, "cy":cy});

        // NO. MORE. DOTS!
        // let dot = new PIXI.Graphics();
        // dot.beginFill(0x00CC00);
        // dot.drawRect(0, 0, 1, 1);
        // dot.x = cx;
        // dot.y = cy;
        // world.stage.addChild(dot);
    }

    if(!kD.right && !kD.left)
    {
        if(player.rA != 0)
        {
            //player.rA = 0;
        }
    }

    // debugBank[2] = debugString({"x": player.x, "y": player.y, "radius": radius, "angle (deg)": player.angle * 180 / 3.14}, 4);
    // debugBank[3] = debugString({"vx": player.vx, "vy": player.vy, "vtot": ((player.vx ** 2 + player.vy ** 2 )**.5), "ax": player.ax, "ay": player.ay}, 4);
    // debugBank[4] = debugString({"cx":cx, "cy":cy, "cx-px":(cx - player.x), "cy-py":(cy-player.y)}, 4);

    // if(player.angleA > 0)
    // {
    //     player.angleA = Math.max(player.angleA - 0.008 * delta, 0);
    // }

    // if(player.angleA < 0)
    // {
    //     player.angleA = Math.min(player.angleA + 0.008 * delta, 0);
    // }

    player.angleV += player.angleA * delta;
    
    // Bounds angular velocity
    if(player.angleV > 0)
    {
        player.angleV = Math.min(player.angleV, 0.2);
    }

    if(player.angleV < 0)
    {
        player.angleV = Math.max(player.angleV, -0.2);
    }   

    player.vx += Math.cos(-player.angle - player.angleV)*radius * player.angleV;
    player.vy += Math.sin(-player.angle - player.angleV)*radius * player.angleV;

    player.angle += player.angleV;
    
    log({"angleV":player.angleV, "angleA":player.angleA});

    
    
    log({"angleV":player.angleV, "angleA":player.angleA});

    // if(kD.left)
    // {
    //     let rA = (3.14/180) / (radius / MIN_RADIUS) * 10;
    //     let cx2 = cx;//player.x - Math.cos(player.angle) * radius;
    //     let cy2 = cy;//player.y - Math.sin(player.angle) * radius;

    //     player.x = Math.cos(rA) * (player.x - cx2) - Math.sin(rA) * (player.y - cy2) + cx2;
    //     player.y = Math.sin(rA) * (player.x - cx2) + Math.cos(rA) * (player.y - cy2) + cy2;
    //     player.angle = (player.angle + rA * delta) % (2 * Math.PI);

    //     p("cx2: " + String(cx2) + " cy2: " + String(cy2) + " vtot: ");

    //     let dot = new PIXI.Graphics();
    //     dot.beginFill(0x00CC00);
    //     dot.drawRect(0, 0, 1, 1);
    //     dot.x = cx2;
    //     dot.y = cy2;
    //     world.stage.addChild(dot);
    // }

    if(kD.up && false)
    {
        // player.y -= 1;
        player.x -= 1 * Math.cos(player.angle); // CHANGE TO SPEED
        player.y -= 1 * Math.sin(player.angle); // CHANGE TO SPEED
    }

    if(kD.down && false)
    {
        player.x += 1 * Math.cos(player.angle); // CHANGE TO SPEED
        player.y += 1 * Math.sin(player.angle); // CHANGE TO SPEED
        
    }

    if(kJP.shoot)
    {
        playSound("shootLaser.wav");

        let newShot = new PIXI.Graphics();
        newShot.beginFill(0xFF0000);
        newShot.drawRect(0, 0, 5, 10); // CHANGE TO WIDTH AND HEIGHT
        newShot.x = player.x + (player.width - 5) / 2; // CHANGE TO WIDTH AND HEIGHT
        newShot.y = player.y + (player.height - 10) / 2; // CHANGE TO WIDTH AND HEIGHT
        newShot.angle = -player.angle;

        world.stage.addChild(newShot);
        playerShots.push(newShot);
    }

    if(kD.increaseRadius || kD.up)
    {
        radius += 5;
        if(radius > MAX_RADIUS)
        {
            radius = MAX_RADIUS;
        }
    }

    if(kD.decreaseRadius || kD.down)
    {
        radius -= 5;
        if(radius < MIN_RADIUS)
        {
            radius = MIN_RADIUS;
        }
    }

    player.vx += player.ax * delta;
    player.vy += player.ay * delta;

    // Scales down the player's velocity to be equal to VEL_MAX if it's more than that
    // if((player.vx**2 + player.vy**2)**0.5 > VEL_MAX && VEL_MAX > 0)
    // {
    //     player.vx = ((VEL_MAX ** 2) * (player.vx ** 2) / ((player.vx ** 2) + (player.vy ** 2)))**0.5;
    //     player.vx = ((VEL_MAX ** 2) * (player.vy ** 2) / ((player.vx ** 2) + (player.vy ** 2)))**0.5;
    // }

    if(player.vx > VEL_MAX)
    {
        player.vx = VEL_MAX;
    }

    if(player.vx < -VEL_MAX)
    {
        player.vx = -VEL_MAX;
    }

    if(player.vy > VEL_MAX)
    {
        player.vy = VEL_MAX;
    }

    if(player.vy < -VEL_MAX)
    {
        player.vy = -VEL_MAX;
    }


    if(player.ax > ACCEL_MAX)
    {
        player.ax = ACCEL_MAX;
    }

    if(player.ax < -ACCEL_MAX)
    {
        player.ax = -ACCEL_MAX;
    }

    if(player.ay > ACCEL_MAX)
    {
        player.ay = ACCEL_MAX;
    }

    if(player.ay < -ACCEL_MAX)
    {
        player.ay = -ACCEL_MAX;
    }

    player.x += player.vx * delta;
    player.y += player.vy * delta;

    if(player.ax > 0)
    {
        player.ax -= PLAYER_ACCEL_DECAY;

        if(player.ax < 0)
        {
            player.ax = 0;
        }
    }

    if(player.ax < 0)
    {
        player.ax += PLAYER_ACCEL_DECAY;
        
        if(player.ax > 0)
        {
            player.ax = 0;
        }
    }

    if(player.ay > 0)
    {
        player.ax -= PLAYER_ACCEL_DECAY;

        if(player.ay < 0)
        {
            player.ay = 0;
        }
    }

    if(player.ay < 0)
    {
        player.ay += PLAYER_ACCEL_DECAY;
        
        if(player.ay > 0)
        {
            player.ay = 0;
        }
    }

    radiusLine.x = player.x;
    radiusLine.y = player.y;
    radiusLine.clear();
    radiusLine.lineStyle(5, RADIUS_COLOR);
    radiusLine.lineTo((cx - player.x), (cy - player.y));
    
    // accelVisualizer.x = player.ax * 10 + player.x;
    // accelVisualizer.y = player.ay * 10 + player.y;
    // log({"axxx":accelVisualizer.x, "ayyy":accelVisualizer.y});

    for (shot in playerShots)
    {
        playerShots[shot].y -= 10 * Math.sin(playerShots[shot].angle); // CHANGE TO SPEED
        playerShots[shot].x -= 10 * Math.cos(playerShots[shot].angle);
    }

    previousKeyHandler();

    // debug.rollingText = 0; // Used to queue up what is printed
    debug.text = "";
    for (string in debugBank)
    {
        debug.text = debug.text.concat(debugBank[string]).concat("\n");
    }
    
}