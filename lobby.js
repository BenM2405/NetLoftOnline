import { bugScore, initBugSquash, startBugSquash } from "./games/bugSquash.js";


const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

let score = 0;
let lastbugScore = 0;
let baseMultiplier = 1;
let shopMultiplier = 0;
let minigameMultiplier = 0;

function getTotalMultiplier(){
    return baseMultiplier + shopMultiplier + minigameMultiplier;
}

function updateShopMultiplier(){
    shopMultiplier = 0;
    for (const item in shopOwn){
        if (shopOwn[item]){
            shopMultiplier += shopItems[item].multiplier;
        }
    }
}

function updateminigameMultiplier(){
    if (bugScore > lastbugScore){
        minigameMultiplier *= bugScore;
        lastbugScore = bugScore;
    }
}

canvas.addEventListener("click", () => {
    updateminigameMultiplier();
    score += getTotalMultiplier();
});

canvas.onclick = function(e){
    let x = e.pageX;
    let y = e.pageY;

    let span = document.createElement("span");
    span.classList.add("click_effect");
    span.style.top = y +"px";
    span.style.left = x + "px";
    document.body.appendChild(span);

    setTimeout(() => {
        span.remove();
    }, 600);
}


document.getElementById('openCommandsBtn').onclick = () => {
    if (document.getElementById('commands').style.display == 'block'){ 
        document.getElementById('commands').style.display = 'none';
    } else {
        document.getElementById('commands').style.display = 'block';
    }
};

document.getElementById('openGamesBtn').onclick = () => {
    if (document.getElementById('games').style.display == 'block'){ 
        document.getElementById('games').style.display = 'none';
    } else {
        document.getElementById('games').style.display = 'block';
    }
};

document.getElementById('openShopBtn').onclick = () => {
    if (document.getElementById('shop').style.display == 'block'){
        document.getElementById('shop').style.display = 'none';
    } else {
        document.getElementById('shop').style.display = 'block';
    }
}

canvas.width = 640;
canvas.height = 360;


import { outfits } from "./fits.js";
import { shopItems } from "./items.js";
const imageCache = {};
let equippedOutfits = {
    tops: null,
    bottoms: null,
    hats: null,
    hair: null
};

let shopOwn = {
    potionRed: false,
    potionBlue: false,
    potionPurple: false
};



const commands = {
    name: (arg) => {
        if (!arg) {
            messages.push({ sender: "Game", text: "Usage: /name YourName"});
            return;
        }
        playerName = arg;
        messages.push({sender: "Game", text: `Updated name to ${playerName}`});
    },
    color: (arg) => {
        if (!arg) {
            return;
        }
        playerColor = arg;
        messages.push({sender: "Game", text: `Updated color to ${playerColor}`});
    },
    petcolor: (arg) => {
        if (!arg) {
            messages.push({ sender: "Game", text: "Usage: /petcolor ColorofChoice"});
            return;
        }
        petColor = arg;
        messages.push({sender: "Game", text: `Updated pet color to ${petColor}`});
    },
    help: () => {
        messages.push({
            sender: "Game",
            text: "Available commands: \n/name [text]\n/color [color/hex]\n/petcolor [color/hex]\n/help",
        });
    },
};


function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}


//movement
let walkingLeft = true;
let isWalking = true;
let playerX = 100;
let playerY = 328;
let currentFrame = 0;
const frameCount = 4;
let frameTimer = 0;
const frameInterval = 15;

function update() {
    if (isWalking) {
        const speed = 0.75;
        if (walkingLeft) {
            playerX -= speed;
            if (playerX <= 0) walkingLeft = false;
        } else {
            playerX += speed;
            if (playerX + SPRITE_WIDTH >= canvas.width) walkingLeft = true;
        }

        frameTimer++;
        if (frameTimer >= frameInterval){
            currentFrame = (currentFrame + 1) % frameCount;
            frameTimer = 0;
        }
    }
}

const baseSprite = new Image();
const BGImage = new Image();
baseSprite.src = "assets/sprites/walk.png";
BGImage.src = "assets/bgs/exbg.png";

