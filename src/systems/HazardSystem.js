import { state } from '../core/State.js';
import { getRandomHazard } from '../data/hazards.js';
import { getUpgradeEffect } from './UpgradeSystem.js';
import { getActiveEffect } from './PositionTracker.js';
import { clamp } from '../utils/math.js';
import { SFX } from './AudioManager.js';
import { addBikeWear, WEAR_PER_HIT } from './OrderManager.js';
import { getHazardScaling } from '../data/difficultyScaling.js';

// ---- DOM ----
const hazardBanner  = document.getElementById("hazard-banner");
const hazardIcon    = document.getElementById("hazard-icon");
const hazardName    = document.getElementById("hazard-name");
const hazardTimer   = document.getElementById("hazard-timer");
const strikeBanner  = document.getElementById("strike-banner");

// ---- STATE ----
let currentHazard = null;
let hazardTimeLeft = 0;
let nextHazardIn = 0;
let nextRedLightIn = 0;
let redLightActive = false;
let redLightTimeLeft = 0;

// ---- CONFIG ----
const BASE_SPAWN_CHANCE  = 0.30;
const SPAWN_INTERVAL_MIN = 3.0;
const SPAWN_INTERVAL_MAX = 6.0;
const RED_LIGHT_INTERVAL_MIN = 8.0;
const RED_LIGHT_INTERVAL_MAX = 14.0;
const RED_LIGHT_WINDOW = 2.0;
const RED_LIGHT_MAX_STRIKES = 3;

function getSpawnChance() {
    const upgradeReduction = getUpgradeEffect("hazardChanceReduction");
    const positionMult = getActiveEffect("hazardChanceMultiplier");
    const streakMult = getHazardScaling(state.shiftsSurvived);
    const phaseMult = state.currentPhase ? state.currentPhase.hazardMultiplier : 1.0;

    let chance = BASE_SPAWN_CHANCE * (1 - upgradeReduction);
    if (positionMult !== null) chance *= positionMult;
    chance *= streakMult;
    chance *= phaseMult;
    return Math.min(chance, 1.0);
}

export function resetHazards() {
    currentHazard = null;
    hazardTimeLeft = 0;
    nextHazardIn = 2.5 + Math.random() * 2.0;
    redLightActive = false;
    redLightTimeLeft = 0;
    nextRedLightIn = RED_LIGHT_INTERVAL_MIN + Math.random() * (RED_LIGHT_INTERVAL_MAX - RED_LIGHT_INTERVAL_MIN);
    hideHazardBanner();
    hideStrikeBanner();
}

/**
 * Called by OrderManager when the player starts holding the pedal.
 * While holding during a hazard, they're at risk.
 */
export function notifyPedalHeld() {
    // If a hazard is active AND pedal is now held → they're now vulnerable.
    // No action needed — the hazard resolution checks pedalHeld at expiry.
}

/**
 * Called when the player releases the pedal. If a hazard is active, this
 * counts as a successful brake/dodge.
 */
export function notifyPedalReleased() {
    if (currentHazard) {
        dodgeHazard();
    }
    if (redLightActive && state.pedalHeld === false) {
        // Released during red light = safe
        endRedLight(false);
    }
}

function dodgeHazard() {
    if (!currentHazard) return;
    currentHazard = null;
    hazardTimeLeft = 0;
    hideHazardBanner();
    nextHazardIn = SPAWN_INTERVAL_MIN + Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN);
}

function spawnHazard() {
    currentHazard = getRandomHazard();
    hazardTimeLeft = currentHazard.reactionWindow;

    hazardIcon.textContent = currentHazard.emoji;
    hazardName.textContent = currentHazard.name;
    hazardTimer.textContent = `${hazardTimeLeft.toFixed(1)}s`;
    hazardBanner.classList.remove("hidden");
    SFX.carHorn();
}

/**
 * Hazard window expired. If the player was holding (or re-held) the pedal
 * at expiry, they hit it. If they released and stayed released, they dodged.
 */
function resolveHazardHit() {
    if (!currentHazard) return;
    const h = currentHazard;

    // If pedal is currently held → they didn't brake → HIT.
    if (state.pedalHeld) {
        if (state.currentDelivery && h.timePenalty) {
            state.currentDelivery.timeLeft -= h.timePenalty;
            // Knockback: lose progress
            state.currentDelivery.progress = Math.max(0, state.currentDelivery.progress - 3);
        }
        if (h.ratingPenalty) {
            state.rating = clamp(state.rating - h.ratingPenalty, 0, 5);
            state.currentShiftWasPerfect = false;
        }
        // Bike wear accumulates
        addBikeWear(WEAR_PER_HIT);
        state.streakStats.hazardsHit = (state.streakStats.hazardsHit || 0) + 1;
    }
    // If pedal wasn't held, no penalty (dodged via release)

    currentHazard = null;
    hazardTimeLeft = 0;
    hideHazardBanner();
    nextHazardIn = SPAWN_INTERVAL_MIN + Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN);
}

function hideHazardBanner() {
    hazardBanner.classList.add("hidden");
}

function hideStrikeBanner() {
    strikeBanner.classList.add("hidden");
}

// ---- RED LIGHT EVENTS ----
function startRedLight() {
    redLightActive = true;
    redLightTimeLeft = RED_LIGHT_WINDOW;
    strikeBanner.classList.remove("hidden");
    strikeBanner.textContent = "🚦 RED LIGHT — RELEASE PEDAL!";
}

function endRedLight(strike) {
    redLightActive = false;
    redLightTimeLeft = 0;
    hideStrikeBanner();

    if (strike) {
        state.redLightStrikes += 1;
        strikeBanner.textContent = `🚦 STRIKE ${state.redLightStrikes}/${RED_LIGHT_MAX_STRIKES}`;
        strikeBanner.classList.remove("hidden");
        setTimeout(() => strikeBanner.classList.add("hidden"), 1200);

        if (state.redLightStrikes >= RED_LIGHT_MAX_STRIKES) {
            // Trigger a special death — handled by DeactivationSystem condition
            // We just set a flag; DeactivationSystem reads it.
            state.redLightStrikes = RED_LIGHT_MAX_STRIKES;
        }
    }

    nextRedLightIn = RED_LIGHT_INTERVAL_MIN + Math.random() * (RED_LIGHT_INTERVAL_MAX - RED_LIGHT_INTERVAL_MIN);
}

// ---- UPDATE ----
export function updateHazardSystem(deltaTime) {
    if (!state.currentDelivery) return;

    // ---- Red light timer ----
    if (redLightActive) {
        redLightTimeLeft -= deltaTime;
        strikeBanner.textContent = `🚦 RED LIGHT — ${Math.max(redLightTimeLeft, 0).toFixed(1)}s`;
        if (redLightTimeLeft <= 0) {
            endRedLight(state.pedalHeld); // strike if still holding
        }
    } else {
        nextRedLightIn -= deltaTime;
        if (nextRedLightIn <= 0) startRedLight();
    }

    // ---- Hazard spawn / tick ----
    if (currentHazard) {
        hazardTimeLeft -= deltaTime;
        hazardTimer.textContent = `${Math.max(hazardTimeLeft, 0).toFixed(1)}s`;
        if (hazardTimeLeft <= 0) resolveHazardHit();
        return;
    }

    nextHazardIn -= deltaTime;
    if (nextHazardIn <= 0) {
        if (Math.random() < getSpawnChance()) spawnHazard();
        else nextHazardIn = SPAWN_INTERVAL_MIN + Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN);
    }
}