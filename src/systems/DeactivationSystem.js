import {
  getActiveCondition,
  rollRandomEvent,
  getChoiceReason,
} from "../data/deathReasons.js";
import { triggerDeactivation } from "../ui/ScreenManager.js";
import { state, saveMeta, resetStreak } from "../core/State.js";

// Tracks which conditions are on cooldown after a survived roll
const conditionCooldowns = {};

export function checkDeactivationConditions(deltaTime) {
  if (!state.isPlaying) return null;

  // Decrement all cooldowns
  for (const id in conditionCooldowns) {
    conditionCooldowns[id] -= deltaTime;
    if (conditionCooldowns[id] <= 0) delete conditionCooldowns[id];
  }

  const reason = getActiveCondition(state);
  if (!reason) return null;

  // If this condition is on cooldown (we already survived it recently), skip
  if (conditionCooldowns[reason.id]) return null;

  const survival = state.survivalMap[reason.id] ?? reason.baseSurvival ?? 0;
  const roll = Math.random();

  if (roll < survival) {
    // Survived! Set a 5-second grace cooldown before it can fire again
    conditionCooldowns[reason.id] = 5.0;
    console.log(
      `[Survived] ${reason.id} (survival: ${(survival * 100).toFixed(0)}%)`,
    );
    return null;
  }

  // Failed the roll — deactivate
  applyDeactivation(reason);
  return reason;
}

export function rollRandomDeactivation() {
  if (!state.isPlaying) return null;
  const reason = rollRandomEvent(state.survivalMap);
  if (reason) {
    applyDeactivation(reason);
    return reason;
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

  // Survival chance grows each time you die to a reason
  const current = state.survivalMap[reason.id] ?? reason.baseSurvival ?? 0;
  const growth = reason.growthPerDeath ?? 0.1;
  const cap = reason.maxSurvival ?? 1.0;
  state.survivalMap[reason.id] = Math.min(current + growth, cap);

  // Log to encyclopedia
  if (!state.logbookEntries.includes(reason.id)) {
    state.logbookEntries.push(reason.id);
  }

  saveMeta();
  triggerDeactivation(reason);
  // Wipe the streak — earned positions are lost forever
  resetStreak();
}
