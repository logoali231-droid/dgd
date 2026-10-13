/**
 * The Algorithm gets stricter the longer you survive.
 * streak = state.shiftsSurvived (0 = fresh career, higher = veteran)
 */

export function getHazardScaling(streak) {
    // Streak 0-4: mild. 5-14: noticeable. 15-29: harsh. 30+: brutal.
    const tier = Math.floor(streak / 5);
    const bonus = Math.min(tier * 0.15, 1.5); // caps at +150%
    return 1.0 + bonus;
}

export function getDecisionTimeScaling(streak) {
    // Order decision time shrinks from 6s → 3s over ~20 shifts
    const reduction = Math.min(streak * 0.15, 3.0);
    return Math.max(6.0 - reduction, 3.0);
}

export function getRandomEventInterval(streak) {
    // Starts at 150s, drops as you survive longer, floors at 90s
    const reduction = Math.min(streak * 3, 60);
    return Math.max(150 - reduction, 90);
}

export function getPayScaling(streak) {
    // Algorithm keeps more. Multiplier shrinks from 1.0 → 0.7
    const reduction = Math.min(streak * 0.02, 0.30);
    return 1.0 - reduction;
}

/**
 * Returns the current career tier label for the streak.
 */
export function getCareerTier(streak) {
    if (streak < 5)  return { name: "Rookie",       color: "#39ff14" };
    if (streak < 15) return { name: "Courier",      color: "#ffcc00" };
    if (streak < 30) return { name: "Veteran",      color: "#ff8844" };
    if (streak < 50) return { name: "Legend",       color: "#ff4444" };
    return { name: "GHOST", color: "#00e5ff" };
}