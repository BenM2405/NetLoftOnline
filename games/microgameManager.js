export function initMicrogameManager(onWinCallBack) {
    let active = false;
    function showPopup(microgame) {
        if (active) return;
        active = true;

        const overlay = document.createElement("div");
        overlay.id = "microgame-overlay";

        const titleBar = document.createElement("div");
        titleBar.id = "microgame-titlebar";

        const title = document.createElement("span");
        title.textContent = microgame.title;

        const fakeClose = document.createElement("button");
        fakeClose.textContent = "X";
        fakeClose.id = "microgame-close";
        fakeClose.onclick = () => {
            endPopup(overlay, false);
        };

        titleBar.appendChild(title);
        titleBar.appendChild(fakeClose);

        const instruction = document.createElement("div");
        instruction.id = "microgame-instruction";
        instruction.textContent = microgame.instruction;

        const timerBar = document.createElement("div");
        timerBar.id = "microgame-timerbar";
        const timerFill = document.createElement("div");
        timerFill.id = "microgame-timerfill";
        timerBar.appendChild(timerFill);

        const gameArea = document.createElement("div");
        gameArea.id = "microgame-area";

        overlay.appendChild(titleBar);
        overlay.appendChild(instruction);
        overlay.appendChild(timerBar);
        overlay.appendChild(gameArea);
        document.getElementById("game-wrapper").appendChild(overlay);

        let timeLeft = microgame.duration;
        const interval = setInterval(() => {
            timeLeft -= 100;
            const pct = (timeLeft / microgame.duration) * 100;
            timerFill.style.width = pct + "%";
            if (timeLeft <= 0) {
                clearInterval(interval);
                endPopup(overlay, false);
            }
        }, 100);

        microgame.init(gameArea,
            () => { clearInterval(interval); endPopup(overlay, true); },
            () => { clearInterval(interval); endPopup(overlay, false); }
        );
    }

    function endPopup(overlay, won) {
        overlay.remove();
        active = false;
        onWinCallBack(won);
    }

    return { showPopup, isActive: () => active };
}