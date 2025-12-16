/**
 * ESTADO DEL JUEGO Y CONSTANTES
 */

// Constantes físicas ajustadas para Delta Time
// Estas constantes asumen un objetivo de 60FPS. El multiplicador 'delta' ajustará esto en tiempo real.
export const TARGET_FPS = 60;
export const FRAME_DURATION = 1000 / TARGET_FPS;

// Valores base (relativos a 60fps)
export const BASE_SPEED = 3;
export const BASE_GRAVITY = 0.25;
export const BASE_JUMP = 4.6;
export const BASE_PIPE_SPAWN = 100; // Frames

// Estado del juego
export const state = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2
};

// Contador global de frames lógicos
export let frames = 0;

export function resetFrames() {
    frames = 0;
}

// Sistema de puntuación
export const score = {
    best: localStorage.getItem('flappy_best') || 0,
    value: 0,

    draw: function (currentScoreEl, finalScoreEl, bestScoreEl) {
        if (currentScoreEl) currentScoreEl.innerText = this.value;
        if (finalScoreEl) finalScoreEl.innerText = this.value;
        if (bestScoreEl) bestScoreEl.innerText = this.best;
    },

    reset: function () {
        this.value = 0;
    },

    increment: function () {
        this.value += 1;
        this.best = Math.max(this.value, this.best);
    },

    save: function () {
        localStorage.setItem('flappy_best', this.best);
    }
};
