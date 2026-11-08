import { state } from '../core/State.js';
import { pickAlgorithmMessage } from '../data/algorithmMessages.js';

const shiftMsgEl = document.getElementById("algorithm-message-shift");
const deathMsgEl = document.getElementById("algorithm-message-death");

/**
 * Render a message on the Shift Complete screen.
 */
export function renderShiftAlgorithmMessage() {
    if (!shiftMsgEl) return;
    const msg = pickAlgorithmMessage("after_shift", state.shiftsSurvived);
    shiftMsgEl.textContent = `🤖 ${msg.text}`;
}

/**
 * Render a message on the Deactivated screen.
 */
export function renderDeathAlgorithmMessage() {
    if (!deathMsgEl) return;
    const msg = pickAlgorithmMessage("after_death", state.shiftsSurvived);
    deathMsgEl.textContent = `🤖 ${msg.text}`;
}

// ---- Live event toast (the Algorithm interrupting your shift) ----
let toastTimer = null;

/**
 * Flash a short message at the top of the game area.
 * kind: "penalty" | "info" | "good"
 */
export function showEventToast(text, kind = "info", durationMs = 3200) {
    const host = document.getElementById("game-area");
    if (!host) return;

    let toast = document.getElementById("event-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "event-toast";
        host.prepend(toast);
    }

    toast.className = `event-toast ${kind}`;
    toast.textContent = `🤖 ${text}`;
    toast.classList.remove("hidden");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.add("hidden");
    }, durationMs);
}
