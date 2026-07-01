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
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const cx = (e.clientX - rect.left) * scaleX;
            const cy = (e.clientY - rect.top) * scaleY;

            for (const bug of bugs) {
                if (cx >= bug.x && cx <= bug.x + SIZE && cy >= bug.y && cy <= bug.y + SIZE) {
                    squashed++;
                    bug.x = Math.random() * (canvas.width - SIZE);
                    bug.y = Math.random() * (canvas.height - SIZE);
                    bug.dx = (Math.random() - 0.5) * (2 + squashed * 0.3);
                    bug.dy = (Math.random() - 0.5) * (2 + squashed * 0.3);
                    if (squashed >= 5) onWin();
                }
            }
        });
        let running = true;
        function loop() {
            if (!running) return;
            ctx.fillStyle = "#1a001a";
            ctx.fillRect(0,0, canvas.width, canvas.height);

            for (const bug of bugs) {
                bug.x += bug.dx;
                bug.y += bug.dy;
                if (bug.x < 0 || bug.x + SIZE > canvas.width) bug.dx *= -1;
                if (bug.y < 0 || bug.y + SIZE > canvas.height) bug.dy *= -1;

                ctx.fillStyle = "#ff69d4";
                ctx.fillRect(bug.x, bug.y, SIZE, SIZE);
            }

            ctx.fillStyle = "#ffff00";
            ctx.font = "8px monospace";
            ctx.fillText(`${squashed}/5`, 8, 16);

            requestAnimationFrame(loop);
        }
        loop();
        return () => { running = false; };
    }
};