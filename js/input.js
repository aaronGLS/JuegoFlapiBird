/**
 * INPUT - Manejadores de entrada del juego
 */
import { state, isPaused } from './state.js';

export function setupInput(canvas, bird, startScreen, scoreHud, resetGameCallback, handlePauseCallback) {

    // Referencia al botón de pausa para mostrarlo al iniciar
    const pauseBtn = document.getElementById('pause-btn');

    // Flag para prevenir eventos duplicados en móvil
    // Cuando se dispara touchstart, el navegador también emite mousedown
    let lastTouchTime = 0;

    function inputHandler(e) {
        // Prevenir eventos duplicados en móvil
        // Si es mousedown y hubo un touch reciente (< 500ms), ignorar
        if (e.type === 'mousedown') {
            const now = Date.now();
            if (now - lastTouchTime < 500) {
                return; // Ignorar mousedown duplicado después de touch
            }
        }

        // Registrar tiempo del touch
        if (e.type === 'touchstart') {
            lastTouchTime = Date.now();
            // Solo prevenir default si el touch está en el canvas/game-container
            // Esto evita bloquear clicks en botones UI
            const targetId = e.target.id;
            if (e.target.tagName === 'CANVAS' || targetId === 'game-container') {
                e.preventDefault();
            }
        }

        // Ignorar inputs si está pausado (excepto Escape)
        if (isPaused() && e.type !== 'keydown') return;

        // Manejar tecla Escape para pausa
        if (e.type === 'keydown' && e.code === 'Escape') {
            if (handlePauseCallback) {
                handlePauseCallback();
            }
            return;
        }

        if (e.type === 'keydown' && e.code !== 'Space' && e.code !== 'ArrowUp') return;

        // Ignorar si está pausado
        if (isPaused()) return;

        switch (state.current) {
            case state.getReady:
                state.current = state.game;
                startScreen.classList.add('opacity-0');
                scoreHud.classList.remove('hidden');
                if (pauseBtn) pauseBtn.classList.remove('hidden');
                bird.flap();

                // Importar y llamar startMusic dinámicamente
                import('./game.js').then(module => {
                    if (module.startMusic) {
                        module.startMusic();
                    }
                });
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
    window.addEventListener('touchstart', inputHandler, { passive: false });
    window.addEventListener('resize', resizeCanvas);

    // Inicializar tamaño del canvas
    resizeCanvas();

    return {
        inputHandler,
        resizeCanvas
    };
}

