/**
 * BACKGROUND - Fondo del juego con nubes animadas (RESPONSIVO)
 */
import { state, scaleUniform, scaleByWidth } from './state.js';

export function createBackground(canvas, ctx, fg) {
    // Sistema de nubes dinámicas mejorado y responsivo
    const clouds = [];
    const TARGET_CLOUDS = 6;          // Número objetivo de nubes

    // Constantes de spawn responsivas
    const MIN_SPAWN_DELAY = 80;       // Frames mínimos entre spawns
    const MAX_SPAWN_DELAY = 200;      // Frames máximos entre spawns

    // Tamaños base de nubes (se escalarán)
    const MIN_CLOUD_SIZE_BASE = 20;
    const MAX_CLOUD_SIZE_BASE = 65;

    let spawnTimer = 0;
    let nextSpawnDelay = MIN_SPAWN_DELAY;

    /**
     * Obtiene el espaciado mínimo escalado entre nubes
     */
    function getMinCloudSpacing() {
        return Math.round(scaleByWidth(150));
    }

    /**
     * Genera una nube con propiedades aleatorias (responsiva)
     * @param {number|null} x - Posición X inicial (null = fuera de pantalla a la derecha)
     * @param {boolean} randomizeOffset - Si debe añadir offset aleatorio al spawn
     */
    function generateCloud(x = null, randomizeOffset = true) {
        // Tamaño escalado uniformemente
        const minSize = scaleUniform(MIN_CLOUD_SIZE_BASE);
        const maxSize = scaleUniform(MAX_CLOUD_SIZE_BASE);
        const size = minSize + Math.random() * (maxSize - minSize);

        // Calcular posición X con mejor distribución
        let posX;
        const spawnMargin = scaleByWidth(50);
        const randomRange = scaleByWidth(400);

        if (x !== null) {
            posX = x;
        } else if (randomizeOffset) {
            // Spawn escalonado: más lejos del borde para evitar grupos
            posX = canvas.width + spawnMargin + Math.random() * randomRange;
        } else {
            posX = canvas.width + spawnMargin;
        }

        // Posición Y en el tercio superior (responsivo)
        const minY = canvas.height * 0.05;
        const maxY = canvas.height * 0.35;

        return {
            x: posX,
            y: minY + Math.random() * (maxY - minY),
            circles: [
                { ox: 0, oy: 0, r: size * 0.75 },
                { ox: size * 0.55, oy: -size * 0.12, r: size * 0.95 },
                { ox: size * 1.1, oy: 0.05 * size, r: size * 0.65 },
            ],
            // Velocidades más variadas, escaladas por tamaño de referencia
            speed: scaleByWidth(0.2 + Math.random() * 0.5 + (maxSize - size) / 80),
            opacity: 0.5 + Math.random() * 0.5,
            width: size * 1.8 // Ancho aproximado para cálculos de espaciado
        };
    }

    /**
     * Verifica si una posición X está demasiado cerca de nubes existentes
     */
    function isTooCloseToOthers(x) {
        const minSpacing = getMinCloudSpacing();
        for (const cloud of clouds) {
            if (Math.abs(cloud.x - x) < minSpacing) {
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
                const spawnMargin = scaleByWidth(50);
                const randomOffset = scaleByWidth(300);
                const spawnX = canvas.width + spawnMargin + Math.random() * randomOffset;

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

            // Edificios de fondo (escalado uniforme)
            ctx.fillStyle = "#a3e8cc";
            // Ancho de edificios escalado uniformemente
            const buildingWidthBase = 35;
            const buildingWidth = Math.max(30, Math.round(scaleUniform(buildingWidthBase)));
            const numBuildings = Math.ceil(canvas.width / buildingWidth) + 1;

            for (let i = 0; i < numBuildings; i++) {
                // Altura de edificios escalada uniformemente
                const baseHeight = scaleUniform(40);
                const variation = scaleUniform(25);
                const h = baseHeight + (Math.sin(i * 132) * variation + variation);
                ctx.fillRect(i * buildingWidth, canvas.height - fg.h - h, buildingWidth - 5, h);
            }
        }
    };
}

