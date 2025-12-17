/**
 * ESTADO DEL JUEGO Y CONSTANTES
 */

// Constantes físicas ajustadas para Delta Time
// Estas constantes asumen un objetivo de 60FPS. El multiplicador 'delta' ajustará esto en tiempo real.
export const TARGET_FPS = 60;
export const FRAME_DURATION = 1000 / TARGET_FPS;

// ===== SISTEMA DE ESCALADO RESPONSIVO =====
// Dimensiones de referencia (diseño base)
export const REFERENCE_WIDTH = 400;
export const REFERENCE_HEIGHT = 700;

// Variables de escala (se actualizan con updateScale)
export let scaleX = 1;
export let scaleY = 1;
export let scale = 1; // Factor de escala uniforme (el menor de X e Y)

/**
 * Actualiza los factores de escala basándose en el tamaño actual del canvas
 * @param {number} canvasWidth - Ancho actual del canvas
 * @param {number} canvasHeight - Alto actual del canvas
 */
export function updateScale(canvasWidth, canvasHeight) {
    scaleX = canvasWidth / REFERENCE_WIDTH;
    scaleY = canvasHeight / REFERENCE_HEIGHT;
    scale = Math.min(scaleX, scaleY); // Usar el menor para mantener proporciones
}

/**
 * Escala un valor basándose en el ancho de referencia
 * @param {number} value - Valor en píxeles de referencia
 * @returns {number} Valor escalado
 */
export function scaleByWidth(value) {
    return value * scaleX;
}

/**
 * Escala un valor basándose en la altura de referencia
 * @param {number} value - Valor en píxeles de referencia
 * @returns {number} Valor escalado
 */
export function scaleByHeight(value) {
    return value * scaleY;
}

/**
 * Escala un valor uniformemente (mantiene proporciones)
 * @param {number} value - Valor en píxeles de referencia
 * @returns {number} Valor escalado uniformemente
 */
export function scaleUniform(value) {
    return value * scale;
}

// Valores base (relativos a 60fps)
export const BASE_SPEED = 3;
export const BASE_GRAVITY = 0.25;
export const BASE_JUMP = 4.6;
export const BASE_PIPE_SPAWN = 100; // Frames

// Estado del juego
export const state = {
    current: -1,    // Inicia en loading
    loading: -1,    // Estado de carga (bloquea input)
    getReady: 0,
    game: 1,
    over: 2,
    paused: false  // Estado de pausa
};

// Funciones de carga
export function isLoading() {
    return state.current === state.loading;
}

export function finishLoading() {
    if (state.current === state.loading) {
        state.current = state.getReady;
    }
}

// Funciones de pausa
export function togglePause() {
    if (state.current === state.game) {
        state.paused = !state.paused;
        return state.paused;
    }
    return false;
}

export function isPaused() {
    return state.paused;
}

export function setPaused(value) {
    state.paused = value;
}

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