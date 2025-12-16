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
    gainNode: null,
    isPlaying: false,
    volume: 0.3,
    isMuted: false,

    // Para trackear el tiempo de reproducción
    startTime: 0,      // Cuando empezó a reproducir (en tiempo del audioCtx)
    pausedAt: 0,       // Offset en segundos donde se pausó

    init: function () {
        // Ya no necesitamos inicialización explícita compleja, 
        // los buffers están en preloadedAssets.music
    },

    /**
     * Inicia la música desde un offset específico
     * @param {number} offset - Segundos desde donde empezar
     */
    _startFromOffset: function (offset = 0) {
        const buffer = preloadedAssets.music;
        if (!buffer) return;

        // Crear nuevo source
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        // Crear nodo de ganancia
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = this.isMuted ? 0 : this.volume;

        // Conectar
        source.connect(gainNode);
        gainNode.connect(masterGain);

        // Calcular offset considerando el loop
        const duration = buffer.duration;
        const normalizedOffset = offset % duration;

        // Iniciar desde el offset
        source.start(0, normalizedOffset);

        // Guardar referencias
        this.currentSource = source;
        this.gainNode = gainNode;
        this.startTime = audioCtx.currentTime - normalizedOffset;
        this.isPlaying = true;
    },

    play: function () {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        if (this.isPlaying) return;

        // Si hay un tiempo pausado, reanudar desde ahí
        if (this.pausedAt > 0) {
            this._startFromOffset(this.pausedAt);
        } else {
            this._startFromOffset(0);
        }
    },

    pause: function () {
        if (this.isPlaying && this.currentSource) {
            // Calcular el tiempo actual de reproducción
            const elapsed = audioCtx.currentTime - this.startTime;
            const buffer = preloadedAssets.music;
            if (buffer) {
                // Normalizar al loop
                this.pausedAt = elapsed % buffer.duration;
            }

            // Detener el source
            try {
                this.currentSource.stop();
            } catch (e) {
                // Ignorar si ya se detuvo
            }
            this.currentSource = null;
            this.gainNode = null;
            this.isPlaying = false;
        }
    },

    resume: function () {
        if (!this.isPlaying && this.pausedAt > 0) {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            this._startFromOffset(this.pausedAt);
        }
    },

    // Detener completamente y resetear posición
    stop: function () {
        if (this.currentSource) {
            try {
                this.currentSource.stop();
            } catch (e) {
                // Ignorar si ya se detuvo
            }
            this.currentSource = null;
            this.gainNode = null;
        }
        this.isPlaying = false;
        this.pausedAt = 0;  // Resetear posición
        this.startTime = 0;
    },

    restart: function () {
        this.stop();
        this.play();
    },

    toggleMute: function () {
        this.isMuted = !this.isMuted;
        if (this.gainNode) {
            this.gainNode.gain.value = this.isMuted ? 0 : this.volume;
        }
        return this.isMuted;
    },

    setVolume: function (value) {
        this.volume = Math.max(0, Math.min(1, value));
        if (this.gainNode && !this.isMuted) {
            this.gainNode.gain.value = this.volume;
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