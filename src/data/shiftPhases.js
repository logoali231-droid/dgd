/**
 * The in-game 12-hour shift is divided into five named phases.
 * Each phase has a hazard multiplier, pay multiplier, and flavor.
 *
 * Times are in GAME-SECONDS from shift start (0 = 6 AM).
 * Each in-game hour = 3600 game-seconds.
 * The whole 12-hour shift = 43200 game-seconds.
 *
 * 6 AM  = 0
 * 10 AM = 14400
 * 2 PM  = 28800
 * 5 PM  = 39600
 * 9 PM  = 54000 ... wait, that's past the end.
 * 9 PM  = 54000 is wrong — 9 PM from 6 AM = 15 hours away? No.
 * Actually: 6 AM → 10 AM = 4h, → 2 PM = 8h, → 5 PM = 11h, → 9 PM = 15h.
 * But the shift is only 12h long (6 AM → 6 PM).
 *
 * So we compress: use the FIRST 4 phases fully, and Late Night
 * becomes the last sliver.
 */

export const SHIFT_PHASES = [
    {
        id: "morning_rush",
        name: "MORNING RUSH",
        emoji: "🌅",
        startSecond: 0,
        endSecond: 14400,          // 6 AM – 10 AM (4 game hours)
        hazardMultiplier: 1.0,
        payMultiplier: 1.0,
        orderFrequencyMultiplier: 1.3,  // more orders
        color: "#ffcc00"
    },
    {
        id: "lunch_surge",
        name: "LUNCH SURGE",
        emoji: "☀️",
        startSecond: 14400,
        endSecond: 28800,          // 10 AM – 2 PM (4 game hours)
        hazardMultiplier: 1.25,
        payMultiplier: 1.1,
        orderFrequencyMultiplier: 1.5,
        color: "#ff8844"
    },
    {
        id: "dead_zone",
        name: "DEAD ZONE",
        emoji: "🥱",
        startSecond: 28800,
        endSecond: 39600,          // 2 PM – 5 PM (3 game hours)
        hazardMultiplier: 0.7,
        payMultiplier: 0.85,
        orderFrequencyMultiplier: 0.7,  // fewer orders
        color: "#787880"
    },
    {
        id: "dinner_chaos",
        name: "DINNER CHAOS",
        emoji: "🌆",
        startSecond: 39600,
        endSecond: 46800,          // 5 PM – 7 PM (2 game hours)
        hazardMultiplier: 1.5,
        payMultiplier: 1.3,
        orderFrequencyMultiplier: 1.6,
        color: "#ff4444"
    },
    {
        id: "late_night",
        name: "LATE NIGHT",
        emoji: "🌙",
        startSecond: 46800,
        endSecond: 999999,          // 7 PM – 6 AM (see note)
        hazardMultiplier: 1.3,
        payMultiplier: 2.0,
        orderFrequencyMultiplier: 0.9,
        color: "#00e5ff"
    }
];

/**
 * Returns the phase object for the given game-second into the shift.
 * Falls back to Late Night if past 46800.
 */
export function getPhaseForTime(shiftElapsedGameSeconds) {
    for (const phase of SHIFT_PHASES) {
        if (shiftElapsedGameSeconds >= phase.startSecond &&
            shiftElapsedGameSeconds < phase.endSecond) {
            return phase;
        }
    }
    return SHIFT_PHASES[SHIFT_PHASES.length - 1]; // Late Night
}