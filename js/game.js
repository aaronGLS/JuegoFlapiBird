/**
 * GAME.JS - Game Loop Principal y Control del Juego
 */
import { sfx } from './audio.js';
import { state, score, FRAME_DURATION, resetFrames } from './state.js';
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

// Configurar entrada
setupInput(canvas, bird, startScreen, scoreHud, resetGame);

// Configurar botón de reinicio
restartBtn.addEventListener('click', resetGame);

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
    gameOverScreen.classList.remove('hidden');
    restartBtn.focus();
}

function resetGame() {
    sfx.play('swooshing');
    bird.reset();
    pipes.reset();
    score.reset();
    state.current = state.getReady;
    resetFrames();

    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('opacity-0');
    scoreHud.classList.add('hidden');
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

    update(delta);
    draw();

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

// Iniciar bucle
requestAnimationFrame(loop);
