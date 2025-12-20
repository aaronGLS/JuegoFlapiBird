/**
 * GAME.JS - Game Loop Principal y Control del Juego
 */
import { preloadAssets } from './loader.js';
import { sfx, music } from './audio.js';
import { state, score, FRAME_DURATION, resetFrames, togglePause, isPaused, setPaused, finishLoading, updateDifficulty, resetDifficulty } from './state.js';
import { createBackground } from './background.js';
import { createForeground } from './foreground.js';
import { createBird } from './bird.js';
import { createPipes } from './pipes.js';
import { createParticleSystem } from './particles.js';
import { setupInput } from './input.js';
import { initUISounds } from './ui.js';

// Configuración del Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elementos UI
const startScreen = document.getElementById('start-screen');
const scoreHud = document.getElementById('score-hud');
const currentScoreEl = document.getElementById('current-score');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const bestScoreEl = document.getElementById('best-score');
const restartBtn = document.getElementById('restart-btn');
const flashOverlay = document.getElementById('flash-overlay');
const medalDisplay = document.getElementById('medal-display');
const medalIcon = document.getElementById('medal-icon');

// Elementos de pausa y música
const pauseBtn = document.getElementById('pause-btn');
const pauseScreen = document.getElementById('pause-screen');
const resumeBtn = document.getElementById('resume-btn');
const musicBtn = document.getElementById('music-btn');
const volumeSlider = document.getElementById('volume-slider');

// Variables de Tiempo (Delta Time Logic)
let lastTime = 0;

// Elementos de puntuación para pasar a los módulos
const scoreElements = {
    current: currentScoreEl,
    final: finalScoreEl,
    best: bestScoreEl
};

// Crear objetos del juego
const fg = createForeground(canvas, ctx);
const bg = createBackground(canvas, ctx, fg);
const bird = createBird(canvas, ctx, fg, gameOver);
const pipes = createPipes(canvas, ctx, fg, bird, gameOver, scoreElements);
const particles = createParticleSystem(canvas, ctx);

// Configurar entrada (pasar handlePause para la tecla Escape)
setupInput(canvas, bird, startScreen, scoreHud, resetGame, handlePause);

/**
 * Helper para eventos táctiles móviles
 * Maneja tanto touch como click evitando eventos duplicados
 * Usa stopPropagation y preventDefault para evitar que el evento llegue al inputHandler del juego
 */
function addMobileClickListener(element, handler) {
    let touchHandled = false;

    // Manejar touch para dispositivos móviles
    element.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        touchHandled = true;
        handler(e);
        // Reset flag después de un delay para evitar el click fantasma
        setTimeout(() => {
            touchHandled = false;
        }, 400);
    }, { passive: false });

    // Manejar click para PC (solo si no fue touch)
    element.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!touchHandled) {
            handler(e);
        }
    });

    // Prevenir que mousedown active el salto del pájaro
    element.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });

    // Prevenir que touchstart active el salto del pájaro
    // IMPORTANTE: passive: false permite usar preventDefault()
    element.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    }, { passive: false });
}

// Configurar botón de reinicio (compatible con móvil)
addMobileClickListener(restartBtn, resetGame);

// Configurar controles de pausa (compatible con móvil)
addMobileClickListener(pauseBtn, handlePause);
addMobileClickListener(resumeBtn, handleResume);

// Configurar controles de música (compatible con móvil)
addMobileClickListener(musicBtn, toggleMusic);
volumeSlider.addEventListener('input', handleVolumeChange);

/**
 * CONTROL DE PAUSA
 */
function handlePause() {
    if (isPaused()) {
        handleResume();
        return;
    }

    if (state.current === state.game && !isPaused()) {
        setPaused(true);
        pauseScreen.classList.remove('fade-hidden');
        pauseBtn.classList.add('fade-hidden');
        music.pause();
    }
}

function handleResume() {
    if (isPaused()) {
        setPaused(false);
        pauseScreen.classList.add('fade-hidden');
        pauseBtn.classList.remove('fade-hidden');
        lastTime = 0; // Reset delta time para evitar saltos
        // Siempre reanudar la música al despausar.
        // Si está muteada, _startFromOffset la iniciará con volumen 0,
        // permitiendo que toggleMute la active instantáneamente después.
        music.resume();
    }
}

