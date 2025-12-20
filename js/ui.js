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

        // Sonido de CLICK (usando pointerdown para respuesta inmediata y soporte móvil universal)
        // 'pointerdown' se dispara antes que mousedown/touchstart y no es bloqueado por preventDefault() en touchend.
        // Esto garantiza que el sonido suene siempre al interactuar, tanto en PC como en Móvil.
        el.addEventListener('pointerdown', (e) => {
            // Solo sonar si no está deshabilitado
            if (!el.disabled) {
                // Pequeña validación: si es touch, asegurarnos que no sea un scroll (aunque pointerdown suele ser intencional)
                sfx.playUiClick();
            }
        });
    });

    console.log(`🔊 UI Sounds inicializados en ${interactiveElements.length} elementos.`);
}