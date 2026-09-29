import { state } from './State.js';
import { CONFIG } from '../data/config.js';
import { clamp } from '../utils/math.js';
import { updateHUD } from '../ui/HUD.js';
import { updateOrderManager } from '../systems/OrderManager.js';
import { updateDialogueSystem } from '../systems/DialogueSystem.js';
import { checkDeactivationConditions, rollRandomDeactivation } from '../systems/DeactivationSystem.js';
import { updatePositions, recordShiftComplete } from '../systems/PositionTracker.js';
import { showStart } from '../ui/ScreenManager.js';

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

    state.shiftElapsedRealSeconds += deltaTime;
    state.shiftTimeRemaining -= deltaTime * CONFIG.TIME_SCALE;

    state.energy -= CONFIG.BASE_ENERGY_DRAIN * deltaTime;
    state.energy = clamp(state.energy, 0, 100);
    state.battery -= CONFIG.BASE_BATTERY_DRAIN * deltaTime;
    state.battery = clamp(state.battery, 0, 100);

    updateHUD();
    updateOrderManager(deltaTime);
    updateDialogueSystem(deltaTime);
    updatePositions();

    if (checkDeactivationConditions(deltaTime)) return;

    state.randomRollTimer -= deltaTime;
    if (state.randomRollTimer <= 0) {
        state.randomRollTimer = 2.0;
        if (rollRandomDeactivation()) return;
    }

    if (state.shiftTimeRemaining <= 0) {
        recordShiftComplete();
        stopGameLoop();
        return;
    }

    animationId = requestAnimationFrame(tick);
}