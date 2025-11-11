export function initBugSquash(containerId = "games"){
    const container = document.getElementById(containerId);
    const gameSection = container.querySelector(".games-section");
    const canvas = document.createElement("canvas");

    canvas.id = "bugCanvas";
    canvas.width = 300;
    canvas.height = 200;
    canvas.style.border = "1px solid black";
    canvas.style.display = "none";

    const start = document.createElement("button");
    start.textContent = "BugSquash";

    const restart = document.createElement("button");
    restart.style.display = 'none';
    restart.textContent = "Restart";
    
    const close = document.createElement("button");
    close.textContent = "Close";
    close.style.display = "none";
    
    
    
    start.onclick = () => {
        startBugSquash(),
        bugCanvas.style.display = 'block'
        score.style.display = 'block'
        start.style.display = 'none', 
        restart.style.display = 'block'
        canvas.style.display = "block"
        score.style.display = "block";
        close.style.display = "block";
    };
    restart.onclick = () => {
        startBugSquash(), 
        bugCanvas.style.display = 'block'
    };
    close.onclick = () => {
        bugCanvas.style.display = 'none', 
        score.style.display = 'none', 
        close.style.display = 'none', 
        restart.style.display = 'none',
        start.style.display = 'block'
    };

    const score = document.createElement("p");
    score.id = "bugScore";
    score.textContent = 'Score: 0';
    score.style.display = "none";

    gameSection.appendChild(canvas);
    gameSection.appendChild(start);
    gameSection.appendChild(score);
    gameSection.appendChild(close);
    gameSection.appendChild(restart);
}
let bugScore = 0;

export function startBugSquash() {
    const score = document.getElementById("bugScore");
    const bugCanvas = document.getElementById("bugCanvas");
    const bugCtx = bugCanvas.getContext("2d");
    let isPlaying = true;
    const SIZE = 16;
    

    const bugs = [
        { type: 'blue', position: {x: 1, y: 1}, velocity: {dx: Math.random() * 1.5 - 1, dy: Math.random() * 2 - 1}},
        { type: 'red', position: {x: 0, y: 0}, velocity: {dx: Math.random() * 1.5 - 1, dy: Math.random() * 2 - 1}}
    ]

    function squashBug(event){
        const clientRect = bugCanvas.getBoundingClientRect();
        let clickX = event.clientX - clientRect.left;
        let clickY = event.clientY - clientRect.top;

        for (const bug of bugs) {
            if (bug.position.x <= clickX && clickX <= bug.position.x + SIZE 
                && bug.position.y <= clickY && clickY <= bug.position.y + SIZE) {
                bugScore++;
                bug.position.x = Math.random() * (bugCanvas.width - SIZE) + SIZE;
                bug.position.y = Math.random() * (bugCanvas.height - SIZE - 2) + SIZE - 2;
                bug.velocity.dx = Math.random() * bugScore / 2 - 1;
                bug.velocity.dy = Math.random() * bugScore / 2- 1;
                score.textContent = "Score: " + bugScore;
                console.log("Squashed!", bug);
            }
        }
        
    }
    bugCanvas.addEventListener("click", squashBug);

    function game() {
        if (!isPlaying) return;

        bugCtx.clearRect(0, 0, bugCanvas.width, bugCanvas.height);

        for (const bug of bugs){
            
            bug.position.x += bug.velocity.dx;
            bug.position.y += bug.velocity.dy;

            if (bug.position.x < 0 || bug.position.x + SIZE > bugCanvas.width) bug.velocity.dx *= -1;
            if (bug.position.y < 0 || bug.position.y + SIZE > bugCanvas.height) bug.velocity.dy *= -1;

            bugCtx.fillStyle = bug.type === 'blue' ? '#00f' : '#f00';
            bugCtx.fillRect(bug.position.x, bug.position.y, SIZE, SIZE);
        }

        requestAnimationFrame(game);
    }

    game();
}

export {bugScore};