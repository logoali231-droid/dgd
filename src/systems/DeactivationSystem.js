import { state, saveMeta, resetStreak } from "../core/State.js";
import { CONFIG } from "../data/config.js";
import {
  DEATH_REASONS,
  pickRandomEvent,
  getChoiceReason,
  getReasonById,
} from "../data/deathReasons.js";
import { triggerDeactivation } from "../ui/ScreenManager.js";
import { showEventToast } from "../ui/AlgorithmUI.js";
import { SFX, MUSIC } from "./AudioManager.js";
import { shakeScreen } from "../utils/screenShake.js";
import { clamp } from "../utils/math.js";
import { getMaxEnergy, getMaxBattery } from "./UpgradeSystem.js";
import { getRandomEventInterval } from "../data/difficultyScaling.js";

// Per-condition cooldown, so a violated line can't be re-rolled every frame.
const conditionCooldowns = {};

// Collapse grace: how long you've been sitting at 0 energy / 0 battery.
// Gives you a window to reach for a coffee instead of an instant death.
let collapseTimers = { energy: 0, battery: 0 };

// The Algorithm's own event timer.
let eventTimer = 0;

export function resetDeactivationSystem() {
  for (const id in conditionCooldowns) delete conditionCooldowns[id];
  collapseTimers = { energy: 0, battery: 0 };
  eventTimer = CONFIG.RANDOM_EVENT_GRACE;
}

function tickCooldowns(deltaTime) {
  for (const id in conditionCooldowns) {
    conditionCooldowns[id] -= deltaTime;
    if (conditionCooldowns[id] <= 0) delete conditionCooldowns[id];
  }
}

/**
 * Tracks how long energy/battery have been pinned at zero, so the
 * "you collapsed" conditions only fire after a grace window.
 */
function tickCollapse(deltaTime) {
  collapseTimers.energy = state.energy <= 0
    ? collapseTimers.energy + deltaTime
    : 0;
  collapseTimers.battery = state.battery <= 0
    ? collapseTimers.battery + deltaTime
    : 0;
}

function conditionIsActiveNow(reason) {
  if (reason.id === "energy_zero_before_shift") {
    return collapseTimers.energy >= CONFIG.COLLAPSE_GRACE_SECONDS;
  }
  if (reason.id === "battery_zero_before_shift") {
    return collapseTimers.battery >= CONFIG.COLLAPSE_GRACE_SECONDS;
  }
  return reason.condition(state);
}

/**
 * Called every frame. Looks for a stat that has crossed a line and rolls
 * the player's survival chance against that specific reason ONCE, then
 * puts the reason on cooldown whether they lived or died to it.
 */
export function checkDeactivationConditions(deltaTime) {
  if (!state.isPlaying) return null;

  tickCooldowns(deltaTime);
  tickCollapse(deltaTime);

  const candidates = [];
  for (const reason of DEATH_REASONS) {
    if (reason.type !== "condition") continue;
    if (!conditionIsActiveNow(reason)) continue;
    candidates.push(reason);
  }
  if (candidates.length === 0) return null;

  // Always evaluate the same reason first while it's on cooldown, so a
  // violation you survived isn't silently swapped for a fresh roll.
  for (const reason of candidates) {
    if (conditionCooldowns[reason.id]) continue;

    const survival = state.survivalMap[reason.id] ?? reason.baseSurvival ?? 0;
    const roll = Math.random();

    if (roll < survival) {
      conditionCooldowns[reason.id] = 5.0;
      console.log(
        `[Survived] ${reason.id} (survival: ${(survival * 100).toFixed(0)}%)`,
      );
      return null;
    }

    applyDeactivation(reason);
    return reason;
  }

  return null;
}

/**
 * The Algorithm's periodic penalty events. These hurt, but only finish you
 * off when they catch you already at zero.
 */
export function runTimedEvents(deltaTime) {
  if (!state.isPlaying) return null;

  eventTimer -= deltaTime;
  if (eventTimer > 0) return null;

  eventTimer = getRandomEventInterval(state.shiftsSurvived);
  return fireRandomEvent();
}

export function fireRandomEvent() {
  const event = pickRandomEvent(state.shiftsSurvived);
  if (!event) return null;

  // ---- Apply the hit ----
  const fx = event.effects || {};
  if (fx.rating) state.rating = clamp(state.rating + fx.rating, 0, 5);
  if (fx.energy) state.energy = clamp(state.energy + fx.energy, 0, getMaxEnergy());
  if (fx.battery) state.battery = clamp(state.battery + fx.battery, 0, getMaxBattery());
  if (fx.cash) state.cash = Math.max(0, state.cash + fx.cash);

  if (fx.rating < 0) state.currentShiftWasPerfect = false;

  SFX.algorithmAlert();
  shakeScreen(1, 220);
  showEventToast(event.surviveText, "penalty");

  // ---- Does it finish you off? ----
  const lethal = typeof event.killWhen === "function" && event.killWhen(state);
  if (lethal && event.deathId) {
    const reason = getReasonById(event.deathId);
    if (reason) {
      applyDeactivation(reason);
      return reason;
    }
  }

  return null;
}

export function triggerChoiceDeactivation(reasonId) {
  if (!state.isPlaying) return null;
  const reason = getChoiceReason(reasonId);
  if (reason) {
    applyDeactivation(reason);
    return reason;
  }
  return null;
}

function applyDeactivation(reason) {
  state.isPlaying = false;

  // Survival chance grows with each death to this reason
  const current = state.survivalMap[reason.id] ?? reason.baseSurvival ?? 0;
  const growth = reason.growthPerDeath ?? 0.1;
  const cap = reason.maxSurvival ?? 1.0;
  state.survivalMap[reason.id] = Math.min(current + growth, cap);

  // Log the reason
  if (!state.logbookEntries.includes(reason.id)) {
    state.logbookEntries.push(reason.id);
  }

  // Convert 10% of this run's cash into permanent Saved Tips
  const tips = Math.floor(state.cash * 0.1);
  state.savedTips += tips;
  console.log(`[Run Ended] Earned $${state.cash}, saved $${tips} in tips.`);

  // Track best rating
  if (state.rating > state.bestRating) state.bestRating = state.rating;
  state.lastDeathReason = reason.id;
  saveMeta();
  SFX.deactivationBuzz();
  MUSIC.gameOver();
  shakeScreen(3, 400);
  triggerDeactivation(reason);
  resetStreak();
}

