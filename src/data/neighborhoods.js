/**
 * Neighborhoods have a distance tier that affects pay.
 *   close  → short trip, lower pay
 *   medium → baseline
 *   far    → long trip, higher pay
 * 
 * The order card shows the distance so the player can weigh risk vs. reward.
 */

export const NEIGHBORHOODS = [
    { name: "Downtown",            distance: "close",  distanceLabel: "🏠 Close", payMult: 0.85 },
    { name: "Old Town",            distance: "close",  distanceLabel: "🏠 Close", payMult: 0.85 },
    { name: "Campus Area",         distance: "close",  distanceLabel: "🏠 Close", payMult: 0.90 },
    { name: "Riverside",           distance: "medium", distanceLabel: "🏙️ Mid",   payMult: 1.00 },
    { name: "Uptown",              distance: "medium", distanceLabel: "🏙️ Mid",   payMult: 1.05 },
    { name: "Seaside",             distance: "medium", distanceLabel: "🏙️ Mid",   payMult: 1.10 },
    { name: "Industrial District", distance: "far",    distanceLabel: "🌆 Far",   payMult: 1.30 },
    { name: "Hillside",            distance: "far",    distanceLabel: "🌆 Far",   payMult: 1.40 }
];

export function getRandomNeighborhood() {
    return NEIGHBORHOODS[Math.floor(Math.random() * NEIGHBORHOODS.length)];
}