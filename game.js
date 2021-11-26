// Remember, Ctrl + Shift + R to reload the page as well as refresh the cache
let app = new PIXI.Application({width: 1000, height: 600});
document.body.appendChild(app.view);

console.log(window.innerWidth);
console.log(window.innerHeight);
console.log("Test");

// Initializes the input handlers

document.addEventListener("keydown", function(){keyHandler(event, true)}, false);
document.addEventListener("keyup", function(){keyHandler(event, false)}, false);

var rightPressed = false;
var leftPressed = false;

// Stands for inputKeyDown
let KD = {up:false, down:false, left:false, right:false};
// Stands for KeyboardKey
let kbKey = {up:38, down:40, left:37, right:39};

function keyHandler(event, setState)
{
    // I don't get why this doesn't throw an error whenever a key is pressed that isn't in the kbKey
    // What getKeyByValue returns here is "undefined" for any keys that aren't the ones already defined.
    // I don't see any error otherwise though. Oh well. It works! 
    KD[getKeyByValue(kbKey, event.keyCode)] = setState;
    // console.log(getKeyByValue(kbKey, event.keyCode));
}

function getKeyByValue(object, value)
{
    return Object.keys(object).find(key => object[key] === value);
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

// ---- Effective start of the loop

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


// ---- End of the loop
});