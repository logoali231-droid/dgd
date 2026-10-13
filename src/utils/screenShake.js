/**
 * Emulates device vibration using CSS shake on #game-container.
 * Respects the vibration setting in state.settings.vibrationOn.
 */

import { state } from '../core/State.js';

export function shakeScreen(intensity = 1, durationMs = 300) {
    if (!state.settings || !state.settings.vibrationOn) return;

    const el = document.getElementById("game-container");
    if (!el) return;

    el.classList.remove("shake-soft", "shake-medium", "shake-hard");
    void el.offsetWidth; // force reflow so animation restarts

    if (intensity >= 3)       el.classList.add("shake-hard");
    else if (intensity >= 2)  el.classList.add("shake-medium");
    else                      el.classList.add("shake-soft");

    setTimeout(() => {
        el.classList.remove("shake-soft", "shake-medium", "shake-hard");
    }, durationMs);
}