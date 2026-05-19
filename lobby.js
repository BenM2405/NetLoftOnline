import { bugScore, initBugSquash, startBugSquash } from "./games/bugSquash.js";
import { outfits } from "./fits.js";
import { shopItems } from "./items.js";

const canvas = document.getElementById("gameCanvas");
const alertEl = document.querySelector("#alert h2");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

let score = 0;
let lastbugScore = 0;
let baseMultiplier = 1;
let shopMultiplier = 0;
let minigameMultiplier = 0;

class Character {
    constructor(isLocal, data) {
        this.isLocal = isLocal;
        this.name = data.name || "Bean";
        this.color = data.color || "#ff4444";
        this.petColor = data.petColor || "#e0e046";
        this.outfits = data.outfits || { tops: null, bottoms: null, hats: null, hair: null};

        this.x = isLocal ? 100 : Math.random() * (canvas.width - SPRITE_WIDTH);
        this.y = 328;
        this.walkingLeft = Math.random() > 0.5;
        this.isWalking = true;

        this.pauseTimer = 0;
        this.lastClickedTime = 0;
    }

    update() {
        if (this.pauseTimer > 0){
            this.pauseTimer--;
            return;
        }

        if (this.isWalking) {
            const speed = 0.75;
            if (this.walkingLeft){
                this.x -= speed;
                if (this.x <= 0) this.walkingLeft = false;
            } else {
                this.x += speed;
                if (this.x + SPRITE_WIDTH >= canvas.width) this.walkingLeft = true;
            }
        }
    }

    draw(ctx, currentFrame){
        const flip = this.walkingLeft;
        ctx.save();

        const isCurrentlyWalking = this.isWalking && this.pauseTimer === 0;
        const activeSprite = isCurrentlyWalking ? walkSprite : standSprite;

        if (flip) {
            ctx.scale(-1, 1);
            if (isCurrentlyWalking) {
                ctx.drawImage(activeSprite, currentFrame * 32, 0, 32, 32, -this.x-32, this.y, 32, 32);
            } else {
                ctx.drawImage(activeSprite, -this.x-32, this.y);
            }
        } else {
            if (isCurrentlyWalking) {
                ctx.drawImage(activeSprite, currentFrame * 32, 0, 32, 32, this.x, this.y, 32, 32);
            } else {
                ctx.drawImage(activeSprite, this.x, this.y);
            }
        }

        ctx.restore();

        const layers = ["bottoms", "tops", "hair", "hats"];
        for (const layer of layers) {
            const outfitName = this.outfits[layer];
            if (outfitName && outfits[layer][outfitName]) {
                const img = loadImage(outfits[layer][outfitName]);
                if (img.complete) {
                    ctx.drawImage(img, this.x, this.y, SPRITE_HEIGHT, SPRITE_WIDTH);
                }
            }
        }
        ctx.fillStyle = this.petColor;
        ctx.fillRect(this.x + 25, this.y-2, 6, 6);

        ctx.fillStyle = "#000";
        ctx.font = "12px monospace";
        ctx.textAlign = "center";
        ctx.fillText(this.name, this.x + SPRITE_WIDTH / 2, this.y -4);
    }
}

function spawnPhantomVisitors() {
    const mockVisitors = [
        { name: "Rolando", color: "#5de8c1", petColor: "#b35de8", outfits: { tops: null, bottoms: null, hats: null, hair: null } },
        { name: "Justin", color: "#f5a742", petColor: "#42f5e3", outfits: { tops: null, bottoms: null, hats: null, hair: null } }
    ];

    mockVisitors.forEach(visitorData => {
        const phantom = new Character(false, visitorData);
        characters.push(phantom);
    });
}

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

function updateMinigameMultiplier(){
    if (bugScore > lastbugScore){
        minigameMultiplier += bugScore;
        lastbugScore = bugScore;
    }
}

canvas.addEventListener("click", () => {
    updateMinigameMultiplier();
    score += getTotalMultiplier();
});

canvas.onclick = function(e){
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    
    let clickedCharacter = null;
    for (let i = characters.length -1; i >= 0; i--) {
        const char = characters[i];

        if (
            clickX >= char.x &&
            clickX <= char.x + SPRITE_WIDTH &&
            clickY >= char.y &&
            clickY <= char.y + SPRITE_HEIGHT
        ) {
            clickedCharacter = char;
            break;
        }
    }

    if (clickedCharacter) {
        if (clickedCharacter.isLocal) {
            displayAlert("That's you!")
        } else {
            const currentTime = Date.now();
            const cooldownMS = 60000;
            if (currentTime - clickedCharacter.lastClickedTime < cooldownMS) {
                displayAlert(`${clickedCharacter.name} is busy walking.`)
            } else {
                clickedCharacter.lastClickedTime = currentTime;
                clickedCharacter.pauseTimer = 120;

                displayAlert(`You greeted ${clickedCharacter.name}!`);
                score += 50;
                messages.push({ sender: "Game", text: `${clickedCharacter.name} gave you 50 bonus clicks!`});
                updateChatLog();
            }
            
        }
    } else {
        let x = e.pageX;
        let y = e.pageY;
        let span = document.createElement("span");
        span.classList.add("click_effect");
        span.style.top = y + "px";
        span.style.left = x + "px";
        document.body.appendChild(span);

        setTimeout(() => {
            span.remove();
        }, 600);
    }
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
        localPlayer.name = arg;
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
        localPlayer.petColor = arg;
        messages.push({sender: "Game", text: `Updated pet color to ${petColor}`});
    },
    help: () => {
        messages.push({
            sender: "Game",
            text: "Available commands: \n/name [text]\n/petcolor [color/hex]\n/help",
        });
    },
};


function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}


//movement
let currentFrame = 0;
const frameCount = 4;
let frameTimer = 0;
const frameInterval = 15;

function update() {
    frameTimer++;
    if (frameTimer >= frameInterval){
        currentFrame = (currentFrame + 1) % frameCount;
        frameTimer = 0;
    }
    characters.forEach(char => char.update());
}

const walkSprite = new Image();
walkSprite.src = "assets/sprites/walk.png";
const standSprite = new Image();
standSprite.src = "assets/sprites/stand.png";

const BGImage = new Image();
BGImage.src = "assets/bgs/exbg.png";

let SPRITE_WIDTH = 32;
let SPRITE_HEIGHT = 32;
let playerName = "You";
let playerColor = "#ff4444";
let petColor = "#e0e046";

let characters = [];

const localPlayer = new Character(true, {
    name: playerName,
    color: playerColor,
    petColor: petColor,
    outfits: equippedOutfits
});

characters.push(localPlayer);
spawnPhantomVisitors();


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(BGImage, 0, 0, canvas.width, canvas.height);

    characters.forEach(char => char.draw(ctx, currentFrame));

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
                    localPlayer.outfits[category] = null;
                    messages.push({sender: "Game", text: `Unequipped ${item} on ${category}`});
                    updateChatLog();
                } else {
                    equippedOutfits[category] = item;
                    localPlayer.outfits[category] = item;
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
            localPlayer.isWalking = (pose === "walk");
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
    initBugSquash();
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
                displayAlert(`You bought ${itemName}`)
            }
            else if (item.cost > score){
                displayAlert(`You can't afford ${itemName}`)
            }
            else {
                displayAlert(`You already own ${itemName}`)
            }
        };
        section.appendChild(desc);
        section.appendChild(buy);
    }
}

//error
function displayAlert(message){
    alertEl.textContent = message;
    alertEl.style.opacity = "1";
    setTimeout(() => {
        alertEl.style.opacity = "0";
    }, 2000);
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