import { state } from "./State.js";
import { CONFIG } from "../data/config.js";
import { clamp } from "../utils/math.js";
import { updateHUD } from "../ui/HUD.js";
import { updateOrderManager } from "../systems/OrderManager.js";
import { updateDialogueSystem } from "../systems/DialogueSystem.js";
import {
  checkDeactivationConditions,
  runTimedEvents,
  resetDeactivationSystem,
} from "../systems/DeactivationSystem.js";
import {
  updatePositions,
  recordShiftComplete,
  getActiveEffect,
} from "../systems/PositionTracker.js";
import {
  getMaxEnergy,
  getMaxBattery,
  getUpgradeEffect,
} from "../systems/UpgradeSystem.js";
import { showShiftComplete } from "../ui/ScreenManager.js";
import { renderShiftComplete } from "../ui/ShiftCompleteUI.js";
import { getPhaseForTime } from "../data/shiftPhases.js";
import { MUSIC, stopMusic } from "../systems/AudioManager.js";

let lastTimestamp = 0;
let animationId = null;
let lastMusicPhase = null;

export function startGameLoop() {
  state.isPlaying = true;
  lastTimestamp = performance.now();
  resetDeactivationSystem();
  lastMusicPhase = null;
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
  // Compute current shift phase
  const shiftElapsedGameSeconds =
    CONFIG.DEFAULT_SHIFT_TIME - state.shiftTimeRemaining;
  state.currentPhase = getPhaseForTime(shiftElapsedGameSeconds);
  state.shiftTimeRemaining -= deltaTime * CONFIG.TIME_SCALE;

  // ---- Phase-driven music ----
  if (state.currentPhase && state.currentPhase.id !== lastMusicPhase) {
    lastMusicPhase = state.currentPhase.id;
    const tense = ["lunch_surge", "dinner_chaos", "late_night"].includes(
      state.currentPhase.id,
    );
    if (tense) MUSIC.tension();
    else MUSIC.lofi();
  }

  // ---- Upgrade-aware drain ----
  const maxEnergy = getMaxEnergy();
  const maxBattery = getMaxBattery();
  const energyDrainMult = 1 - getUpgradeEffect("energyDrainReduction");
  const batteryDrainMult = 1 - getUpgradeEffect("batteryDrainReduction");

  // Position effects can also scale drain (e.g. Free Rider, Iron Courier).
  const posEnergyMult = getActiveEffect("energyDrainMultiplier");
  const posEnergyFactor = posEnergyMult !== null ? posEnergyMult : 1;

  state.energy -= CONFIG.BASE_ENERGY_DRAIN * energyDrainMult * posEnergyFactor * deltaTime;
  state.energy = clamp(state.energy, 0, maxEnergy);
  state.battery -= CONFIG.BASE_BATTERY_DRAIN * batteryDrainMult * deltaTime;
  state.battery = clamp(state.battery, 0, maxBattery);

  updateHUD();
  updateOrderManager(deltaTime);
  updateDialogueSystem(deltaTime);
  updatePositions();

  if (checkDeactivationConditions(deltaTime)) return;
  if (runTimedEvents(deltaTime)) return;

  if (state.shiftTimeRemaining <= 0) {
    recordShiftComplete();
    stopGameLoop();
    stopMusic();
    renderShiftComplete();
    showShiftComplete();
    return;
  }

  animationId = requestAnimationFrame(tick);
}
