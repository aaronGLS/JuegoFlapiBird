/**
 * UI.JS - Sistema de Sonidos e Interacción de Interfaz
 * Maneja los eventos de hover y click para todos los elementos interactivos.
 */
import { sfx } from './audio.js';

/**
 * Inicializa los sonidos de la interfaz
 * Busca todos los botones y elementos interactivos y les asigna sonidos.
 */
export function initUISounds() {
    // Selector para todos los elementos interactivos
    // Incluye botones, inputs (como el slider) y cualquier elemento con clase .btn-icon o .interactive
    const interactiveElements = document.querySelectorAll('button, input, .btn-icon, .interactive, a');

    interactiveElements.forEach(el => {
        // Sonido de HOVER
        // Solo aplicar si el dispositivo soporta hover real (evita que suene al tocar en móvil)
        if (window.matchMedia('(hover: hover)').matches) {
            el.addEventListener('mouseenter', () => {
                // Solo sonar si el elemento no está deshabilitado
                if (!el.disabled) {
                    sfx.playUiHover();
                }
            });
        }

        // Sonido de CLICK
        // Usamos 'pointerdown' para mejor respuesta tanto en mouse como touch,
        // pero debemos tener cuidado de no duplicar con la lógica del juego.
        // Dado que game.js ya maneja lógica compleja, aquí solo añadiremos efectos puramente visuales/sonoros
        // si no interfieren. 

        // Estrategia: Usar 'click' es seguro porque siempre se dispara, aunque con delay en móvil.
        // Si queremos respuesta inmediata en móvil, 'touchstart' es mejor.

        // Vamos a usar una lógica simple:
        // Si ya tiene manejo en game.js, quizás estemos duplicando.
        // Pero game.js ejecuta LÓGICA. Aquí queremos SONIDO UI global.

        // Para evitar conflictos con game.js (que podría detener propagación), 
        // usaremos la fase de captura o nos aseguraremos de ser pasivos.
        // Sin embargo, sfx.playUiClick() es inofensivo.

        el.addEventListener('click', (e) => {
            // Solo sonar si no está deshabilitado
            if (!el.disabled) {
                sfx.playUiClick();
            }
        });
    });

    console.log(`🔊 UI Sounds inicializados en ${interactiveElements.length} elementos.`);
}