/**
 * CONTROL DE MÚSICA
 */
function toggleMusic() {
    const isMuted = music.toggleMute();
    updateMusicButtonIcon(isMuted);
}

function updateMusicButtonIcon(isMuted) {
    const icon = musicBtn.querySelector('span');
    if (icon) {
        icon.innerText = isMuted ? '🔇' : '🎵';
    }
}

function handleVolumeChange(e) {
    const volume = parseFloat(e.target.value);
    music.setVolume(volume);
}

/**
 * CONTROL DE ESTADOS Y EVENTOS
 */

/**
 * Efecto de screen shake para impacto visual
 */
function triggerScreenShake() {
    const container = document.getElementById('game-container');
    container.classList.add('screen-shake');
    setTimeout(() => {
        container.classList.remove('screen-shake');
    }, 400);
}

function triggerFlash() {
    flashOverlay.style.opacity = '0.8';
    setTimeout(() => {
        flashOverlay.style.opacity = '0';
    }, 100);
}

/**
 * Anima un contador de 0 al valor final
 * @param {HTMLElement} element - Elemento a animar
 * @param {number} targetValue - Valor final
 * @param {number} duration - Duración en ms
 */
function animateCounter(element, targetValue, duration = 800) {
    const startTime = performance.now();
    const startValue = 0;

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing: ease-out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + (targetValue - startValue) * easeProgress);

        element.innerText = currentValue;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.innerText = targetValue;
            // Añadir efecto pop al terminar
            element.classList.add('counter-complete');
            setTimeout(() => element.classList.remove('counter-complete'), 300);
        }
    }

    requestAnimationFrame(updateCounter);
}

/**
 * Crea efecto de confeti/estrellas para nuevo récord
 */
function triggerNewRecordCelebration() {
    const container = document.getElementById('game-over-screen');
    const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';
        particle.style.cssText = `
            left: ${Math.random() * 100}%;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            animation-delay: ${Math.random() * 0.5}s;
            animation-duration: ${1.5 + Math.random() * 1}s;
        `;
        container.appendChild(particle);

        // Limpiar después de la animación
        setTimeout(() => particle.remove(), 3000);
    }
}

function gameOver() {
    // Evitar que se llame múltiples veces
    if (state.current === state.over) return;

    state.current = state.over;
    sfx.play('hit');

    // === SCREEN SHAKE ===
    triggerScreenShake();

    // Emitir partículas de explosión en la posición del pájaro
    particles.emit(bird.x, bird.y);

    // Pequeño delay para el sonido de caída "die"
    setTimeout(() => sfx.play('die'), 500);

    triggerFlash();

    // Detectar si es nuevo récord ANTES de guardar
    const isNewRecord = score.value > score.best;
    score.save();

    // Detener música completamente en game over
    music.stop();

    // === SISTEMA DE MEDALLAS MEJORADO ===
    medalIcon.className = "text-3xl font-bold text-shadow";
    medalDisplay.style.backgroundColor = "#bdae79";

    if (score.value >= 10) {
        if (score.value >= 40) {
            medalDisplay.style.backgroundColor = "#4eb3e6";
            medalIcon.innerText = "P";
            medalIcon.style.color = "#fff";
        } else if (score.value >= 30) {
            medalDisplay.style.backgroundColor = "#eebb32";
            medalIcon.innerText = "G";
            medalIcon.style.color = "#fff";
        } else if (score.value >= 20) {
            medalDisplay.style.backgroundColor = "#dcdcdc";
            medalIcon.innerText = "S";
            medalIcon.style.color = "#666";
        } else {
            medalDisplay.style.backgroundColor = "#e39a54";
            medalIcon.innerText = "B";
            medalIcon.style.color = "#fff";
        }
    } else {
        // Placeholder para sin medalla - muestra "?" en gris
        medalIcon.innerText = "?";
        medalIcon.style.color = "rgba(0,0,0,0.2)";
    }

    // === MOSTRAR PANTALLA CON CONTADORES ANIMADOS ===
    scoreHud.classList.add('fade-hidden');
    pauseBtn.classList.add('fade-hidden');
    gameOverScreen.classList.remove('fade-hidden');

    // Inicializar contadores en 0
    finalScoreEl.innerText = '0';
    bestScoreEl.innerText = '0';

    // Animar contadores con delays escalonados
    setTimeout(() => {
        animateCounter(finalScoreEl, score.value, 600);
    }, 400); // Después de que aparezca el panel

    setTimeout(() => {
        animateCounter(bestScoreEl, score.best, 600);
    }, 600);

    // === CELEBRACIÓN NUEVO RÉCORD ===
    if (isNewRecord && score.value > 0) {
        setTimeout(() => {
            triggerNewRecordCelebration();
            // Añadir clase especial al best score
            bestScoreEl.classList.add('new-record-glow');
        }, 1000);
    }

    restartBtn.focus();
}

