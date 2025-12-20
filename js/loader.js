/**
 * LOADER.JS - Sistema de Precarga de Recursos (Web Audio API)
 * Carga y decodifica todos los assets de audio antes de iniciar el juego.
 */

import { audioCtx } from './audio.js';

// URLs de los efectos de sonido
const SFX_URLS = {
    wing: "https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/audio/wing.wav",
    point: "https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/audio/point.wav",
    hit: "https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/audio/hit.wav",
    die: "https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/audio/die.wav",
    swooshing: "https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/audio/swooshing.wav"
};

// URL de la música de fondo
const MUSIC_URL = "./resources/music.mp3";

// Almacén de assets precargados (AudioBuffers)
export const preloadedAssets = {
    sfx: {},
    music: null
};

// Elementos UI de la pantalla de carga
let loadingScreen, progressBar, progressText, loadingTitle;

// Interval para animación de puntos suspensivos
let dotsAnimationInterval = null;

/**
 * Inicia la animación de puntos suspensivos dinámicos
 * Cicla entre "CARGANDO", "CARGANDO.", "CARGANDO..", "CARGANDO..."
 */
function startDotsAnimation() {
    if (!loadingTitle) return;

    let dotCount = 0;
    const baseText = 'CARGANDO';

    dotsAnimationInterval = setInterval(() => {
        dotCount = (dotCount + 1) % 4; // Cicla 0, 1, 2, 3
        const dots = '.'.repeat(dotCount);
        loadingTitle.textContent = baseText + dots;
    }, 400); // Cambia cada 400ms
}

/**
 * Detiene la animación de puntos suspensivos
 */
function stopDotsAnimation() {
    if (dotsAnimationInterval) {
        clearInterval(dotsAnimationInterval);
        dotsAnimationInterval = null;
    }
}

/**
 * Inicializa referencias a elementos UI
 */
function initUIElements() {
    loadingScreen = document.getElementById('loading-screen');
    progressBar = document.getElementById('progress-fill');
    progressText = document.getElementById('progress-text');
    loadingTitle = loadingScreen?.querySelector('.loading-title');
}

/**
 * Actualiza la barra de progreso
 * @param {number} percent - Porcentaje de progreso (0-100)
 */
function updateProgress(percent) {
    if (progressBar) {
        progressBar.style.width = `${percent}%`;
    }
    if (progressText) {
        progressText.textContent = `${Math.round(percent)}%`;
    }
}

/**
 * Descarga y decodifica un archivo de audio para Web Audio API
 * @param {string} url - URL del archivo de audio
 * @returns {Promise<AudioBuffer>}
 */
async function loadAndDecodeAudio(url) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        return audioBuffer;
    } catch (e) {
        console.warn(`Error cargando/decodificando audio: ${url}`, e);
        return null;
    }
}

/**
 * Espera a que las fuentes estén cargadas
 * @returns {Promise<void>}
 */
async function waitForFonts() {
    if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
    }
    // Pequeño delay adicional para asegurar renderizado
    return new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Oculta la pantalla de carga con animación
 */
function hideLoadingScreen() {
    stopDotsAnimation(); // Detener animación de puntos
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

/**
 * Precarga todos los assets del juego
 * @returns {Promise<void>}
 */
export async function preloadAssets() {
    initUIElements();
    startDotsAnimation(); // Iniciar animación de puntos suspensivos
    updateProgress(0);

    const sfxKeys = Object.keys(SFX_URLS);
    const totalAssets = sfxKeys.length + 2; // SFX + música + fuentes
    let loadedAssets = 0;

    // Precargar efectos de sonido
    for (const key of sfxKeys) {
        const buffer = await loadAndDecodeAudio(SFX_URLS[key]);
        if (buffer) {
            preloadedAssets.sfx[key] = buffer;
        }
        loadedAssets++;
        updateProgress((loadedAssets / totalAssets) * 100);
    }

    // Precargar música de fondo
    const musicBuffer = await loadAndDecodeAudio(MUSIC_URL);
    if (musicBuffer) {
        preloadedAssets.music = musicBuffer;
    }
    loadedAssets++;
    updateProgress((loadedAssets / totalAssets) * 100);

    // Esperar a que las fuentes carguen
    await waitForFonts();
    loadedAssets++;
    updateProgress(100);

    // Pequeño delay para mostrar el 100% antes de ocultar
    await new Promise(resolve => setTimeout(resolve, 300));

    // Ocultar pantalla de carga
    hideLoadingScreen();

    console.log('✅ Todos los recursos precargados y decodificados', preloadedAssets);
}