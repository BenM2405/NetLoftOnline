const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const baseSprite = new Image();
baseSprite.src = "assets/sprites/base_char.png";

const chatInput = document.getElementById("chat-input");
const chatLog = document.getElementById("chat-log");
let messages = [];

let playerName = "You";
let playerColor = "#ff4444";
let petColor = "#e0e046";

import { outfits } from "./fits.js";
const imageCache = {};
let equippedOutfits = {
    tops: "gi",
    bottoms: "gi_bottom",
    hats: "halo",
    hair: "spikes"
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
            return;
        }
        petColor = arg;
        messages.push({sender: "Game", text: `Updated pet color to ${petColor}`})
    },
    help: () => {
        messages.push({
            sender: "Game",
            text: "Available commands: \n/name [text]\n/color [color/hex]\n/petcolor [color/hex]\n/help",
        });
    },
};

const TILE_SIZE = 32;
const MAP_WIDTH = 10;
const MAP_HEIGHT = 10;

const tileTypes = {
    0: { walkable: true, color: "#88cc88"},
    1: { walkable: true, color: "#aaaaaa"},
    2: { walkable: false, color: "#f7a24d"},
}
// grass = 0, path = 1, lava = 2
const map = [
    [0,0,0,0,1,1,0,0,0,0],
    [0,2,0,0,1,1,0,0,2,2],
    [0,2,0,0,1,1,0,0,2,2],
    [0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0],
];

let playerX = 5;
let playerY = 1;

let keysPressed = {};

window.addEventListener("keydown", (e) => {
    keysPressed[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keysPressed[e.key] = false;
});

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

//movement
function update() {
    if (document.activeElement !== chatInput){
        if (keysPressed["w"] && canMoveTo(playerX, playerY-1)) playerY--;
        if (keysPressed["s"] && canMoveTo(playerX, playerY+1)) playerY++;
        if (keysPressed["a"] && canMoveTo(playerX-1, playerY)) playerX--;
        if (keysPressed["d"] && canMoveTo(playerX+1, playerY)) playerX++;
    }

    keysPressed = {};

    let currPos = [playerX, playerY];

}

function draw() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    for (let y = 0; y < MAP_HEIGHT; y++){
        for (let x = 0; x < MAP_WIDTH; x++){
            let tileID = map[y][x];
            let tileData = tileTypes[tileID];
            ctx.fillStyle = tileData.color;
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    const px = playerX * TILE_SIZE;
    const py = playerY * TILE_SIZE;
    ctx.drawImage(baseSprite, px, py);

    const layers = ["bottoms", "tops", "hair", "hats"];
    for (const layer of layers) {
        const outfitName = equippedOutfits[layer];
        if (outfitName && outfits[layer][outfitName]) {
            const path = outfits[layer][outfitName];
            const img = loadImage(path);
            if (img.complete) {
                ctx.drawImage(img, px, py);
            }
        }
    }
    ctx.fillStyle = petColor;
    ctx.fillRect(TILE_SIZE / 2 + (playerX-1) * TILE_SIZE, (playerY) * TILE_SIZE, TILE_SIZE / 2, TILE_SIZE / 2)

    ctx.fillStyle = "#000";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(playerName, playerX * TILE_SIZE + TILE_SIZE / 2, playerY * TILE_SIZE - 4); 
}

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

gameLoop();

//helpers
function canMoveTo(x, y){
    if (map[y] === undefined || map[y][x] === undefined ){
        return false;
    }
    const tileID = map[y][x];   
    return tileTypes[tileID].walkable;
}

function loadImage(path) {
    if (!imageCache[path]) {
        const img = new Image();
        img.src = path;
        imageCache[path] = img;
    }
    return imageCache[path];
}