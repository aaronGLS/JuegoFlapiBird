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

export const sfx = {
    wing: new Audio(SFX_URLS.wing),
    point: new Audio(SFX_URLS.point),
    hit: new Audio(SFX_URLS.hit),
    die: new Audio(SFX_URLS.die),
    swooshing: new Audio(SFX_URLS.swooshing),
    
    // Método para reproducir sin esperar a que termine el sonido anterior
    play: function(soundName) {
        if (this[soundName]) {
            // Clonar el nodo permite reproducir el mismo sonido múltiples veces solapadas
            // Es crítico para el sonido "wing" cuando se pulsa rápido
            const sound = this[soundName].cloneNode();
            sound.volume = 0.5; // Volumen al 50% para no saturar
            sound.play().catch(e => console.log("Audio play blocked (user interaction needed first)"));
        }
    }
};
