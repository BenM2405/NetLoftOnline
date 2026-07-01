export const bugSquash = {
    title: "BUG ATTACK!!",
    instruction: "SQUASH 5 BUGS!!",
    duration: 7000,
    init(container, onWin, onLose){
        const canvas = document.createElement("canvas");
        canvas.width = 280;
        canvas.height = 150;
        canvas.style.display = "block";
        canvas.style.imageRendering = "pixelated";
        container.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        const SIZE = 14;
        let squashed = 0;

        const bugs = Array.from({ length: 3 }, () => ({
            x: Math.random() * (canvas.width - SIZE),
            y: Math.random() * (canvas.height - SIZE),
            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 2,
        }));

        canvas.addEventListener("click", (e) => {
            const rect = canvas.getBoundingClientRect();
        })
    }
}