/**
 * BACKGROUND - Fondo del juego con nubes animadas
 */
import { state } from './state.js';

export function createBackground(canvas, ctx, fg) {
    // Sistema de nubes dinámicas
    const clouds = [];
    const MIN_CLOUDS = 5;
    const MAX_CLOUDS = 8;

    // Generar nube con propiedades aleatorias
    function generateCloud(x = null) {
        const size = 20 + Math.random() * 40; // Tamaño variable
        return {
            x: x !== null ? x : canvas.width + Math.random() * 200,
            y: 50 + Math.random() * (canvas.height * 0.4), // Parte superior de la pantalla
            circles: [
                { ox: 0, oy: 0, r: size * 0.8 },
                { ox: size * 0.6, oy: -size * 0.1, r: size },
                { ox: size * 1.2, oy: 0, r: size * 0.7 },
            ],
            speed: 0.3 + (60 - size) / 100, // Más pequeñas = más rápidas (parallax)
            opacity: 0.6 + Math.random() * 0.4
        };
    }

    // Inicializar nubes distribuidas en la pantalla
    function initClouds() {
        clouds.length = 0;
        const numClouds = MIN_CLOUDS + Math.floor(Math.random() * (MAX_CLOUDS - MIN_CLOUDS));
        for (let i = 0; i < numClouds; i++) {
            clouds.push(generateCloud(Math.random() * canvas.width));
        }
    }

    // Inicializar al crear
    initClouds();

    return {
        // Reinicializar nubes cuando cambia el tamaño del canvas
        reinitClouds: initClouds,

        update: function (delta) {
            // Solo mover nubes durante el juego para efecto parallax
            if (state.current === state.game || state.current === state.getReady) {
                for (let i = 0; i < clouds.length; i++) {
                    const cloud = clouds[i];
                    cloud.x -= cloud.speed * delta;

                    // Reciclar nube cuando sale de la pantalla
                    if (cloud.x + 100 < 0) {
                        clouds[i] = generateCloud();
                    }
                }

                // Mantener número mínimo de nubes
                while (clouds.length < MIN_CLOUDS) {
                    clouds.push(generateCloud());
                }
            }
        },

        draw: function () {
            // Cielo de fondo
            ctx.fillStyle = "#70c5ce";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Dibujar nubes dinámicas
            ctx.fillStyle = "#ffffff";
            for (const cloud of clouds) {
                ctx.globalAlpha = cloud.opacity;
                ctx.beginPath();
                for (const circle of cloud.circles) {
                    ctx.moveTo(cloud.x + circle.ox + circle.r, cloud.y + circle.oy);
                    ctx.arc(cloud.x + circle.ox, cloud.y + circle.oy, circle.r, 0, Math.PI * 2);
                }
                ctx.fill();
            }
            ctx.globalAlpha = 1;

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
