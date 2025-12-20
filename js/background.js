/**
 * BACKGROUND - Fondo del juego con nubes animadas (RESPONSIVO)
 */
import { state, scaleUniform, scaleByWidth, difficultyMultiplier } from './state.js';

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
            // Más círculos para nubes más esponjosas y detalladas
            circles: [
                { ox: 0, oy: 0, r: size * 0.7 },
                { ox: size * 0.45, oy: -size * 0.18, r: size * 0.9 },
                { ox: size * 0.95, oy: -size * 0.05, r: size * 0.75 },
                { ox: size * 1.35, oy: size * 0.08, r: size * 0.55 },
                { ox: size * 0.55, oy: size * 0.15, r: size * 0.45 },  // Parte inferior
                { ox: -size * 0.15, oy: size * 0.08, r: size * 0.4 },  // Cola izquierda
            ],
            // Velocidades más variadas, escaladas por tamaño de referencia
            // Velocidad base de nube, se multiplica por dificultad en update()
            baseSpeed: scaleByWidth(0.2 + Math.random() * 0.5 + (maxSize - size) / 80),
            get speed() { return this.baseSpeed * difficultyMultiplier; },
            opacity: 0.6 + Math.random() * 0.4,
            width: size * 2.0 // Ancho aproximado ajustado para cálculos de espaciado
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
            // ===== CIELO CON GRADIENTE (como pantalla de carga) =====
            const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            skyGradient.addColorStop(0, '#4ec0ca');      // Azul profundo arriba
            skyGradient.addColorStop(0.4, '#70c5ce');    // Azul original medio
            skyGradient.addColorStop(0.75, '#87CEEB');   // Azul cielo claro
            skyGradient.addColorStop(1, '#ded895');      // Arena (igual que foreground)
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // ===== NUBES MEJORADAS CON VOLUMEN =====
            for (const cloud of clouds) {
                ctx.globalAlpha = cloud.opacity;

                // Sombra sutil de la nube
                ctx.fillStyle = 'rgba(200, 220, 240, 0.4)';
                ctx.beginPath();
                for (const circle of cloud.circles) {
                    const shadowOffset = circle.r * 0.1;
                    ctx.moveTo(cloud.x + circle.ox + circle.r + shadowOffset, cloud.y + circle.oy + shadowOffset);
                    ctx.arc(cloud.x + circle.ox + shadowOffset, cloud.y + circle.oy + shadowOffset, circle.r, 0, Math.PI * 2);
                }
                ctx.fill();

                // Nube principal con gradiente
                const cloudGradient = ctx.createRadialGradient(
                    cloud.x + cloud.width * 0.3, cloud.y - 10, 0,
                    cloud.x + cloud.width * 0.5, cloud.y + 5, cloud.width * 0.8
                );
                cloudGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                cloudGradient.addColorStop(0.6, 'rgba(250, 252, 255, 0.95)');
                cloudGradient.addColorStop(1, 'rgba(230, 240, 250, 0.8)');

                ctx.fillStyle = cloudGradient;
                ctx.beginPath();
                for (const circle of cloud.circles) {
                    ctx.moveTo(cloud.x + circle.ox + circle.r, cloud.y + circle.oy);
                    ctx.arc(cloud.x + circle.ox, cloud.y + circle.oy, circle.r, 0, Math.PI * 2);
                }
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            // ===== EDIFICIOS MEJORADOS CON VENTANAS =====
            const buildingWidthBase = 35;
            const buildingWidth = Math.max(30, Math.round(scaleUniform(buildingWidthBase)));
            const numBuildings = Math.ceil(canvas.width / buildingWidth) + 1;

            // Paleta de colores para edificios (tonos verde menta variados)
            const buildingColors = ['#a3e8cc', '#95dfc0', '#8ed6b8', '#a8ecce', '#9be3c4'];

            for (let i = 0; i < numBuildings; i++) {
                // Altura de edificios con más variación
                const baseHeight = scaleUniform(45);
                const variation = scaleUniform(35);
                const h = baseHeight + (Math.sin(i * 132) * variation + variation * 0.8);
                const buildingX = i * buildingWidth;
                const buildingY = canvas.height - fg.h - h;

                // Color del edificio (variado)
                ctx.fillStyle = buildingColors[i % buildingColors.length];
                ctx.fillRect(buildingX, buildingY, buildingWidth - 4, h);

                // Borde superior del edificio
                ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.fillRect(buildingX, buildingY, buildingWidth - 4, 3);

                // Ventanas iluminadas
                const windowSize = Math.max(3, Math.round(scaleUniform(4)));
                const windowGap = Math.max(8, Math.round(scaleUniform(10)));
                const windowMargin = windowGap / 2;

                ctx.fillStyle = 'rgba(255, 255, 200, 0.7)';
                for (let wx = buildingX + windowMargin; wx < buildingX + buildingWidth - windowMargin - windowSize; wx += windowGap) {
                    for (let wy = buildingY + windowGap; wy < canvas.height - fg.h - windowGap; wy += windowGap) {
                        // 60% de ventanas encendidas (basado en posición para consistencia)
                        if (((wx * 7 + wy * 13) % 10) > 3) {
                            ctx.fillRect(wx, wy, windowSize, windowSize);
                        }
                    }
                }
            }
        }
    };
}

