/**
 * Consumables — unlimited purchases at fixed price.
 * Stored as an inventory count. Only ONE OF EACH can be used per shift.
 * Use them from the game screen via the Coffee / Power Bank buttons.
 */

export const CONSUMABLES = [
    {
        id: "coffee",
        name: "☕ Coffee",
        desc: "+25 energy. One use per shift.",
        cost: 75,
        effect: { energy: 25 }
    },
    {
        id: "power_bank",
        name: "🔋 Power Bank",
        desc: "+30 battery. One use per shift.",
        cost: 100,
        effect: { battery: 30 }
    }
];

export function getConsumableById(id) {
    return CONSUMABLES.find(c => c.id === id) || null;
}