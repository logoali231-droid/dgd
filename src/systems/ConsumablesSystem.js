import { state, saveMeta } from '../core/State.js';
import { getConsumableById } from '../data/consumables.js';
import { getMaxEnergy, getMaxBattery } from './UpgradeSystem.js';
import { clamp } from '../utils/math.js';

/**
 * Buy a consumable from the shop. Unlimited purchases, fixed price.
 * Adds to inventory count.
 */
export function buyConsumable(id) {
    const c = getConsumableById(id);
    if (!c) return false;
    if (state.savedTips < c.cost) return false;

    state.savedTips -= c.cost;
    if (id === "coffee")      state.coffeeCount += 1;
    if (id === "power_bank")  state.powerBankCount += 1;
    saveMeta();
    return true;
}

/**
 * Use a coffee mid-shift. Only once per shift, requires inventory.
 */
export function useCoffee() {
    if (state.shiftCoffeeUsed) return { ok: false, reason: "already-used" };
    if (state.coffeeCount <= 0) return { ok: false, reason: "no-stock" };

    state.coffeeCount -= 1;
    state.shiftCoffeeUsed = true;
    state.energy = clamp(state.energy + 25, 0, getMaxEnergy());
    saveMeta();
    return { ok: true };
}

/**
 * Use a power bank mid-shift. Only once per shift, requires inventory.
 */
export function usePowerBank() {
    if (state.shiftPowerBankUsed) return { ok: false, reason: "already-used" };
    if (state.powerBankCount <= 0) return { ok: false, reason: "no-stock" };

    state.powerBankCount -= 1;
    state.shiftPowerBankUsed = true;
    state.battery = clamp(state.battery + 30, 0, getMaxBattery());
    saveMeta();
    return { ok: true };
}