let SPRITE_WIDTH = 32;
let SPRITE_HEIGHT = 32;
let playerName = "You";
let playerColor = "#ff4444";
let petColor = "#e0e046";


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(BGImage, 0, 0, canvas.width, canvas.height);

    const flip = walkingLeft;

    ctx.save();

    if (flip && isWalking) {
        ctx.scale(-1, 1);
        ctx.drawImage(
            baseSprite,
            currentFrame * 32, 0,
            32, 32,
            -playerX - 32, playerY,
            32, 32
        );
    } else if (isWalking) {
        ctx.drawImage(
            baseSprite,
            currentFrame * 32, 0,
            32, 32,
            playerX, playerY,
            32, 32
        );
    } else {
        ctx.drawImage(baseSprite, playerX, playerY);
    }

    ctx.restore();
    
    const layers = ["bottoms", "tops", "hair", "hats"];
    for (const layer of layers) {
        const outfitName = equippedOutfits[layer];
        if (outfitName && outfits[layer][outfitName]) {
            const path = outfits[layer][outfitName];
            const img = loadImage(path);
            if (img.complete) {
                ctx.drawImage(img,playerX, playerY, SPRITE_HEIGHT, SPRITE_WIDTH);
            }
        }
    }
    ctx.fillStyle = petColor;
    ctx.fillRect(playerX+25, playerY-2, 6, 6)

    ctx.fillStyle = "#000";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(playerName, playerX + SPRITE_WIDTH / 2, playerY - 4);


    ctx.fillStyle = "white";
    ctx.font = "16px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Clicks: ${score}`, 280, 40);
}





//chat
const chatInput = document.getElementById("chat-input");
const chatLog = document.getElementById("chat-log");
let messages = [];

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && chatInput.value.trim() !== "") {
        const input = chatInput.value.trim();
        const [cmdRaw, ...args] = input.split(" ");
        const command = cmdRaw.slice(1);
        const arg = args.join(" ");

        if (commands[command]) {
            commands[command](arg);
        } else {
            messages.push({sender: "You", text: input});
        }

        chatInput.value = "";
        updateChatLog();
    }
});

function updateChatLog() {
    chatLog.innerHTML = "";
    messages.slice(-10).forEach((msg) => {
        const div = document.createElement("div");
        div.textContent = `${msg.sender}: ${msg.text}`;
        chatLog.appendChild(div);
    });

    chatLog.scrollTop = chatLog.scrollHeight;
}


//commands
function setupWardrobe() {
    for (const category of ["bottoms", "tops", "hair", "hats"]) {
        const section = document.getElementById(`${category}-section`);
        const label = document.createElement('div');
        label.textContent = `--${category.toUpperCase()} --`;
        section.appendChild(label);

        for (const item in outfits[category]){
            const option = document.createElement('div');
            option.textContent = item;
            option.onclick = () => {
                if (equippedOutfits[category] === item){
                    equippedOutfits[category] = null;
                    messages.push({sender: "Game", text: `Unequipped ${item} on ${category}`});
                    updateChatLog();
                } else {
                    equippedOutfits[category] = item;
                    messages.push({sender: "Game", text: `Equipped ${item} on ${category}`});
                    updateChatLog();
                }
            };
            section.appendChild(option);
        }
    }
}


function setupActions() {
    const section = document.getElementById("pose-section");
    const label = document.createElement("div");
    label.textContent = "--POSE--";
    section.appendChild(label);

    for (const pose of ["walk", "stand"]) {
        const option = document.createElement("div");
        option.textContent = pose;
        option.onclick = () => {
            baseSprite.src = `assets/sprites/${pose}.png`;
            isWalking = (pose === "walk");
            messages.push({ sender: "Game", text: `Switched to ${pose}.png` });
            updateChatLog();
        };
        section.appendChild(option);
    }
}

function setupGames() {
    const section = document.getElementById("games-section");
    const label = document.createElement('div');
    label.textContent = "--GAMES--";
    section.appendChild(label);

    const option = document.createElement("div");
    option.textContent = "Bug Squash!";
    option.onclick = () => {
        initBugSquash();
        option.style.display = 'none';
    };
    section.appendChild(option);
}

function setupShop() {
    const section = document.getElementById("shop-section");
    const label = document.createElement('div');
    label.textContent = "--SHOP--";
    section.appendChild(label);

    for (const itemName in shopItems) {
        const item = shopItems[itemName];

        const desc = document.createElement("div");
        desc.textContent = `${itemName} - Cost: ${item.cost}`;

        const buy = document.createElement("button");
        buy.textContent = 'buy';
        
        buy.onclick = () => {
            if (!shopOwn[itemName] && item.cost <= score){
                shopOwn[itemName] = true;
                score -= item.cost;
                updateShopMultiplier();
            }
            else if (sItems[cost] > score){

            }
            else {
                //already own this
            }
        };
        section.appendChild(desc);
        section.appendChild(buy);
    }
}




setupActions();
setupWardrobe();
setupGames();
setupShop();
gameLoop();

//helpers
function loadImage(path) {
    if (!imageCache[path]) {
        const img = new Image();
        img.src = path;
        imageCache[path] = img;
    }
    return imageCache[path];
}