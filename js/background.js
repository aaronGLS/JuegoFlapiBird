/**
 * BACKGROUND - Fondo del juego con nubes animadas (sistema mejorado)
 */
import { state } from './state.js';

export function createBackground(canvas, ctx, fg) {
    // Sistema de nubes dinámicas mejorado
    const clouds = [];
    const TARGET_CLOUDS = 6;          // Número objetivo de nubes
    const MIN_SPAWN_DELAY = 80;       // Frames mínimos entre spawns
    const MAX_SPAWN_DELAY = 200;      // Frames máximos entre spawns
    const MIN_CLOUD_SPACING = 150;    // Espaciado mínimo entre nubes en X

    let spawnTimer = 0;
    let nextSpawnDelay = MIN_SPAWN_DELAY;

    /**
     * Genera una nube con propiedades aleatorias
     * @param {number|null} x - Posición X inicial (null = fuera de pantalla a la derecha)
     * @param {boolean} randomizeOffset - Si debe añadir offset aleatorio al spawn
     */
    function generateCloud(x = null, randomizeOffset = true) {
        const size = 20 + Math.random() * 45; // Tamaño: 20-65

        // Calcular posición X con mejor distribución
        let posX;
        if (x !== null) {
            posX = x;
        } else if (randomizeOffset) {
            // Spawn escalonado: más lejos del borde para evitar grupos
            posX = canvas.width + 50 + Math.random() * 400;
        } else {
            posX = canvas.width + 50;
        }

        return {
            x: posX,
            y: 40 + Math.random() * (canvas.height * 0.35), // Tercio superior
            circles: [
                { ox: 0, oy: 0, r: size * 0.75 },
                { ox: size * 0.55, oy: -size * 0.12, r: size * 0.95 },
                { ox: size * 1.1, oy: 0.05 * size, r: size * 0.65 },
            ],
            // Velocidades más variadas: 0.2 - 1.0 (mayor rango = mejor separación)
            speed: 0.2 + Math.random() * 0.5 + (65 - size) / 80,
            opacity: 0.5 + Math.random() * 0.5,
            width: size * 1.8 // Ancho aproximado para cálculos de espaciado
        };
    }

    /**
     * Verifica si una posición X está demasiado cerca de nubes existentes
     */
    function isTooCloseToOthers(x) {
        for (const cloud of clouds) {
            if (Math.abs(cloud.x - x) < MIN_CLOUD_SPACING) {
                return true;
            }
        }
        return false;
    }

    /**
     * Inicializa nubes distribuidas UNIFORMEMENTE en la pantalla
     * Evita agrupamientos usando distribución por zonas
     */
    function initClouds() {
        clouds.length = 0;

        // Dividir pantalla en zonas para distribución uniforme
        const zoneWidth = canvas.width / TARGET_CLOUDS;

        for (let i = 0; i < TARGET_CLOUDS; i++) {
            // Cada nube aparece en su zona con algo de variación
            const zoneStart = i * zoneWidth;
            const x = zoneStart + Math.random() * (zoneWidth * 0.8);
            clouds.push(generateCloud(x, false));
        }

        // Resetear timer de spawn
        spawnTimer = 0;
        nextSpawnDelay = MIN_SPAWN_DELAY + Math.random() * (MAX_SPAWN_DELAY - MIN_SPAWN_DELAY);
    }

    // Inicializar al crear
    initClouds();

    return {
        reinitClouds: initClouds,

        update: function (delta) {
            // Las nubes SOLO se mueven durante el gameplay activo
            // Esto crea la ilusión de que el pájaro avanza en el mundo
            // En getReady, pause, o game over: las nubes quedan estáticas
            if (state.current !== state.game) {
                return;
            }

            // Mover nubes existentes (simula el avance del pájaro)
            for (let i = clouds.length - 1; i >= 0; i--) {
                const cloud = clouds[i];
                cloud.x -= cloud.speed * delta;

                // Eliminar nubes que salieron de la pantalla
                if (cloud.x + cloud.width < -50) {
                    clouds.splice(i, 1);
                }
            }

            // Sistema de spawn controlado por timer (evita grupos)
            spawnTimer += delta;

            if (spawnTimer >= nextSpawnDelay && clouds.length < TARGET_CLOUDS + 2) {
                // Generar nueva nube solo si no hay otra muy cerca del borde derecho
                const spawnX = canvas.width + 50 + Math.random() * 300;

                if (!isTooCloseToOthers(spawnX)) {
                    clouds.push(generateCloud(null, true));
                    spawnTimer = 0;
                    // Siguiente spawn con delay aleatorio
                    nextSpawnDelay = MIN_SPAWN_DELAY + Math.random() * (MAX_SPAWN_DELAY - MIN_SPAWN_DELAY);
                }
            }
        },

        draw: function () {
            // Cielo de fondo
            ctx.fillStyle = "#70c5ce";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Dibujar nubes
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
