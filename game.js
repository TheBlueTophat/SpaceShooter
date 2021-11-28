// Pages I might need/want access to
// - Handling multiple keypresses at once
// -- https://medium.com/@dovern42/handling-multiple-key-presses-at-once-in-vanilla-javascript-for-game-controllers-6dcacae931b7
// - Tool for getting keyboard input names
// -- https://jsfiddle.net/4j54jqt2/4

// Remember, Ctrl + Shift + R to reload the page as well as refresh the cache

// Initializes the stage, prints some relevant  info.
let app = new PIXI.Application({width: 1000, height: 600});
document.body.appendChild(app.view);

console.log(window.innerWidth);
console.log(window.innerHeight);
console.log("Test");


// Initializes the input handlers
document.addEventListener("keydown", function(){keyHandler(event, true)}, false);
document.addEventListener("keyup", function(){keyHandler(event, false)}, false);


let sfxVolume = 1; // Ratio, 1 = 100%, 0.5 = 50%, 0 = 0%

let kD =        {up: false, down: false, left: false, right: false, shoot: false}; // Stands for Input Key Down
let kDPrev =    {up: false, down: false, left: false, right: false, shoot: false}; // kD values from the previous frame
let kJP =       {up: false, down: false, left: false, right: false, shoot: false}; // Stands for Key Just Pressed

const kBKey = {up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", shoot: ["w", "W"]}; // Stands for Key Board Key

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
let sprite = new PIXI.Graphics();
sprite.beginFill(0x00CCAA);
sprite.drawRect(0, 0, 10, 10)
// sprite.width = 10;
// sprite.height = 10;
app.stage.addChild(sprite);

let playerShots = [];

// Main game loop
let elapsed = 0.0;
app.ticker.add((delta) => mainLoop(delta));

function mainLoop(delta)
{
    elapsed += delta;

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


    if(kD.right)
    {
        sprite.x += 1;
    }

    if(kD.left)
    {
        sprite.x -= 1;
    }

    if(kD.up)
    {
        sprite.y -= 1;
    }

    if(kD.down)
    {
        sprite.y += 1;
    }

    if(kJP.shoot)
    {
        playSound("shootLaser.wav");

        let newShot = new PIXI.Graphics();
        newShot.beginFill(0xFF0000);
        newShot.drawRect((sprite.x + (sprite.width - 5) / 2), sprite.y + (sprite.height - 10) / 2, 5, 10);
        app.stage.addChild(newShot);
        playerShots.push(newShot);
    }


    for (shot in playerShots)
    {
        playerShots[shot].y -= 10; // CHANGE TO SPEED
    }

    // Stores the current state of key presses, which will lag behind by one frame on the next frame
    for (const key in kDPrev)
    {
        kDPrev[key] = kD[key];
    }
}