function resetGame() {
    sfx.play('swooshing');
    particles.reset(); // Limpiar partículas residuales
    bird.reset();
    pipes.reset();
    score.reset();
    resetDifficulty(); // Reiniciar dificultad al resetear juego
    score.draw(currentScoreEl, finalScoreEl, bestScoreEl);  // Actualizar UI inmediatamente
    state.current = state.getReady;
    setPaused(false);
    resetFrames();

    // Limpiar efectos visuales de game over
    bestScoreEl.classList.remove('new-record-glow');
    document.querySelectorAll('.confetti-particle').forEach(p => p.remove());

    gameOverScreen.classList.add('fade-hidden');
    pauseScreen.classList.add('fade-hidden');
    startScreen.classList.remove('opacity-0'); // startScreen usa opacity simple o removemos si usamos ui-layer
    // Mejor resetear start-screen a visible si usamos fade-hidden
    startScreen.classList.remove('fade-hidden'); // Asumiendo que start-screen también usará fade-hidden

    scoreHud.classList.add('fade-hidden');
    pauseBtn.classList.add('fade-hidden');
}

/**
 * BUCLE DE JUEGO PRINCIPAL (Game Loop)
 * Implementación de Delta Time
 */
function loop(timestamp) {
    // Calcular delta time
    if (!lastTime) lastTime = timestamp;

    let dt = timestamp - lastTime;
    if (dt > 100) dt = 100; // Limitar a máximo 100ms para prevenir saltos enormes (tunneling)
    lastTime = timestamp;

    // Factor de normalización
    const delta = dt / FRAME_DURATION;

    // Solo actualizar si no está pausado
    if (!isPaused()) {
        update(delta);
    }

    draw();

    // Dibujar overlay de pausa si está pausado
    if (isPaused()) {
        drawPauseOverlay();
    }

    requestAnimationFrame(loop);
}

function update(delta) {
    bg.update(delta);  // Actualizar nubes animadas
    bird.update(delta);
    fg.update(delta);
    pipes.update(delta);
    particles.update(delta); // Actualizar partículas
    updateDifficulty(score.value); // Actualizar dificultad según puntuación
}

function draw() {
    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    particles.draw(); // Dibujar partículas sobre todo
}

function drawPauseOverlay() {
    // Overlay semi-transparente adicional en el canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * INICIALIZACIÓN DEL JUEGO
 * Espera a que todos los recursos estén precargados
 */
async function initGame() {
    // Esperar a que todos los assets se precarguen
    await preloadAssets();

    // Inicializar música con el audio precargado
    music.init();

    // Sincronizar el slider de volumen con el valor por defecto
    volumeSlider.value = music.getVolume();

    // Marcar que la carga terminó para permitir inputs
    finishLoading();

    // Inicializar sonidos UI (hover/click)
    initUISounds();

    console.log('🎮 Juego iniciado - todos los recursos listos');

    // Iniciar bucle del juego
    requestAnimationFrame(loop);
}

// Iniciar el proceso de carga e inicialización
initGame();