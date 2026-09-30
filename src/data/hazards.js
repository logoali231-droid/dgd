/**
 * Hazards that can fire during a delivery.
 * 
 * Each hazard has:
 *   emoji         — shown on the tap-to-dodge button
 *   name          — displayed under the icon
 *   reactionWindow— real seconds to react before penalty
 *   timePenalty   — seconds added to the delivery timer (pushes food cold)
 *   ratingPenalty — direct rating hit (negative)
 *   weight        — relative spawn chance
 */

export const HAZARDS = [
    {
        id: "pothole",
        emoji: "🕳️",
        name: "Pothole",
        reactionWindow: 2.2,
        timePenalty: 4,
        ratingPenalty: 0,
        weight: 10
    },
    {
        id: "pedestrian",
        emoji: "🚶",
        name: "Pedestrian",
        reactionWindow: 2.0,
        timePenalty: 3,
        ratingPenalty: 0,
        weight: 10
    },
    {
        id: "car_door",
        emoji: "🚪",
        name: "Car Door",
        reactionWindow: 1.8,
        timePenalty: 5,
        ratingPenalty: 0,
        weight: 8
    },
    {
        id: "construction",
        emoji: "🚧",
        name: "Construction",
        reactionWindow: 2.5,
        timePenalty: 6,
        ratingPenalty: 0,
        weight: 6
    },
    {
        id: "stray_dog",
        emoji: "🐕",
        name: "Stray Dog",
        reactionWindow: 1.6,
        timePenalty: 4,
        ratingPenalty: 0.2,
        weight: 7
    },
    {
        id: "rain_cloud",
        emoji: "🌧️",
        name: "Sudden Rain",
        reactionWindow: 2.0,
        timePenalty: 3,
        ratingPenalty: 0.1,
        weight: 5
    },
    {
        id: "pigeon",
        emoji: "🐦",
        name: "Pigeon",
        reactionWindow: 1.4,
        timePenalty: 2,
        ratingPenalty: 0.15,
        weight: 6
    }
];

export function getRandomHazard() {
    const totalWeight = HAZARDS.reduce((sum, h) => sum + h.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const h of HAZARDS) {
        roll -= h.weight;
        if (roll <= 0) return h;
    }
    return HAZARDS[HAZARDS.length - 1];
}

export function getHazardById(id) {
    return HAZARDS.find(h => h.id === id) || null;
}