/**
 * PARTICLES.JS - Sistema de Partículas Optimizado
 * 
 * Efectos visuales para la muerte del pájaro con:
 * - Object Pooling para evitar garbage collection
 * - Física realista con gravedad y fricción
 * - Colores coherentes con el diseño del pájaro
 * - Límite de partículas para mantener rendimiento
 */
import { scaleUniform } from './state.js';

// ===== CONFIGURACIÓN DE PARTÍCULAS =====
const CONFIG = {
    // Cantidad de partículas
    FEATHER_COUNT: 15,      // Plumas principales
    SPARK_COUNT: 12,        // Chispas/destellos
    DEBRIS_COUNT: 8,        // Fragmentos pequeños

    // Física
    GRAVITY: 0.15,
    FRICTION: 0.98,

    // Vida útil (en frames a 60fps)
    FEATHER_LIFETIME: 90,
    SPARK_LIFETIME: 45,
    DEBRIS_LIFETIME: 60,

    // Pool máximo (para object pooling)
    MAX_POOL_SIZE: 150
};

// Paleta de colores del pájaro
const COLORS = {
    // Amarillos del cuerpo
    bodyYellow: ['#f4ce42', '#fae57d', '#f5d559', '#e8c133'],
    // Naranjas del pico
    beakOrange: ['#e86101', '#ff7733', '#ff9955', '#cc5500'],
    // Blancos del ala
    wingWhite: ['#ffffff', '#f5f5f5', '#eeeeee', '#e8e8e8'],
    // Destellos
    sparkColors: ['#ffffff', '#ffffaa', '#ffdd88', '#ffcc00']
};

// ===== OBJECT POOL =====
class ParticlePool {
    constructor() {
        this.pool = [];
        this.active = [];
    }

    /**
     * Obtiene una partícula del pool o crea una nueva
     */
    acquire() {
        let particle;
        if (this.pool.length > 0) {
            particle = this.pool.pop();
        } else if (this.active.length < CONFIG.MAX_POOL_SIZE) {
            particle = {};
        } else {
            // Pool lleno, reutilizar la partícula más vieja
            particle = this.active.shift();
        }
        this.active.push(particle);
        return particle;
    }

    /**
     * Devuelve una partícula al pool
     */
    release(particle) {
        const index = this.active.indexOf(particle);
        if (index > -1) {
            this.active.splice(index, 1);
            if (this.pool.length < CONFIG.MAX_POOL_SIZE) {
                this.pool.push(particle);
            }
        }
    }

    /**
     * Limpia todas las partículas activas
     */
    reset() {
        this.pool = this.pool.concat(this.active.slice(0, CONFIG.MAX_POOL_SIZE - this.pool.length));
        this.active = [];
    }
}

