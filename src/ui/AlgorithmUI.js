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