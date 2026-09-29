import { state, saveMeta } from '../core/State.js';
import { getQualifiedPositions, getPositionById } from '../data/hiddenPositions.js';

/**
 * Called every frame. Checks if any new positions qualify and
 * adds them to the earned list. Records new discoveries permanently.
 */
export function updatePositions() {
    const qualified = getQualifiedPositions(state.streakStats, state.streakStats);

    for (const position of qualified) {
        if (state.earnedPositions.includes(position.id)) continue;

        // Newly earned!
        state.earnedPositions.push(position.id);
        console.log(`[Position Earned] ${position.name}`);

        // Permanent logbook
        if (!state.discoveredPositions.includes(position.id)) {
            state.discoveredPositions.push(position.id);
            saveMeta();
        }
    }
}

/**
 * Returns the active effect value for a given effect key.
 * Combines all earned positions, taking the strongest value.
 * Example: if two positions both give cashMultiplier, uses the max.
 */
export function getActiveEffect(effectKey) {
    let best = null;
    for (const posId of state.earnedPositions) {
        const pos = getPositionById(posId);
        if (!pos || !pos.effects) continue;
        const value = pos.effects[effectKey];
        if (value === undefined) continue;
        if (best === null) best = value;
        else if (effectKey === "cashMultiplier" || effectKey === "energyDrainMultiplier" ||
                 effectKey === "hazardChanceMultiplier" || effectKey === "deliverySpeedMultiplier") {
            // Multiplicative — take the strongest multiplier for buffs
            best = Math.max(best, value);
        } else if (effectKey === "ratingLossReduction") {
            best = Math.max(best, value);
        } else if (effectKey === "ratingPerDelivery") {
            best = Math.max(best, value);
        }
    }
    return best;
}

/**
 * Called when a shift completes successfully.
 */
export function recordShiftComplete() {
    state.streakStats.perfectShifts += state.currentShiftWasPerfect ? 1 : 0;
    state.shiftsSurvived += 1;
    state.totalShiftsSurvived += 1;
    saveMeta();
}