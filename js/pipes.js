/**
 * PIPES - Sistema de tuberías
 */
import { state, score, BASE_PIPE_SPAWN } from './state.js';
import { sfx } from './audio.js';

export function createPipes(canvas, ctx, fg, bird, gameOverCallback, scoreElements) {
    return {
        position: [],
        w: 52,
        dx: 3,
        spawnTimer: 0,

        draw: function () {
            for (let i = 0; i < this.position.length; i++) {
                let p = this.position[i];
                let topY = p.y;
                let bottomY = p.y + 150; // Gap

                ctx.fillStyle = "#73bf2e";
                ctx.strokeStyle = "#543847";
                ctx.lineWidth = 2;

                // Tubería arriba
                ctx.fillRect(p.x, 0, this.w, topY);
                ctx.strokeRect(p.x, -2, this.w, topY + 2);
                ctx.fillRect(p.x - 2, topY - 24, this.w + 4, 24);
                ctx.strokeRect(p.x - 2, topY - 24, this.w + 4, 24);

                // Brillo arriba
                ctx.fillStyle = "#9ce659";
                ctx.fillRect(p.x + 4, 0, 4, topY - 24);
                ctx.fillRect(p.x + 2, topY - 24, 4, 24);

                // Tubería abajo
                ctx.fillStyle = "#73bf2e";
                ctx.fillRect(p.x, bottomY, this.w, canvas.height - bottomY - fg.h);
                ctx.strokeRect(p.x, bottomY, this.w, canvas.height - bottomY - fg.h);
                ctx.fillRect(p.x - 2, bottomY, this.w + 4, 24);
                ctx.strokeRect(p.x - 2, bottomY, this.w + 4, 24);

                // Brillo abajo
                ctx.fillStyle = "#9ce659";
                ctx.fillRect(p.x + 4, bottomY + 24, 4, canvas.height - bottomY - fg.h);
                ctx.fillRect(p.x + 2, bottomY, 4, 24);
            }
        },

        update: function (delta) {
            if (state.current !== state.game) return;

            // Spawn logic usando temporizador acumulativo
            this.spawnTimer += delta;

            if (this.spawnTimer >= BASE_PIPE_SPAWN) {
                let min = 50;
                let max = canvas.height - fg.h - 150 - 50;
                let y = Math.floor(Math.random() * (max - min + 1) + min);

                this.position.push({
                    x: canvas.width,
                    y: y,
                    passed: false
                });
                this.spawnTimer = 0;
            }

            for (let i = 0; i < this.position.length; i++) {
                let p = this.position[i];

                // Movimiento dependiente de delta
                p.x -= this.dx * delta;

                // Colisiones - usar el radio definido en bird.js para consistencia
                let birdRadius = bird.radius;
                let bottomPipeY = p.y + 150;

                if (bird.x + birdRadius > p.x && bird.x - birdRadius < p.x + this.w) {
                    if (bird.y - birdRadius < p.y || bird.y + birdRadius > bottomPipeY) {
                        gameOverCallback();
                    }
                }

                // Puntuación
                if (p.x + this.w < bird.x && !p.passed) {
                    score.increment();
                    p.passed = true;
                    score.draw(scoreElements.current, scoreElements.final, scoreElements.best);
                    sfx.play('point');
                }

                // Eliminar tuberías fuera de pantalla
                if (p.x + this.w <= 0) {
                    this.position.shift();
                    i--;
                }
            }
        },

        reset: function () {
            this.position = [];
            this.spawnTimer = 0;
        }
    };
}
