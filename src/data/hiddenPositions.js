/**
 * Hidden positions. Earned automatically when requirements are met
 * during a run. Lost on deactivation. Discovered positions are
 * permanently saved for the logbook.
 * 
 * type:
 *   "chat"     — requires traitTally thresholds
 *   "gameplay" — requires pure stat thresholds
 *   "mixed"    — requires both
 * 
 * requirements is an object of { statName: threshold }.
 * Valid stat names:
 *   Chat stats:    compliance, defiance, care, efficiency
 *   Gameplay stats: deliveries, perfectShifts, ordersDeclined,
 *                   dialoguesIgnored, dialoguesAnswered
 */

export const HIDDEN_POSITIONS = [
    // ============ CHAT-DEPENDENT (like Angel/Devil in DGF) ============
    {
        id: "angel",
        name: "Angel",
        type: "chat",
        text: "You've been so kind to customers that the Algorithm put a gold star on your file.",
        requirements: { care: 10, compliance: 10 },
        effects: { ratingLossReduction: 0.5, cashMultiplier: 0.85 }
    },
    {
        id: "devils_advocate",
        name: "Devil's Advocate",
        type: "chat",
        text: "You argue with the Algorithm at every turn. It respects that. Sort of.",
        requirements: { defiance: 10 },
        effects: { ratingLossReduction: 0.6, cashMultiplier: 1.3, randomAuditChance: 0.08 }
    },
    {
        id: "customer_whisperer",
        name: "Customer Whisperer",
        type: "chat",
        text: "Every customer you talk to leaves a 5-star review. Even the hangry ones.",
        requirements: { care: 8 },
        effects: { ratingPerDelivery: 0.15, cashMultiplier: 0.9 }
    },

    // ============ GAMEPLAY-DEPENDENT (like Free Rider in DGF) ============
    {
        id: "exemplary_worker",
        name: "Exemplary Worker",
        type: "gameplay",
        text: "Your stats are perfect. The Algorithm promoted you — congrats, you're still underpaid.",
        requirements: { deliveries: 30, perfectShifts: 2 },
        effects: { cashMultiplier: 2.0, energyDrainMultiplier: 1.5 }
    },
    {
        id: "speed_demon",
        name: "Speed Demon",
        type: "gameplay",
        text: "You've optimized yourself into a machine. Safety was never part of the equation.",
        requirements: { deliveries: 20 },
        effects: { deliverySpeedMultiplier: 1.3, hazardChanceMultiplier: 1.5 }
    },
    {
        id: "free_rider",
        name: "Free Rider",
        type: "gameplay",
        text: "You complete shifts without answering a single chat. The Algorithm never noticed.",
        requirements: { dialoguesIgnored: 5, perfectShifts: 1 },
        effects: { energyDrainMultiplier: 0.7, cashMultiplier: 0.9 }
    },
    {
        id: "lonely_rider",
        name: "Lonely Rider",
        type: "gameplay",
        text: "You decline every order you can get away with. You're still alive somehow.",
        requirements: { ordersDeclined: 15 },
        effects: { ratingLossReduction: 0.4, cashMultiplier: 0.75 }
    },

    // ============ MIXED (hardest to get, best rewards) ============
    {
        id: "iron_courier",
        name: "Iron Courier",
        type: "mixed",
        text: "Relentless, obedient, and impossible to break. The Algorithm calls you 'our top asset.'",
        requirements: { compliance: 8, deliveries: 40, perfectShifts: 3 },
        effects: { cashMultiplier: 1.5, ratingLossReduction: 0.5, energyDrainMultiplier: 1.2 }
    }
];

export function getPositionById(id) {
    return HIDDEN_POSITIONS.find(p => p.id === id) || null;
}

/**
 * Returns array of positions whose requirements are currently met.
 */
export function getQualifiedPositions(traitTally = {}, streakStats = {}) {
    const merged = { ...traitTally, ...streakStats };
    return HIDDEN_POSITIONS.filter(position => {
        for (const [stat, threshold] of Object.entries(position.requirements)) {
            if ((merged[stat] || 0) < threshold) return false;
        }
        return true;
    });
}