import { state } from '../core/State.js';
import { getRandomHazard } from '../data/hazards.js';
import { getUpgradeEffect } from './UpgradeSystem.js';
import { getActiveEffect } from './PositionTracker.js';
import { clamp } from '../utils/math.js';
import { SFX } from './AudioManager.js';

// ---- DOM ----
const hazardBtn   = document.getElementById("hazard-btn");
const hazardIcon  = document.getElementById("hazard-icon");
const hazardName  = document.getElementById("hazard-name");
const hazardTimer = document.getElementById("hazard-timer");

// ---- MODULE STATE ----
let currentHazard = null;
let hazardTimeLeft = 0;
let nextHazardIn = 0;

// ---- CONFIG ----
const BASE_SPAWN_CHANCE  = 0.35;   // 35% per spawn tick, before modifiers
const SPAWN_INTERVAL_MIN = 3.0;    // real seconds between spawn attempts
const SPAWN_INTERVAL_MAX = 6.0;

/**
 * Effective spawn chance — applies upgrade and position modifiers.
 */
function getSpawnChance() {
    const upgradeReduction = getUpgradeEffect("hazardChanceReduction");
    const positionMult = getActiveEffect("hazardChanceMultiplier");

    let chance = BASE_SPAWN_CHANCE * (1 - upgradeReduction);
    if (positionMult !== null) chance *= positionMult;
    return Math.min(chance, 1.0);
}

/**
 * Start a fresh hazard cycle. Call on new delivery / shift reset.
 */
export function resetHazards() {
    currentHazard = null;
    hazardTimeLeft = 0;
    nextHazardIn = 2.5 + Math.random() * 2.0;  // first hazard can't fire instantly
    hideHazardUI();
}

/**
 * Player tapped the hazard — dodge it.
 */
function dodgeHazard() {
    if (!currentHazard) return;

    // Success!
    currentHazard = null;
    hazardTimeLeft = 0;
    hideHazardUI();

    // Small reward: push next hazard back a bit
    nextHazardIn = SPAWN_INTERVAL_MIN + Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN);
}

/**
 * Spawn a hazard on the UI.
 */
function spawnHazard() {
    currentHazard = getRandomHazard();
    hazardTimeLeft = currentHazard.reactionWindow;

    hazardIcon.textContent = currentHazard.emoji;
    hazardName.textContent = currentHazard.name;
    hazardTimer.textContent = `${hazardTimeLeft.toFixed(1)}s`;
    hazardBtn.classList.remove("hidden");
    hazardBtn.classList.add("pulsing");

    // SFX for danger arrival
    SFX.carHorn();  // fallback-friendly; if audio missing, silent
}

/**
 * Hazard wasn't dodged in time — apply penalties.
 */
function resolveHazardHit() {
    if (!currentHazard) return;

    const h = currentHazard;

    // Push the delivery timer forward (makes food go cold faster)
    if (state.currentDelivery && h.timePenalty) {
        state.currentDelivery.timeLeft -= h.timePenalty;
    }

    // Direct rating hit
    if (h.ratingPenalty) {
        state.rating = clamp(state.rating - h.ratingPenalty, 0, 5);
        state.currentShiftWasPerfect = false;
    }

    // Log for streak (used later by positions)
    state.streakStats.hazardsHit = (state.streakStats.hazardsHit || 0) + 1;

    currentHazard = null;
    hazardTimeLeft = 0;
    hideHazardUI();

    // Reset spawn clock
    nextHazardIn = SPAWN_INTERVAL_MIN + Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN);
}

function hideHazardUI() {
    hazardBtn.classList.add("hidden");
    hazardBtn.classList.remove("pulsing");
}

/**
 * Per-frame update. Only runs while a delivery is active.
 */
export function updateHazardSystem(deltaTime) {
    if (!state.currentDelivery) return;

    // ---- Active hazard: tick reaction window ----
    if (currentHazard) {
        hazardTimeLeft -= deltaTime;
        hazardTimer.textContent = `${Math.max(hazardTimeLeft, 0).toFixed(1)}s`;

        if (hazardTimeLeft <= 0) {
            resolveHazardHit();
        }
        return;
    }

    // ---- No hazard: count down to next spawn ----
    nextHazardIn -= deltaTime;
    if (nextHazardIn <= 0) {
        // Roll for spawn using effective chance
        if (Math.random() < getSpawnChance()) {
            spawnHazard();
        } else {
            // No spawn this tick — schedule another attempt
            nextHazardIn = SPAWN_INTERVAL_MIN + Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN);
        }
    }
}

// ---- Bind the button ----
hazardBtn.addEventListener("click", () => {
    if (currentHazard) dodgeHazard();
});