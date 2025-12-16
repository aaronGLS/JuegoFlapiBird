/**
 * LOADER.JS - Sistema de Precarga de Recursos
 * Carga todos los assets antes de iniciar el juego
 */

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

// Almacén de assets precargados
export const preloadedAssets = {
    sfx: {},
    music: null
};

// Elementos UI de la pantalla de carga
let loadingScreen, progressBar, progressText;

/**
 * Inicializa referencias a elementos UI
 */
function initUIElements() {
    loadingScreen = document.getElementById('loading-screen');
    progressBar = document.getElementById('progress-fill');
    progressText = document.getElementById('progress-text');
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
 * Precarga un archivo de audio
 * @param {string} url - URL del archivo de audio
 * @returns {Promise<HTMLAudioElement>}
 */
function preloadAudio(url) {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.preload = 'auto';

        audio.addEventListener('canplaythrough', () => {
            resolve(audio);
        }, { once: true });

        audio.addEventListener('error', (e) => {
            console.warn(`Error cargando audio: ${url}`, e);
            // Resolvemos de todos modos para no bloquear la carga
            resolve(audio);
        }, { once: true });

        audio.src = url;
        audio.load();
    });
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
    updateProgress(0);

    const sfxKeys = Object.keys(SFX_URLS);
    const totalAssets = sfxKeys.length + 2; // SFX + música + fuentes
    let loadedAssets = 0;

    // Precargar efectos de sonido
    for (const key of sfxKeys) {
        try {
            preloadedAssets.sfx[key] = await preloadAudio(SFX_URLS[key]);
            loadedAssets++;
            updateProgress((loadedAssets / totalAssets) * 100);
        } catch (e) {
            console.warn(`No se pudo precargar SFX: ${key}`);
            loadedAssets++;
            updateProgress((loadedAssets / totalAssets) * 100);
        }
    }

    // Precargar música de fondo
    try {
        preloadedAssets.music = await preloadAudio(MUSIC_URL);
        preloadedAssets.music.loop = true;
        preloadedAssets.music.volume = 0.3;
    } catch (e) {
        console.warn('No se pudo precargar la música');
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

    console.log('✅ Todos los recursos precargados correctamente');
}
