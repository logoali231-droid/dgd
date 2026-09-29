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

    // Per-shift counters (reset each shift)
    deliveriesThisShift: 0,
    shiftElapsedRealSeconds: 0,
    currentDelivery: null,
    lastDelivery: null,
    randomRollTimer: 2.0,
    currentShiftWasPerfect: true,

    // Streak layer — persists across shifts but resets on deactivation
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
    earnedPositions: [],      // Currently-active bonuses this run
    shiftsSurvived: 0,        // Total successful shifts in this streak

    // Permanent meta layer
    discoveredPositions: save.discoveredPositions || [],
    logbookEntries: save.logbookEntries,
    savedTips: save.savedTips,
    ownedUpgrades: save.ownedUpgrades,
    totalShiftsSurvived: save.totalShiftsSurvived,
    bestRating: save.bestRating,
    survivalMap: { ...defaultSurvival, ...(save.survivalMap || {}) }
};

export function saveMeta() {
    Persistence.save({
        savedTips: state.savedTips,
        ownedUpgrades: state.ownedUpgrades,
        logbookEntries: state.logbookEntries,
        totalShiftsSurvived: state.totalShiftsSurvived,
        bestRating: state.bestRating,
        survivalMap: state.survivalMap,
        discoveredPositions: state.discoveredPositions
    });
}

// Called when a deactivation occurs — wipes the streak
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

// Called when starting a fresh shift
export function resetShiftCounters() {
    state.deliveriesThisShift = 0;
    state.shiftElapsedRealSeconds = 0;
    state.currentDelivery = null;
    state.currentShiftWasPerfect = true;
}