// ===== SISTEMA DE PARTÍCULAS =====
export function createParticleSystem(canvas, ctx) {
    const pool = new ParticlePool();

    /**
     * Selecciona un color aleatorio del array
     */
    function randomColor(colorArray) {
        return colorArray[Math.floor(Math.random() * colorArray.length)];
    }

    /**
     * Genera un número aleatorio en rango
     */
    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Crea una partícula de pluma
     */
    function createFeather(x, y, scale) {
        const particle = pool.acquire();
        const angle = random(0, Math.PI * 2);
        const speed = random(3, 8) * scale;

        particle.type = 'feather';
        particle.x = x;
        particle.y = y;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed - random(2, 5) * scale;
        particle.rotation = random(0, 360);
        particle.rotationSpeed = random(-15, 15);
        particle.width = random(8, 14) * scale;
        particle.height = random(4, 7) * scale;
        particle.color = randomColor(COLORS.bodyYellow);
        particle.life = CONFIG.FEATHER_LIFETIME;
        particle.maxLife = CONFIG.FEATHER_LIFETIME;
        particle.gravity = CONFIG.GRAVITY * scale;

        return particle;
    }

    /**
     * Crea una partícula de chispa/destello
     */
    function createSpark(x, y, scale) {
        const particle = pool.acquire();
        const angle = random(0, Math.PI * 2);
        const speed = random(5, 12) * scale;

        particle.type = 'spark';
        particle.x = x;
        particle.y = y;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed - random(3, 6) * scale;
        particle.size = random(3, 6) * scale;
        particle.color = randomColor(COLORS.sparkColors);
        particle.life = CONFIG.SPARK_LIFETIME;
        particle.maxLife = CONFIG.SPARK_LIFETIME;
        particle.gravity = CONFIG.GRAVITY * 0.5 * scale;

        return particle;
    }

    /**
     * Crea una partícula de fragmento pequeño
     */
    function createDebris(x, y, scale) {
        const particle = pool.acquire();
        const angle = random(0, Math.PI * 2);
        const speed = random(2, 6) * scale;

        particle.type = 'debris';
        particle.x = x;
        particle.y = y;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed - random(1, 4) * scale;
        particle.size = random(2, 5) * scale;
        // Mezcla de colores
        const allColors = [...COLORS.beakOrange, ...COLORS.wingWhite];
        particle.color = randomColor(allColors);
        particle.life = CONFIG.DEBRIS_LIFETIME;
        particle.maxLife = CONFIG.DEBRIS_LIFETIME;
        particle.gravity = CONFIG.GRAVITY * 1.2 * scale;

        return particle;
    }

    return {
        /**
         * Dispara efecto de explosión de partículas
         * @param {number} x - Posición X del origen
         * @param {number} y - Posición Y del origen
         */
        emit(x, y) {
            const scale = scaleUniform(1);

            // Crear plumas
            for (let i = 0; i < CONFIG.FEATHER_COUNT; i++) {
                createFeather(x, y, scale);
            }

            // Crear chispas
            for (let i = 0; i < CONFIG.SPARK_COUNT; i++) {
                createSpark(x, y, scale);
            }

            // Crear fragmentos
            for (let i = 0; i < CONFIG.DEBRIS_COUNT; i++) {
                createDebris(x, y, scale);
            }
        },

        /**
         * Actualiza todas las partículas activas
         * @param {number} delta - Delta time normalizado
         */
        update(delta) {
            const toRelease = [];

            for (const p of pool.active) {
                // Actualizar física
                p.vy += p.gravity * delta;
                p.x += p.vx * delta;
                p.y += p.vy * delta;

                // Aplicar fricción
                p.vx *= CONFIG.FRICTION;
                p.vy *= CONFIG.FRICTION;

                // Rotación (solo plumas)
                if (p.type === 'feather') {
                    p.rotation += p.rotationSpeed * delta;
                }

                // Reducir vida
                p.life -= delta;

                // Marcar para liberar si murió o salió de pantalla
                if (p.life <= 0 || p.y > canvas.height + 50) {
                    toRelease.push(p);
                }
            }

            // Liberar partículas muertas
            for (const p of toRelease) {
                pool.release(p);
            }
        },

        /**
         * Dibuja todas las partículas activas
         */
        draw() {
            for (const p of pool.active) {
                const alpha = Math.max(0, p.life / p.maxLife);
                ctx.globalAlpha = alpha;

                if (p.type === 'feather') {
                    // Dibujar pluma con rotación
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation * Math.PI / 180);

                    // Forma de pluma (elipse con gradiente)
                    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.width);
                    gradient.addColorStop(0, p.color);
                    gradient.addColorStop(0.7, p.color);
                    gradient.addColorStop(1, 'rgba(244, 206, 66, 0)');

                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.width, p.height, 0, 0, Math.PI * 2);
                    ctx.fill();

                    // Borde sutil
                    ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.3})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    ctx.restore();

                } else if (p.type === 'spark') {
                    // Dibujar destello como estrella
                    ctx.save();
                    ctx.translate(p.x, p.y);

                    // Glow exterior
                    const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2);
                    glowGradient.addColorStop(0, p.color);
                    glowGradient.addColorStop(0.3, p.color);
                    glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                    ctx.fillStyle = glowGradient;
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2);
                    ctx.fill();

                    // Núcleo brillante
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.restore();

                } else if (p.type === 'debris') {
                    // Dibujar fragmento como cuadrado pequeño
                    ctx.fillStyle = p.color;
                    ctx.fillRect(
                        p.x - p.size / 2,
                        p.y - p.size / 2,
                        p.size,
                        p.size
                    );
                }
            }

            // Restaurar alpha
            ctx.globalAlpha = 1;
        },

        /**
         * Limpia todas las partículas
         */
        reset() {
            pool.reset();
        },

        /**
         * Verifica si hay partículas activas
         */
        hasActiveParticles() {
            return pool.active.length > 0;
        }
    };
}
