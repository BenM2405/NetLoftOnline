const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const baseSprite = new Image();
const BGImage = new Image();
baseSprite.src = "assets/sprites/base_char.png";
BGImage.src = "assets/bgs/exbg.png";

document.getElementById('openWardrobeBtn').onclick = () => {
    document.getElementById('wardrobe').style.display = 'block';
};

canvas.width = 1024;
canvas.height = 320;

const chatInput = document.getElementById("chat-input");
const chatLog = document.getElementById("chat-log");
let messages = [];
let SPRITE_WIDTH = 64;
let playerName = "You";
let playerColor = "#ff4444";
let petColor = "#e0e046";

import { outfits } from "./fits.js";
const imageCache = {};
let equippedOutfits = {
    tops: null,
    bottoms: null,
    hats: null,
    hair: null
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

let walkingLeft = true;
let playerX = 100;
let playerY = 250;

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

//movement
function update() {
    const speed = 1;

    if (walkingLeft) {
        playerX -= speed;
        if (playerX <= 0) {
            walkingLeft = false;
        }
    } else {
        playerX += speed;
        if (playerX + SPRITE_WIDTH >= canvas.width) {
            walkingLeft = true;
        }
    }

}

function draw() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.drawImage(BGImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseSprite, playerX, playerY, 64, 64);

    const layers = ["bottoms", "tops", "hair", "hats"];
    for (const layer of layers) {
        const outfitName = equippedOutfits[layer];
        if (outfitName && outfits[layer][outfitName]) {
            const path = outfits[layer][outfitName];
            const img = loadImage(path);
            if (img.complete) {
                ctx.drawImage(img,playerX, playerY, 64, 64);
            }
        }
    }
    ctx.fillStyle = petColor;
    ctx.fillRect(playerX+50, playerY-20, 16, 16)

    ctx.fillStyle = "#000";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(playerName, playerX + SPRITE_WIDTH / 2, playerY - 4);
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


//chat
function updateChatLog() {
    chatLog.innerHTML = "";
    messages.slice(-10).forEach((msg) => {
        const div = document.createElement("div");
        div.textContent = `${msg.sender}: ${msg.text}`;
        chatLog.appendChild(div);
    });

    chatLog.scrollTop = chatLog.scrollHeight;
}


//wardrobe
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
setupWardrobe();
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