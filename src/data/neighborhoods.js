/**
 * Neighborhoods have a distance tier that affects pay.
 *   close  → short trip, lower pay
 *   medium → baseline
 *   far    → long trip, higher pay
 *
 * `progress` is the ride length in progress units (the pedal fills
 * progress at BASE_PEDAL_RATE units/second, so ~40 units ≈ 1 second
 * of solid pedaling). It is what the delivery progress bar counts up to.
 *
 * The order card shows the distance so the player can weigh risk vs. reward.
 */

export const NEIGHBORHOODS = [
    { name: "Downtown",            distance: "close",  distanceLabel: "🏠 Close", payMult: 0.85, progress: 55 },
    { name: "Old Town",            distance: "close",  distanceLabel: "🏠 Close", payMult: 0.85, progress: 60 },
    { name: "Campus Area",         distance: "close",  distanceLabel: "🏠 Close", payMult: 0.90, progress: 65 },
    { name: "Riverside",           distance: "medium", distanceLabel: "🏙️ Mid",   payMult: 1.00, progress: 90 },
    { name: "Uptown",              distance: "medium", distanceLabel: "🏙️ Mid",   payMult: 1.05, progress: 100 },
    { name: "Seaside",             distance: "medium", distanceLabel: "🏙️ Mid",   payMult: 1.10, progress: 110 },
    { name: "Industrial District", distance: "far",    distanceLabel: "🌆 Far",   payMult: 1.30, progress: 140 },
    { name: "Hillside",            distance: "far",    distanceLabel: "🌆 Far",   payMult: 1.40, progress: 155 }
];

export function getRandomNeighborhood() {
    return NEIGHBORHOODS[Math.floor(Math.random() * NEIGHBORHOODS.length)];
}
