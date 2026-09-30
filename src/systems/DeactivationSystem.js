import { state, saveMeta, resetStreak } from "../core/State.js";
import {
  getActiveCondition,
  rollRandomEvent,
  getChoiceReason,
} from "../data/deathReasons.js";
import { triggerDeactivation } from "../ui/ScreenManager.js";
import { SFX, MUSIC } from "./AudioManager.js";

const conditionCooldowns = {};

export function checkDeactivationConditions(deltaTime) {
  if (!state.isPlaying) return null;

  for (const id in conditionCooldowns) {
    conditionCooldowns[id] -= deltaTime;
    if (conditionCooldowns[id] <= 0) delete conditionCooldowns[id];
  }

  const reason = getActiveCondition(state);
  if (!reason) return null;
  if (conditionCooldowns[reason.id]) return null;

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

  saveMeta();
  SFX.deactivationBuzz();
  MUSIC.gameOver();
  triggerDeactivation(reason);
  resetStreak();
}
