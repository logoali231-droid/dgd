import { state, saveMeta } from '../core/State.js';
import { CONFIG } from '../data/config.js';
import { UPGRADES, getUpgradeById } from '../data/upgrades.js';
import { state, resetShiftForStreak } from '../core/State.js';  // add resetShiftForStreak

/**
 * Start a new shift WITHIN a streak. Keeps cash, streak, positions.
 * Resets energy/battery/time to max, respects upgrades.
 */
export function startNextShift() {
    resetShiftForStreak();

    const maxEnergy = getMaxEnergy();
    const maxBattery = getMaxBattery();
    const bonusEnergy = getUpgradeEffect("startEnergy");
    const bonusBattery = getUpgradeEffect("startBattery");

    state.energy = Math.min(maxEnergy, 100 + bonusEnergy);
    state.battery = Math.min(maxBattery, 100 + bonusBattery);
    state.shiftTimeRemaining = CONFIG.DEFAULT_SHIFT_TIME;
    state.isPlaying = false;
}

export function getUpgradeEffect(key) {
    let total = 0;
    for (const id of state.ownedUpgrades) {
        const up = getUpgradeById(id);
        if (!up || !up.effects) continue;
        const v = up.effects[key];
        if (typeof v === "number") total += v;
    }
    if (key.endsWith("Reduction") || key === "cashMultiplierBonus") {
        return Math.min(total, 1.0);
    }
    return total;
}

export function getMaxEnergy() {
    return 100 + getUpgradeEffect("energyMax");
}

export function getMaxBattery() {
    return 100 + getUpgradeEffect("batteryMax");
}

export function hasUpgrade(id) {
    return state.ownedUpgrades.includes(id);
}

export function purchaseUpgrade(id) {
    const up = getUpgradeById(id);
    if (!up) return false;
    if (state.ownedUpgrades.includes(id)) return false;
    if (state.savedTips < up.cost) return false;

    state.savedTips -= up.cost;
    state.ownedUpgrades.push(id);
    saveMeta();
    return true;
}

/**
 * Reset run stats, applying starting bonuses from owned upgrades.
 * Called by main.js before each new shift.
 */
export function resetRun() {
    const maxEnergy = getMaxEnergy();
    const maxBattery = getMaxBattery();
    const bonusEnergy = getUpgradeEffect("startEnergy");
    const bonusBattery = getUpgradeEffect("startBattery");

    state.rating = CONFIG.DEFAULT_RATING;
    state.energy = Math.min(maxEnergy, 100 + bonusEnergy);
    state.battery = Math.min(maxBattery, 100 + bonusBattery);
    state.cash = CONFIG.DEFAULT_CASH;
    state.shiftTimeRemaining = CONFIG.DEFAULT_SHIFT_TIME;

    state.deliveriesThisShift = 0;
    state.shiftElapsedRealSeconds = 0;
    state.currentDelivery = null;
    state.lastDelivery = null;
    state.currentShiftWasPerfect = true;
    state.randomRollTimer = 2.0;
    state.isPlaying = false;

    // Consumable usage resets every shift
    state.shiftCoffeeUsed = false;
    state.shiftPowerBankUsed = false;
}