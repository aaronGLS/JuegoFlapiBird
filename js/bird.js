/**
 * BIRD - Lógica y renderizado del pájaro (RESPONSIVO)
 */
import { state, BASE_GRAVITY, BASE_JUMP, scaleUniform, scaleByHeight, difficultyMultiplier } from './state.js';
import { sfx } from './audio.js';

export function createBird(canvas, ctx, fg, gameOverCallback) {
    // ===== CONSTANTES DE DISEÑO RESPONSIVAS =====
    // Tamaños base aumentados un 30% para mejor visibilidad
    // Estos valores se escalan automáticamente con scaleUniform()
    const Y_POSITION_RATIO = 0.25;      // Posición Y inicial = 25% de la altura
    const RADIUS_BASE = 15;             // Radio base del pájaro (era 12, +25%)
    const BODY_WIDTH_BASE = 22;         // Ancho base del cuerpo (era 17, +30%)
    const BODY_HEIGHT_BASE = 15;        // Alto base del cuerpo (era 12, +25%)
    const OSCILLATION_AMPLITUDE = 0.008; // Amplitud de oscilación como ratio de altura

    // Factor de escala adicional para balancear móvil/PC
    // En landscape (PC) el pájaro se ve más pequeño proporcionalmente,
    // así que aplicamos un pequeño boost. En portrait ya es suficiente.
    const getOrientationScale = () => {
        const isLandscape = canvas.width > canvas.height;
        return isLandscape ? 1.15 : 1.0; // +15% en PC/landscape
    };

    return {
        x: 50, // Se recalcula en resizeCanvas
        y: canvas.height * Y_POSITION_RATIO,
        speed: 0,
        rotation: 0,

        // Radio escalado uniformemente para colisiones consistentes
        // Nota: El radio de colisión NO usa orientationScale para mantener jugabilidad justa
        get radius() {
            return Math.round(scaleUniform(RADIUS_BASE));
        },

        // Posición Y inicial calculada
        get initialY() {
            return canvas.height * Y_POSITION_RATIO;
        },

        draw: function () {
            let birdX = this.x;
            let birdY = this.y;

            // Factor de escala para el dibujo (incluye boost de orientación para visibilidad)
            const orientationScale = getOrientationScale();
            const drawScale = scaleUniform(1) * orientationScale;
            const bodyWidth = BODY_WIDTH_BASE * drawScale;
            const bodyHeight = BODY_HEIGHT_BASE * drawScale;

            ctx.save();
            ctx.translate(birdX, birdY);
            let rotation = this.rotation * (Math.PI / 180);
            ctx.rotate(rotation);

            // Cuerpo (escalado)
            ctx.fillStyle = "#f4ce42";
            ctx.beginPath();
            ctx.ellipse(0, 0, bodyWidth, bodyHeight, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#000";
            ctx.stroke();

            // Ojo (escalado proporcionalmente)
            const eyeOffsetX = 6 * drawScale;
            const eyeOffsetY = -6 * drawScale;
            const eyeRadius = 6 * drawScale;
            const pupilRadius = 2 * drawScale;

            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(eyeOffsetX, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#000";
            ctx.beginPath();
            ctx.arc(eyeOffsetX + 2 * drawScale, eyeOffsetY, pupilRadius, 0, Math.PI * 2);
            ctx.fill();

            // Ala (escalada con animación)
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            let wingY = (Date.now() % 200 < 100) ? 2 * drawScale : -2 * drawScale;
            if (state.current === state.getReady) wingY = 0;
            ctx.ellipse(-6 * drawScale, 2 * drawScale + wingY, 8 * drawScale, 5 * drawScale, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Pico (escalado)
            ctx.fillStyle = "#e86101";
            ctx.beginPath();
            ctx.moveTo(8 * drawScale, 2 * drawScale);
            ctx.lineTo(18 * drawScale, 6 * drawScale);
            ctx.lineTo(8 * drawScale, 10 * drawScale);
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        },

        flap: function () {
            // Fuerza de salto escalada por altura para sensación consistente
            const scaledJump = BASE_JUMP * Math.max(0.8, scaleByHeight(1) * 0.9);
            this.speed = -scaledJump;
            sfx.play('wing');
        },

        update: function (delta) {
            // Gravedad escalada proporcionalmente y multiplicada por dificultad
            const scaledGravity = BASE_GRAVITY * Math.max(0.8, scaleByHeight(1) * 0.9) * difficultyMultiplier;

            // En GetReady, oscilación senoidal basada en tiempo real
            if (state.current == state.getReady) {
                const oscillationAmp = canvas.height * OSCILLATION_AMPLITUDE;
                this.y = this.initialY + Math.cos(Date.now() / 300) * oscillationAmp;
                this.rotation = 0;
                return;
            }

            // Física con Delta Time
            this.speed += scaledGravity * delta;
            this.y += this.speed * delta;

            // Colisión techo - evitar que el pájaro salga por arriba
            if (this.y - this.radius < 0) {
                this.y = this.radius;
                this.speed = 0; // Detener velocidad ascendente
            }

            // Colisión suelo
            if (this.y + this.radius >= canvas.height - fg.h) {
                this.y = canvas.height - fg.h - this.radius;
                if (state.current == state.game) {
                    gameOverCallback();
                }
            }

            // Rotación (escalada para velocidad visual consistente)
            const scaledJumpThreshold = BASE_JUMP * Math.max(0.8, scaleByHeight(1) * 0.9) / 2;
            if (this.speed < scaledJumpThreshold) {
                this.rotation = -25;
            } else {
                this.rotation += 5 * delta;
                this.rotation = Math.min(this.rotation, 90);
            }
        },

        reset: function () {
            this.speed = 0;
            this.rotation = 0;
            this.y = this.initialY;
        }
    };
}

