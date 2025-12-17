/**
 * FOREGROUND - Suelo animado del juego (RESPONSIVO)
 */
import { state, scaleByWidth } from './state.js';

export function createForeground(canvas, ctx) {
    // Altura base del foreground como porcentaje de la altura del canvas
    const HEIGHT_RATIO = 0.16; // 16% de la altura del canvas

    return {
        // Altura calculada dinámicamente
        get h() {
            return Math.round(canvas.height * HEIGHT_RATIO);
        },
        x: 0,
        // Velocidad escalada por ancho para consistencia
        get dx() {
            return scaleByWidth(3);
        },

        draw: function () {
            const currentH = this.h;
            ctx.fillStyle = "#ded895";
            const yPos = canvas.height - currentH;
            ctx.fillRect(0, yPos, canvas.width, currentH);

            // Borde superior verde (escalado)
            const borderHeight = Math.max(8, Math.round(currentH * 0.1));
            ctx.fillStyle = "#73bf2e";
            ctx.fillRect(0, yPos, canvas.width, borderHeight);
            ctx.strokeStyle = "#558c22";
            ctx.beginPath();
            ctx.moveTo(0, yPos + borderHeight);
            ctx.lineTo(canvas.width, yPos + borderHeight);
            ctx.stroke();

            // Textura diagonal animada
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, yPos + borderHeight + 2, canvas.width, currentH - borderHeight - 2);
            ctx.clip();

            ctx.strokeStyle = "#d0c874";
            ctx.lineWidth = 2;
            // Espaciado escalado
            const spacing = Math.max(15, Math.round(scaleByWidth(20)));
            const offset = this.x % spacing;

            for (let i = -spacing; i < canvas.width + spacing; i += spacing) {
                ctx.beginPath();
                ctx.moveTo(i - offset, yPos + borderHeight + 2);
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
                const spacing = Math.max(15, Math.round(scaleByWidth(20)));
                this.x = (this.x + this.dx * delta) % spacing;
            }
        }
    };
}

