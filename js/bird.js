/**
 * BIRD - Lógica y renderizado del pájaro
 */
import { state, BASE_GRAVITY, BASE_JUMP } from './state.js';
import { sfx } from './audio.js';

export function createBird(canvas, ctx, fg, gameOverCallback) {
    return {
        x: 50,
        y: 150,
        speed: 0,
        rotation: 0,
        radius: 12,

        draw: function () {
            let birdX = this.x;
            let birdY = this.y;

            ctx.save();
            ctx.translate(birdX, birdY);
            let rotation = this.rotation * (Math.PI / 180);
            ctx.rotate(rotation);

            // Cuerpo
            ctx.fillStyle = "#f4ce42";
            ctx.beginPath();
            ctx.ellipse(0, 0, 17, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#000";
            ctx.stroke();

            // Ojo
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(6, -6, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#000";
            ctx.beginPath();
            ctx.arc(8, -6, 2, 0, Math.PI * 2);
            ctx.fill();

            // Ala
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            let wingY = (Date.now() % 200 < 100) ? 2 : -2;
            if (state.current === state.getReady) wingY = 0;
            ctx.ellipse(-6, 2 + wingY, 8, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Pico
            ctx.fillStyle = "#e86101";
            ctx.beginPath();
            ctx.moveTo(8, 2);
            ctx.lineTo(18, 6);
            ctx.lineTo(8, 10);
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        },

        flap: function () {
            this.speed = -BASE_JUMP;
            sfx.play('wing');
        },

        update: function (delta) {
            // En GetReady, oscilación senoidal basada en tiempo real
            if (state.current == state.getReady) {
                this.y = 150 + Math.cos(Date.now() / 300) * 5;
                this.rotation = 0;
                return;
            }

            // Física con Delta Time
            this.speed += BASE_GRAVITY * delta;
            this.y += this.speed * delta;

            // Colisión suelo
            if (this.y + this.radius >= canvas.height - fg.h) {
                this.y = canvas.height - fg.h - this.radius;
                if (state.current == state.game) {
                    gameOverCallback();
                }
            }

            // Rotación
            if (this.speed < BASE_JUMP / 2) {
                this.rotation = -25;
            } else {
                this.rotation += 5 * delta;
                this.rotation = Math.min(this.rotation, 90);
            }
        },

        reset: function () {
            this.speed = 0;
            this.rotation = 0;
            this.y = 150;
        }
    };
}
