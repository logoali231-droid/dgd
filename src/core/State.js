import { CONFIG } from '../data/config.js';
import { Persistence } from './Persistence.js';

// Load persistent data once
const save = Persistence.load();

// Build the run state
export const state = {
    isPlaying: false,
    rating: CONFIG.DEFAULT_RATING,
    energy: CONFIG.DEFAULT_ENERGY,
    battery: CONFIG.DEFAULT_BATTERY,
    cash: CONFIG.DEFAULT_CASH,
    shiftTimeRemaining: CONFIG.DEFAULT_SHIFT_TIME,

    // Meta layer (persistent)
    savedTips: save.savedTips,
    ownedUpgrades: save.ownedUpgrades,
    logbookEntries: save.logbookEntries,
    totalShiftsSurvived: save.totalShiftsSurvived,
    bestRating: save.bestRating
};

// Helper to save the meta layer back to localStorage
export function saveMeta() {
    Persistence.save({
        savedTips: state.savedTips,
        ownedUpgrades: state.ownedUpgrades,
        logbookEntries: state.logbookEntries,
        totalShiftsSurvived: state.totalShiftsSurvived,
        bestRating: state.bestRating
    });
}