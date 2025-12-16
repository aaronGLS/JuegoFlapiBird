/**
 * SISTEMA DE AUDIO
 * Usa los assets precargados desde loader.js
 * Implementación de 'cloneNode' para permitir sonidos simultáneos.
 */
import { preloadedAssets } from './loader.js';

export const sfx = {
    // Método para reproducir efectos de sonido precargados
    play: function (soundName) {
        const preloadedSound = preloadedAssets.sfx[soundName];
        if (preloadedSound) {
            // Clonar el nodo permite reproducir el mismo sonido múltiples veces solapadas
            // Es crítico para el sonido "wing" cuando se pulsa rápido
            const sound = preloadedSound.cloneNode();
            sound.volume = 0.5; // Volumen al 50% para no saturar
            sound.play().catch(e => console.log("Audio play blocked (user interaction needed first)"));
        }
    }
};

/**
 * SISTEMA DE MÚSICA DE FONDO
 * Usa el audio precargado desde loader.js
 */
export const music = {
    track: null,
    isPlaying: false,
    volume: 0.3,
    isMuted: false,

    // Inicializar con la música precargada
    init: function () {
        this.track = preloadedAssets.music;
        if (this.track) {
            this.track.loop = true;
            this.track.volume = this.volume;
        }
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

// Nota: music.init() se llamará después de que preloadAssets() complete
