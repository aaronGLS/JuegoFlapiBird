/**
 * BACKGROUND - Fondo del juego
 */

export function createBackground(canvas, ctx, fg) {
    return {
        draw: function () {
            ctx.fillStyle = "#70c5ce";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Nubes
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(100, canvas.height - 150, 30, 0, Math.PI * 2);
            ctx.arc(140, canvas.height - 150, 40, 0, Math.PI * 2);
            ctx.arc(180, canvas.height - 150, 30, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(canvas.width - 100, canvas.height - 200, 30, 0, Math.PI * 2);
            ctx.arc(canvas.width - 60, canvas.height - 210, 50, 0, Math.PI * 2);
            ctx.arc(canvas.width - 20, canvas.height - 200, 30, 0, Math.PI * 2);
            ctx.fill();

            // Edificios de fondo
            ctx.fillStyle = "#a3e8cc";
            const buildingWidth = 60;
            const numBuildings = Math.ceil(canvas.width / buildingWidth) + 1;
            for (let i = 0; i < numBuildings; i++) {
                const h = 50 + (Math.sin(i * 132) * 20 + 20);
                ctx.fillRect(i * buildingWidth, canvas.height - fg.h - h, buildingWidth - 5, h);
            }
        }
    };
}
