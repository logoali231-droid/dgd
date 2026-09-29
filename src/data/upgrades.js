/**
 * Permanent upgrades bought with Saved Tips.
 * 
 * Effect keys (all optional):
 *   energyMax             — additive (raises max energy cap)
 *   batteryMax            — additive (raises max battery cap)
 *   startEnergy           — additive bonus at shift start
 *   startBattery          — additive bonus at shift start
 *   energyDrainReduction  — 0.0–1.0
 *   batteryDrainReduction — 0.0–1.0
 *   cashMultiplierBonus   — 0.0–1.0
 *   coldTimeReduction     — 0.0–1.0
 *   ratingLossReduction   — 0.0–1.0
 *   hazardChanceReduction — 0.0–1.0
 * 
 * Prices scale up per tier. Tiers are shown as section headers in the shop.
 */

export const TIER_LABELS = {
    1: "Tier 1 — Getting Started",
    2: "Tier 2 — Serious Courier",
    3: "Tier 3 — Professional",
    4: "Tier 4 — Legendary"
};

export const UPGRADES = [
    // ============ TIER 1 — $150–$250 ============
    { id: "foam_roller",      tier: 1, cost: 150, name: "Foam Roller",
      desc: "+10 starting energy each shift.",
      effects: { startEnergy: 10 } },
    { id: "insulated_bag",    tier: 1, cost: 200, name: "Insulated Bag",
      desc: "Food stays hot 30% longer.",
      effects: { coldTimeReduction: 0.30 } },
    { id: "comfortable_shoes", tier: 1, cost: 250, name: "Comfortable Shoes",
      desc: "+15 max energy.",
      effects: { energyMax: 15 } },

    // ============ TIER 2 — $350–$500 ============
    { id: "sandwich_prep",    tier: 2, cost: 350, name: "Sandwich Prep",
      desc: "+20 starting energy each shift.",
      effects: { startEnergy: 20 } },
    { id: "gym_membership",   tier: 2, cost: 400, name: "Gym Membership",
      desc: "+20 max energy.",
      effects: { energyMax: 20 } },
    { id: "better_phone",     tier: 2, cost: 500, name: "Better Phone",
      desc: "+25 max battery.",
      effects: { batteryMax: 25 } },

    // ============ TIER 3 — $700–$950 ============
    { id: "ebike",            tier: 3, cost: 700, name: "E-Bike Conversion",
      desc: "-15% energy drain.",
      effects: { energyDrainReduction: 0.15 } },
    { id: "phone_mount",      tier: 3, cost: 800, name: "Phone Mount",
      desc: "-15% battery drain.",
      effects: { batteryDrainReduction: 0.15 } },
    { id: "reinforced_tires", tier: 3, cost: 950, name: "Reinforced Tires",
      desc: "-25% chance of physical hazards.",
      effects: { hazardChanceReduction: 0.25 } },

    // ============ TIER 4 — $1300–$1800 ============
    { id: "pro_bag",          tier: 4, cost: 1300, name: "Pro Cyclist Bag",
      desc: "Additional 40% cold-time reduction (stacks).",
      effects: { coldTimeReduction: 0.40 } },
    { id: "algorithm_sympathizer", tier: 4, cost: 1500, name: "Algorithm Sympathizer",
      desc: "-30% rating loss from late deliveries.",
      effects: { ratingLossReduction: 0.30 } },
    { id: "legendary_ebike",  tier: 4, cost: 1800, name: "Legendary E-Bike",
      desc: "-20% energy drain and +20% cash.",
      effects: { energyDrainReduction: 0.20, cashMultiplierBonus: 0.20 } },

    // ============ TIER 5 — $2500–$3500 ============
    { id: "titanium_bag",     tier: 5, cost: 2500, name: "Titanium Lunchbox",
      desc: "Another 60% cold-time reduction.",
      effects: { coldTimeReduction: 0.60 } },
    { id: "wellness_plan",    tier: 5, cost: 3000, name: "Wellness Plan",
      desc: "+50 max energy AND +50 max battery.",
      effects: { energyMax: 50, batteryMax: 50 } },
    { id: "corporate_shill",  tier: 5, cost: 3500, name: "Corporate Shill",
      desc: "+50% cash from every delivery. The Algorithm loves you.",
      effects: { cashMultiplierBonus: 0.50 } }
];

export function getUpgradeById(id) {
    return UPGRADES.find(u => u.id === id) || null;
}

export function getUpgradesByTier(tier) {
    return UPGRADES.filter(u => u.tier === tier);
}