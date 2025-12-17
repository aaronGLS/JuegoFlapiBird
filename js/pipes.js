/**
 * PIPES - Sistema de tuberías (RESPONSIVO)
 */
import { state, score, BASE_PIPE_SPAWN, scaleByWidth, scaleByHeight, scaleUniform } from './state.js';
import { sfx } from './audio.js';

export function createPipes(canvas, ctx, fg, bird, gameOverCallback, scoreElements) {
    // ===== CONSTANTES DE DISEÑO BASE (para 400x700) =====
    // Usamos valores absolutos que se escalan uniformemente
    const PIPE_WIDTH_BASE = 52;         // Ancho base de tubería en píxeles
    const GAP_BASE = 140;               // Gap base entre tuberías en píxeles
    const MIN_GAP = 100;                // Gap mínimo absoluto
    const MAX_GAP = 200;                // Gap máximo absoluto
    const SPEED_BASE = 3;               // Velocidad base en píxeles por frame

    return {
        position: [],
        spawnTimer: 0,

        // ===== PROPIEDADES CON ESCALADO UNIFORME =====
        get w() {
            // Ancho escalado uniformemente - se ve proporcional en todas las pantallas
            return Math.round(scaleUniform(PIPE_WIDTH_BASE));
        },

        get dx() {
            // Velocidad escalada uniformemente para consistencia
            return Math.max(2, scaleUniform(SPEED_BASE));
        },

        get gap() {
            // Gap escalado uniformemente con límites para jugabilidad
            const scaledGap = Math.round(scaleUniform(GAP_BASE));
            return Math.max(MIN_GAP, Math.min(MAX_GAP, scaledGap));
        },

        draw: function () {
            const pipeWidth = this.w;
            const currentGap = this.gap;
            const capHeight = Math.round(pipeWidth * 0.46); // Proporción del cap
            const capOverhang = Math.round(pipeWidth * 0.04);

            for (let i = 0; i < this.position.length; i++) {
                let p = this.position[i];
                let topY = p.y;
                let bottomY = p.y + currentGap;

                ctx.fillStyle = "#73bf2e";
                ctx.strokeStyle = "#543847";
                ctx.lineWidth = 2;

                // Tubería arriba
                ctx.fillRect(p.x, 0, pipeWidth, topY);
                ctx.strokeRect(p.x, -2, pipeWidth, topY + 2);
                ctx.fillRect(p.x - capOverhang, topY - capHeight, pipeWidth + capOverhang * 2, capHeight);
                ctx.strokeRect(p.x - capOverhang, topY - capHeight, pipeWidth + capOverhang * 2, capHeight);

                // Brillo arriba
                ctx.fillStyle = "#9ce659";
                const highlightWidth = Math.max(2, Math.round(pipeWidth * 0.08));
                ctx.fillRect(p.x + highlightWidth, 0, highlightWidth, topY - capHeight);
                ctx.fillRect(p.x + capOverhang, topY - capHeight, highlightWidth, capHeight);

                // Tubería abajo
                ctx.fillStyle = "#73bf2e";
                ctx.fillRect(p.x, bottomY, pipeWidth, canvas.height - bottomY - fg.h);
                ctx.strokeRect(p.x, bottomY, pipeWidth, canvas.height - bottomY - fg.h);
                ctx.fillRect(p.x - capOverhang, bottomY, pipeWidth + capOverhang * 2, capHeight);
                ctx.strokeRect(p.x - capOverhang, bottomY, pipeWidth + capOverhang * 2, capHeight);

                // Brillo abajo
                ctx.fillStyle = "#9ce659";
                ctx.fillRect(p.x + highlightWidth, bottomY + capHeight, highlightWidth, canvas.height - bottomY - fg.h);
                ctx.fillRect(p.x + capOverhang, bottomY, highlightWidth, capHeight);
            }
        },

        update: function (delta) {
            if (state.current !== state.game) return;

            const pipeWidth = this.w;
            const currentGap = this.gap;
            const currentDx = this.dx;

            // Spawn rate FIJO para consistencia - mismo ritmo en todas las pantallas
            // BASE_PIPE_SPAWN = 100 frames (a 60fps = ~1.67 segundos entre tuberías)
            const adjustedSpawnRate = BASE_PIPE_SPAWN;

            // Spawn logic usando temporizador acumulativo
            this.spawnTimer += delta;

            if (this.spawnTimer >= adjustedSpawnRate) {
                // Márgenes proporcionales
                const topMargin = Math.round(canvas.height * 0.07);
                const bottomMargin = Math.round(canvas.height * 0.07);

                let min = topMargin;
                let max = canvas.height - fg.h - currentGap - bottomMargin;

                // Seguridad: asegurar que max > min
                if (max <= min) {
                    max = min + 50;
                }

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
                p.x -= currentDx * delta;

                // Colisiones - usar el radio definido en bird.js para consistencia
                let birdRadius = bird.radius;
                let bottomPipeY = p.y + currentGap;

                if (bird.x + birdRadius > p.x && bird.x - birdRadius < p.x + pipeWidth) {
                    if (bird.y - birdRadius < p.y || bird.y + birdRadius > bottomPipeY) {
                        gameOverCallback();
                    }
                }

                // Puntuación
                if (p.x + pipeWidth < bird.x && !p.passed) {
                    score.increment();
                    p.passed = true;
                    score.draw(scoreElements.current, scoreElements.final, scoreElements.best);
                    sfx.play('point');
                }

                // Eliminar tuberías fuera de pantalla
                if (p.x + pipeWidth <= 0) {
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

