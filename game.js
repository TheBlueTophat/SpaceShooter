// Pages I might need/want access to
// - Handling multiple keypresses at once
// -- https://medium.com/@dovern42/handling-multiple-key-presses-at-once-in-vanilla-javascript-for-game-controllers-6dcacae931b7
// - Tool for getting keyboard input names
// -- https://jsfiddle.net/4j54jqt2/4

// Remember, Ctrl + Shift + R to reload the page as well as refresh the cache

// Initializes the stage, prints some relevant  info.
const WORLD_WIDTH = 1000;
const WORLD_HEIGHT = 600;

let world = new PIXI.Application({width: WORLD_WIDTH, height: WORLD_HEIGHT, backgroundColor: 0x000033});
document.body.appendChild(world.view);

console.log(window.innerWidth);
console.log(window.innerHeight);
console.log("Test");


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
    // console.log(event.key);

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

const PLAYER_ACCEL_DECAY = 0.1;

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

world.stage.addChild(radiusLine);

const MIN_RADIUS = 20; // Minimum radius allowed - more than 0 to make it interesting!
const MAX_RADIUS = 100;
let radius = MIN_RADIUS;


let playerShots = [];

// Main game loop
let elapsed = 0.0;
world.ticker.add((delta) => mainLoop(delta));

function mainLoop(delta)
{
    elapsed += delta;

    let cx = player.x - Math.cos(player.angle) * radius;
    let cy = player.y - Math.sin(player.angle) * radius;

    // Handles justPressed functionality (move to function?)
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


    // if(kD.right)
    // {
    //     player.x += 1;
    // }

    // if(kD.left)
    // {
    //     player.x -= 1;
    // }

    if(kD.right) // cc
    {
        // p'x = cos(theta) * (px-ox) - sin(theta) * (py-oy) + ox
        // p'y = sin(theta) * (px-ox) + cos(theta) * (py-oy) + oy
        // player.angle = (player.angle - (2 * Math.PI) * 0.1) % (2 * Math.PI);
        // player.angle = 0.01;

        // let rA = 0.01;

        // let cx = 1;//(WORLD_WIDTH / 2);
        // let cy = 1;//(WORLD_HEIGHT / 2);

        // player.x = (Math.cos(rA) * (player.x - cx)) - (Math.sin(rA) * (player.y - cy));// + player.x;
        // player.y = (Math.sin(rA) * (player.x - cx)) + (Math.cos(rA) * (player.y - cy));// + player.y;

        let rA = -(3.14/180) / (radius / MIN_RADIUS) * 10; // 1 deg
        // let cx = WORLD_WIDTH / 2;
        // let cy = WORLD_HEIGHT / 2;
        

        // player.x = Math.cos(rA) * (player.x - cx) - Math.sin(rA) * (player.y - cy) + cx;
        // player.y = Math.sin(rA) * (player.x - cx) + Math.cos(rA) * (player.y - cy) + cy;
        // player.ax += Math.cos(rA) * (player.x - cx) - Math.sin(rA) * (player.y - cy);
        // player.ay += Math.sin(rA) * (player.x - cx) + Math.cos(rA) * (player.y - cy);
        player.vx += -Math.sin(rA) * (player.x - cx) - Math.cos(rA) * (player.y - cy);
        player.vy += Math.cos(rA) * (player.x - cx) - Math.sin(rA) * (player.y - cy);

        player.angle += rA;

        p("cx: " + String(cx) + " cy: " + String(cy));

        let dot = new PIXI.Graphics();
        dot.beginFill(0x00CC00);
        dot.drawRect(0, 0, 1, 1);
        dot.x = cx;
        dot.y = cy;
        world.stage.addChild(dot);
    }
    p("x: " + String(player.x) + " y: " + String(player.y) + " radius: " + String(radius) + " player.angle: " + String(player.angle));
    p("ax: " + String(player.ax) + " ay: " + String(player.ay));

    if(kD.left)
    {
        let rA = (3.14/180) / (radius / MIN_RADIUS) * 10;
        let cx = player.x - Math.cos(player.angle) * radius;
        let cy = player.y - Math.sin(player.angle) * radius;

        player.x = Math.cos(rA) * (player.x - cx) - Math.sin(rA) * (player.y - cy) + cx;
        player.y = Math.sin(rA) * (player.x - cx) + Math.cos(rA) * (player.y - cy) + cy;
        player.angle += rA;

        p("cx: " + String(cx) + " cy: " + String(cy));

        let dot = new PIXI.Graphics();
        dot.beginFill(0x00CC00);
        dot.drawRect(0, 0, 1, 1);
        dot.x = cx;
        dot.y = cy;
        world.stage.addChild(dot);
    }

    if(kD.up)
    {
        // player.y -= 1;
        player.x -= 1 * Math.cos(player.angle); // CHANGE TO SPEED
        player.y -= 1 * Math.sin(player.angle); // CHANGE TO SPEED
    }

    if(kD.down)
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
        newShot.angle = player.angle;

        world.stage.addChild(newShot);
        playerShots.push(newShot);
    }

    if(kD.increaseRadius)
    {
        radius += 1;
        if(radius > MAX_RADIUS)
        {
            radius = MAX_RADIUS;
        }

        // player.x += 1 * Math.cos(player.angle); // CHANGE TO SPEED
        // player.y += 1 * Math.sin(player.angle); // CHANGE TO SPEED
    }

    if(kD.decreaseRadius)
    {
        radius -= 1;
        if(radius < MIN_RADIUS)
        {
            radius = MIN_RADIUS;
        }

        // player.x -= 1 * Math.cos(player.angle); // CHANGE TO SPEED
        // player.y -= 1 * Math.sin(player.angle); // CHANGE TO SPEED
    }

    // player.vx += player.ax;
    // player.yx += player.ax;

    player.x += player.vx;
    player.y += player.vy;

    // if(player.ax > 0)
    // {
    //     player.ax -= PLAYER_ACCEL_DECAY;

    //     if(player.ax < 0)
    //     {
    //         player.ax = 0;
    //     }
    // }

    // if(player.ax < 0)
    // {
    //     player.ax += PLAYER_ACCEL_DECAY;
        
    //     if(player.ax > 0)
    //     {
    //         player.ax = 0;
    //     }
    // }

    // if(player.ay > 0)
    // {
    //     player.ax -= PLAYER_ACCEL_DECAY;

    //     if(player.ay < 0)
    //     {
    //         player.ay = 0;
    //     }
    // }

    // if(player.ay < 0)
    // {
    //     player.ay += PLAYER_ACCEL_DECAY;
        
    //     if(player.ay > 0)
    //     {
    //         player.ay = 0;
    //     }
    // }

    // radiusLine.lineStyle(5, 0xffffff).moveTo(player.x, player.y).lineTo(0, -radius);
    // radiusLine.beginPath();
    // radiusLine.moveTo(player.x, player.y);
    radiusLine.x = player.x;
    radiusLine.y = player.y;
    radiusLine.clear();
    radiusLine.lineStyle(5, RADIUS_COLOR);
    radiusLine.lineTo(cx - player.x, cy - player.y);
    
    //p(radius);
    // radiusLine.stroke();


    for (shot in playerShots)
    {
        playerShots[shot].y -= 10 * Math.sin(playerShots[shot].angle); // CHANGE TO SPEED
        playerShots[shot].x -= 10 * Math.cos(playerShots[shot].angle);
    }

    // Stores the current state of key presses, which will lag behind by one frame on the next frame
    for (const key in kDPrev)
    {
        kDPrev[key] = kD[key];
    }
}