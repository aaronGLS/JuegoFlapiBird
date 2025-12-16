/**
 * SISTEMA DE AUDIO (WEB AUDIO API)
 * Usa AudioContext para reproducción sin latencia y soporte completo de superposición.
 */
import { preloadedAssets } from './loader.js';

// Crear el contexto de audio global
const AudioContext = window.AudioContext || window.webkitAudioContext;
export const audioCtx = new AudioContext();

// Ganancia maestra para control general de volumen si fuera necesario
const masterGain = audioCtx.createGain();
masterGain.connect(audioCtx.destination);
masterGain.gain.value = 1.0;

/**
 * Helper para reproducir un buffer de audio
 * @param {AudioBuffer} buffer - El buffer decodificado
 * @param {boolean} loop - Si debe repetirse
 * @param {number} volume - Volumen (0.0 - 1.0)
 * @returns {object} - Objeto con métodos stop y setVolume
 */
function playBuffer(buffer, loop = false, volume = 1.0) {
    if (!buffer) return null;

    // Crear fuente
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;

    // Crear nodo de ganancia para este sonido
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = volume;

    // Conectar: Fuente -> Ganancia -> Master -> Salida
    source.connect(gainNode);
    gainNode.connect(masterGain);

    // Iniciar reproducción
    source.start(0);

    return {
        source: source,
        gainNode: gainNode,
        stop: function () {
            try {
                source.stop();
            } catch (e) {
                // Ignorar error si ya se detuvo
            }
        },
        setVolume: function (val) {
            gainNode.gain.value = val;
        }
    };
}

export const sfx = {
    play: function (soundName) {
        // Resume context si está suspendido (requisito de navegadores)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const buffer = preloadedAssets.sfx[soundName];
        if (buffer) {
            // Reproducir sonido (fire and forget para SFX)
            playBuffer(buffer, false, 0.5);
        }
    }
};

export const music = {
    currentSource: null,
    isPlaying: false,
    volume: 0.3,
    isMuted: false,

    init: function () {
        // Ya no necesitamos inicialización explícita compleja, 
        // los buffers están en preloadedAssets.music
    },

    play: function () {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        if (this.isPlaying) return;

        const buffer = preloadedAssets.music;
        if (buffer) {
            this.currentSource = playBuffer(buffer, true, this.isMuted ? 0 : this.volume);
            this.isPlaying = true;
        }
    },

    pause: function () {
        if (this.isPlaying && this.currentSource) {
            this.currentSource.stop();
            this.currentSource = null;
            this.isPlaying = false;
        }
    },

    resume: function () {
        if (!this.isPlaying) {
            this.play();
        }
    },

    restart: function () {
        this.pause();
        this.play();
    },

    toggleMute: function () {
        this.isMuted = !this.isMuted;
        if (this.currentSource) {
            this.currentSource.setVolume(this.isMuted ? 0 : this.volume);
        }
        return this.isMuted;
    },

    setVolume: function (value) {
        this.volume = Math.max(0, Math.min(1, value));
        if (this.currentSource && !this.isMuted) {
            this.currentSource.setVolume(this.volume);
        }
    },

    getVolume: function () {
        return this.volume;
    }
};

/**
 * Función para desbloquear el AudioContext en la primera interacción del usuario
 */
export function resumeAudioContext() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            console.log('AudioContext resumed successfully');
        });
    }
}