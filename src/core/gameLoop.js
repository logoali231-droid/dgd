import { state } from './State.js';
import { CONFIG } from '../data/config.js';
import { clamp } from '../utils/math.js';
import { updateHUD } from '../ui/HUD.js';

let lastTimestamp = 0;
let animationId = null;

export function startGameLoop() {
    state.isPlaying = true;
    lastTimestamp = performance.now();
    animationId = requestAnimationFrame(tick);
}

export function stopGameLoop() {
    state.isPlaying = false;
    cancelAnimationFrame(animationId);
}

function tick(timestamp) {
    if (!state.isPlaying) return;

    const deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    state.energy -= CONFIG.BASE_ENERGY_DRAIN * deltaTime;
    state.energy = clamp(state.energy, 0, 100);

    state.battery -= CONFIG.BASE_BATTERY_DRAIN * deltaTime;
    state.battery = clamp(state.battery, 0, 100);

    state.shiftTimeRemaining -= deltaTime;
    updateHUD();
    if (state.energy <= 0 || state.battery <= 0 || state.shiftTimeRemaining <= 0) {
        console.log("DEACTIVATED");
        stopGameLoop();
        return;
    }

    animationId = requestAnimationFrame(tick);
}