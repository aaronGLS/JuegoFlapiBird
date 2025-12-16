/**
 * GAME.JS - Game Loop Principal y Control del Juego
 */
import { sfx, music } from './audio.js';
import { state, score, FRAME_DURATION, resetFrames, togglePause, isPaused, setPaused } from './state.js';
import { createBackground } from './background.js';
import { createForeground } from './foreground.js';
import { createBird } from './bird.js';
import { createPipes } from './pipes.js';
import { setupInput } from './input.js';

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
let musicStarted = false;

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

// Configurar entrada (pasar handlePause para la tecla Escape)
setupInput(canvas, bird, startScreen, scoreHud, resetGame, handlePause);

// Configurar botón de reinicio
restartBtn.addEventListener('click', resetGame);

// Configurar controles de pausa
pauseBtn.addEventListener('click', handlePause);
resumeBtn.addEventListener('click', handleResume);

// Configurar controles de música
musicBtn.addEventListener('click', toggleMusic);
volumeSlider.addEventListener('input', handleVolumeChange);

/**
 * CONTROL DE PAUSA
 */
function handlePause() {
    if (state.current === state.game && !isPaused()) {
        setPaused(true);
        pauseScreen.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
        music.pause();
    }
}

function handleResume() {
    if (isPaused()) {
        setPaused(false);
        pauseScreen.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
        lastTime = 0; // Reset delta time para evitar saltos
        if (!music.isMuted) {
            music.resume();
        }
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

function startMusic() {
    if (!musicStarted) {
        music.play();
        musicStarted = true;
    }
}

/**
 * CONTROL DE ESTADOS Y EVENTOS
 */

function triggerFlash() {
    flashOverlay.style.opacity = '0.8';
    setTimeout(() => {
        flashOverlay.style.opacity = '0';
    }, 100);
}

function gameOver() {
    // Evitar que se llame múltiples veces
    if (state.current === state.over) return;

    state.current = state.over;
    sfx.play('hit');

    // Pequeño delay para el sonido de caída "die"
    setTimeout(() => sfx.play('die'), 500);

    triggerFlash();
    score.save();

    // Pausar música en game over
    music.pause();

    // Sistema de medallas
    medalIcon.className = "hidden text-3xl font-bold text-white text-shadow";
    medalDisplay.style.backgroundColor = "#bdae79";

    if (score.value >= 10) {
        medalIcon.classList.remove('hidden');
        if (score.value >= 40) {
            medalDisplay.style.backgroundColor = "#4eb3e6";
            medalIcon.innerText = "P";
        } else if (score.value >= 30) {
            medalDisplay.style.backgroundColor = "#eebb32";
            medalIcon.innerText = "G";
        } else if (score.value >= 20) {
            medalDisplay.style.backgroundColor = "#dcdcdc";
            medalIcon.innerText = "S";
        } else {
            medalDisplay.style.backgroundColor = "#e39a54";
            medalIcon.innerText = "B";
        }
    }

    score.draw(currentScoreEl, finalScoreEl, bestScoreEl);
    scoreHud.classList.add('hidden');
    pauseBtn.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    restartBtn.focus();
}

function resetGame() {
    sfx.play('swooshing');
    bird.reset();
    pipes.reset();
    score.reset();
    state.current = state.getReady;
    setPaused(false);
    resetFrames();

    gameOverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    startScreen.classList.remove('opacity-0');
    scoreHud.classList.add('hidden');
    pauseBtn.classList.add('hidden');

    // Reanudar música si no está muteada
    if (!music.isMuted) {
        music.resume();
    }
}

/**
 * BUCLE DE JUEGO PRINCIPAL (Game Loop)
 * Implementación de Delta Time
 */
function loop(timestamp) {
    // Calcular delta time
    if (!lastTime) lastTime = timestamp;

    const dt = timestamp - lastTime;
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
    bird.update(delta);
    fg.update(delta);
    pipes.update(delta);
}

function draw() {
    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
}

function drawPauseOverlay() {
    // Overlay semi-transparente adicional en el canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Exponer función para iniciar música desde input
export { startMusic };

// Iniciar bucle
requestAnimationFrame(loop);
