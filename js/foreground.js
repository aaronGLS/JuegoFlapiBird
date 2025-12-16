/**
 * FOREGROUND - Suelo animado del juego
 */
import { state } from './state.js';

export function createForeground(canvas, ctx) {
    return {
        h: 112,
        x: 0,
        dx: 3,

        draw: function () {
            ctx.fillStyle = "#ded895";
            const yPos = canvas.height - this.h;
            ctx.fillRect(0, yPos, canvas.width, this.h);

            // Borde superior verde
            ctx.fillStyle = "#73bf2e";
            ctx.fillRect(0, yPos, canvas.width, 12);
            ctx.strokeStyle = "#558c22";
            ctx.beginPath();
            ctx.moveTo(0, yPos + 12);
            ctx.lineTo(canvas.width, yPos + 12);
            ctx.stroke();

            // Textura diagonal animada
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, yPos + 14, canvas.width, this.h - 14);
            ctx.clip();

            ctx.strokeStyle = "#d0c874";
            ctx.lineWidth = 2;
            const spacing = 20;
            const offset = this.x % spacing;

            for (let i = -spacing; i < canvas.width + spacing; i += spacing) {
                ctx.beginPath();
                ctx.moveTo(i - offset, yPos + 14);
                ctx.lineTo(i - offset - 10, canvas.height);
                ctx.stroke();
            }
            ctx.restore();

            // Borde superior oscuro
            ctx.fillStyle = "#543847";
            ctx.fillRect(0, yPos, canvas.width, 2);
        },

        update: function (delta) {
            if (state.current == state.game) {
                this.x = (this.x + this.dx * delta) % 20;
            }
        }
    };
}
