/**
 * SISTEMA DE AUDIO
 * Usamos URLs de GitHub raw para los assets originales.
 * Implementación de 'cloneNode' para permitir sonidos simultáneos.
 */
const SFX_URLS = {
    wing: "https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/audio/wing.wav",
    point: "https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/audio/point.wav",
    hit: "https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/audio/hit.wav",
    die: "https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/audio/die.wav",
    swooshing: "https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/audio/swooshing.wav"
};

// Música de fondo - Loop 8-bit retro (URL con CORS habilitado)
// Usando un archivo de música retro de un repositorio público
const MUSIC_URL = "https://cdn.pixabay.com/audio/2022/03/10/audio_6c4827ef88.mp3";


export const sfx = {
    wing: new Audio(SFX_URLS.wing),
    point: new Audio(SFX_URLS.point),
    hit: new Audio(SFX_URLS.hit),
    die: new Audio(SFX_URLS.die),
    swooshing: new Audio(SFX_URLS.swooshing),

    // Método para reproducir sin esperar a que termine el sonido anterior
    play: function (soundName) {
        if (this[soundName]) {
            // Clonar el nodo permite reproducir el mismo sonido múltiples veces solapadas
            // Es crítico para el sonido "wing" cuando se pulsa rápido
            const sound = this[soundName].cloneNode();
            sound.volume = 0.5; // Volumen al 50% para no saturar
            sound.play().catch(e => console.log("Audio play blocked (user interaction needed first)"));
        }
    }
};

/**
 * SISTEMA DE MÚSICA DE FONDO
 */
export const music = {
    track: null,
    isPlaying: false,
    volume: 0.3,
    isMuted: false,

    // Inicializar la música
    init: function () {
        this.track = new Audio(MUSIC_URL);
        this.track.loop = true;
        this.track.volume = this.volume;
        this.track.preload = 'auto';
    },

    // Reproducir música
    play: function () {
        if (this.track && !this.isPlaying) {
            this.track.play().then(() => {
                this.isPlaying = true;
            }).catch(e => {
                console.log("Music play blocked (user interaction needed first)");
            });
        }
    },

    // Pausar música
    pause: function () {
        if (this.track && this.isPlaying) {
            this.track.pause();
            this.isPlaying = false;
        }
    },

    // Reanudar música
    resume: function () {
        if (this.track && !this.isPlaying && !this.isMuted) {
            this.track.play().then(() => {
                this.isPlaying = true;
            }).catch(e => { });
        }
    },

    // Alternar mute
    toggleMute: function () {
        this.isMuted = !this.isMuted;
        if (this.track) {
            this.track.muted = this.isMuted;
        }
        return this.isMuted;
    },

    // Establecer volumen (0.0 - 1.0)
    setVolume: function (value) {
        this.volume = Math.max(0, Math.min(1, value));
        if (this.track) {
            this.track.volume = this.volume;
        }
    },

    // Obtener volumen actual
    getVolume: function () {
        return this.volume;
    }
};

// Inicializar música al cargar el módulo
music.init();
