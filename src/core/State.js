import { CONFIG } from '../data/config.js';
import { Persistence } from './Persistence.js';
import { buildDefaultSurvivalMap } from '../data/deathReasons.js';

const save = Persistence.load();
const defaultSurvival = buildDefaultSurvivalMap();

export const state = {
    // Run stats
    isPlaying: false,
    rating: CONFIG.DEFAULT_RATING,
    energy: CONFIG.DEFAULT_ENERGY,
    battery: CONFIG.DEFAULT_BATTERY,
    cash: CONFIG.DEFAULT_CASH,
    shiftTimeRemaining: CONFIG.DEFAULT_SHIFT_TIME,

    // Per-shift counters
    deliveriesThisShift: 0,
    shiftElapsedRealSeconds: 0,
    currentDelivery: null,
    lastDelivery: null,
    randomRollTimer: 2.0,
    currentShiftWasPerfect: true,

    // Consumables — once per shift
    shiftCoffeeUsed: false,
    shiftPowerBankUsed: false,

    // Boost — once per delivery
    boostActive: false,
    boostTimeLeft: 0,
    boostUsedThisDelivery: false,

    // Streak layer
    streakStats: {
        deliveries: 0,
        perfectShifts: 0,
        ordersDeclined: 0,
        dialoguesIgnored: 0,
        dialoguesAnswered: 0,
        compliance: 0,
        defiance: 0,
        care: 0,
        efficiency: 0
    },
    earnedPositions: [],
    shiftsSurvived: 0,

    // Permanent meta layer
    discoveredPositions: save.discoveredPositions || [],
    logbookEntries: save.logbookEntries,
    savedTips: save.savedTips,
    ownedUpgrades: save.ownedUpgrades,
    coffeeCount: save.coffeeCount || 0,
    powerBankCount: save.powerBankCount || 0,
    totalShiftsSurvived: save.totalShiftsSurvived,
    bestRating: save.bestRating,
    survivalMap: { ...defaultSurvival, ...(save.survivalMap || {}) }
};

export function saveMeta() {
    Persistence.save({
        savedTips: state.savedTips,
        ownedUpgrades: state.ownedUpgrades,
        coffeeCount: state.coffeeCount,
        powerBankCount: state.powerBankCount,
        logbookEntries: state.logbookEntries,
        totalShiftsSurvived: state.totalShiftsSurvived,
        bestRating: state.bestRating,
        survivalMap: state.survivalMap,
        discoveredPositions: state.discoveredPositions
    });
}

export function resetStreak() {
    state.streakStats = {
        deliveries: 0,
        perfectShifts: 0,
        ordersDeclined: 0,
        dialoguesIgnored: 0,
        dialoguesAnswered: 0,
        compliance: 0,
        defiance: 0,
        care: 0,
        efficiency: 0
    };
    state.earnedPositions = [];
    state.shiftsSurvived = 0;
}

export function resetShiftCounters() {
    state.deliveriesThisShift = 0;
    state.shiftElapsedRealSeconds = 0;
    state.currentDelivery = null;
    state.currentShiftWasPerfect = true;
    state.shiftCoffeeUsed = false;
    state.shiftPowerBankUsed = false;
    state.boostActive = false;
    state.boostTimeLeft = 0;
    state.boostUsedThisDelivery = false;
}

/**
 * Called between shifts in a streak.
 * Resets run-stats but KEEPS cash, streak stats, earned positions.
 */
export function resetShiftForStreak() {
    const maxEnergy = 100; // gets overridden by resetRun if upgrades exist
    state.rating = 5.0;
    // Note: energy/battery/shift time get set by resetRun in UpgradeSystem
    state.deliveriesThisShift = 0;
    state.shiftElapsedRealSeconds = 0;
    state.currentDelivery = null;
    state.lastDelivery = null;
    state.currentShiftWasPerfect = true;
    state.randomRollTimer = 2.0;
    state.shiftCoffeeUsed = false;
    state.shiftPowerBankUsed = false;
    state.boostActive = false;
    state.boostTimeLeft = 0;
    state.boostUsedThisDelivery = false;
}