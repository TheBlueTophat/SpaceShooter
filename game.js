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

let rightPressed = false;
let leftPressed = false;

let KD =            {up: false, down: false, left: false, right: false, shoot: false}; // Stands for inputKeyDown
let KDprev =        {up: false, down: false, left: false, right: false, shoot: false}; // KD values from the previous frame
let justPressed =   {up: false, down: false, left: false, right: false, shoot: false};

// Stands for KeyboardKey
// Default uses the arrow keys to move and spacebar to shoot
const kbKey = {up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", shoot: ["w", "W"]};

function keyHandler(event, setState)
{
    console.log(event.key);

    // I don't get why this doesn't throw an error whenever a key is pressed that isn't in the kbKey
    // What getKeyByValue returns here is "undefined" for any keys that aren't the ones already defined.
    // I don't see any error otherwise though. Oh well. It works! 
    KD[getKeyByValue(kbKey, event.key)] = setState;
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


// Creates the first sprite, adds it to the stage
let sprite = PIXI.Sprite.from("random_goomba_head.png");
sprite.width = 10;
sprite.height = 10;

app.stage.addChild(sprite);


// Main game loop
let elapsed = 0.0;
app.ticker.add((delta) => {
elapsed += delta;

// ---- Start of the loop ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----


for (const key in justPressed)
{
    if(KDprev[key] == false && KD[key] == true)
    {
        if(key == "shoot") console.log("justPressed true");
        justPressed[key] = true;
    }
    else
    {
        justPressed[key] = false;
    }  
}

if(KD.right)
{
    sprite.x += 1;
}

if(KD.left)
{
    sprite.x -= 1;
}

if(KD.up)
{
    sprite.y -= 1;
}

if(KD.down)
{
    sprite.y += 1;
}

if(justPressed.shoot)
{
    playSound("shootLaser.wav");
}

for (const key in KDprev)
{
    KDprev[key] = KD[key];
}


// ---- End of the loop ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----
});