/**
 * INPUT - Manejadores de entrada del juego
 */
import { state } from './state.js';

export function setupInput(canvas, bird, startScreen, scoreHud, resetGameCallback) {

    function inputHandler(e) {
        if (e.type === 'touchstart' || e.type === 'keydown') {
            // e.preventDefault(); // Opcional
        }

        if (e.type === 'keydown' && e.code !== 'Space' && e.code !== 'ArrowUp') return;

        switch (state.current) {
            case state.getReady:
                state.current = state.game;
                startScreen.classList.add('opacity-0');
                scoreHud.classList.remove('hidden');
                bird.flap();
                break;

            case state.game:
                bird.flap();
                break;

            case state.over:
                // Bloqueado hasta usar el botón de reinicio
                break;
        }
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        bird.x = canvas.width * 0.3;
    }

    // Configurar event listeners
    window.addEventListener('keydown', inputHandler);
    window.addEventListener('mousedown', inputHandler);
    window.addEventListener('touchstart', (e) => inputHandler(e), { passive: false });
    window.addEventListener('resize', resizeCanvas);

    // Inicializar tamaño del canvas
    resizeCanvas();

    return {
        inputHandler,
        resizeCanvas
    };
}
