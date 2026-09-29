/**
 * Every way the Algorithm can deactivate you.
 * 
 * baseSurvival  — starting survival chance (0.0–1.0). Higher = you were
 *                 already partially protected from day 1.
 * growthPerDeath — how much survival increases each time you die to it.
 * maxSurvival   — hard cap. At 1.0, this reason can never kill you again.
 */

export const DEATH_REASONS = [

    // ================================================================
    //  CONDITION-BASED
    //  Fires when the condition is met. Rolled once per "close call."
    // ================================================================
    {
        id: "rating_zero",
        type: "condition",
        category: "algorithm",
        baseSurvival: 0.00,
        growthPerDeath: 0.10,
        maxSurvival: 0.90,
        condition: (s) => s.rating <= 0,
        text: "Your rating hit zero. The Algorithm doesn't need a reason. You were deactivated."
    },
    {
        id: "energy_zero_before_shift",
        type: "condition",
        category: "physical",
        baseSurvival: 0.05,
        growthPerDeath: 0.10,
        maxSurvival: 0.90,
        condition: (s) => s.energy <= 0 && s.shiftTimeRemaining > 0,
        text: "You collapsed from exhaustion before completing the minimum required shift. Deactivated."
    },
    {
        id: "battery_zero_before_shift",
        type: "condition",
        category: "algorithm",
        baseSurvival: 0.05,
        growthPerDeath: 0.10,
        maxSurvival: 0.90,
        condition: (s) => s.battery <= 0 && s.shiftTimeRemaining > 0,
        text: "Your phone died mid-shift. The Algorithm marked you as 'offline.' Deactivated."
    },
    {
        id: "cold_food_delivered",
        type: "condition",
        category: "food",
        baseSurvival: 0.15,
        growthPerDeath: 0.10,
        maxSurvival: 0.95,
        condition: (s) => s.lastDelivery && s.lastDelivery.wasCold,
        text: "You delivered cold food. The customer filed a formal complaint with photographic evidence. Deactivated."
    },

    // ================================================================
    //  CHOICE-BASED — no rolls, always fatal
    // ================================================================
    {
        id: "quit_early_menu",
        type: "choice",
        category: "quitting",
        baseSurvival: 0.00,
        growthPerDeath: 0.00,
        maxSurvival: 0.00,
        text: "You tapped 'End Shift' before meeting the minimum. The Algorithm flagged it as 'voluntary abandonment.'"
    },
    {
        id: "insulted_customer",
        type: "choice",
        category: "customer",
        baseSurvival: 0.00,
        growthPerDeath: 0.00,
        maxSurvival: 0.00,
        text: "You told a customer to 'figure it out themselves.' They recorded it. The Algorithm reviewed the audio. Deactivated."
    },
    {
        id: "refused_delivery",
        type: "choice",
        category: "timing",
        baseSurvival: 0.00,
        growthPerDeath: 0.00,
        maxSurvival: 0.00,
        text: "You declined a surge-price order during peak hours. The Algorithm took that personally."
    },

    // ================================================================
    //  RANDOM EVENTS
    //  Rolled periodically during the shift. Base survival reflects
    //  how external/uncontrollable each reason is.
    // ================================================================
    { id: "random_company_bankrupt", type: "random", category: "algorithm", baseChance: 0.03, baseSurvival: 0.15, growthPerDeath: 0.15, maxSurvival: 1.0, text: "The delivery platform went bankrupt mid-shift. All couriers deactivated." },
    { id: "random_got_two_jobs",     type: "random", category: "algorithm", baseChance: 0.04, baseSurvival: 0.10, growthPerDeath: 0.10, maxSurvival: 1.0, text: "The Algorithm detected you were running another delivery app simultaneously. Deactivated for 'conflict of interest.'" },
    { id: "random_work_mistake",     type: "random", category: "food",      baseChance: 0.05, baseSurvival: 0.00, growthPerDeath: 0.10, maxSurvival: 1.0, text: "A work mistake on your end. A taco was missing. The Algorithm doesn't do retries." },
    { id: "random_screenshot",       type: "random", category: "algorithm", baseChance: 0.03, baseSurvival: 0.20, growthPerDeath: 0.10, maxSurvival: 1.0, text: "You took a screenshot of the app. The Algorithm flagged it as a 'security leak.' Deactivated." },
    { id: "random_left_early",       type: "random", category: "quitting",  baseChance: 0.06, baseSurvival: 0.00, growthPerDeath: 0.10, maxSurvival: 1.0, text: "You closed the app mid-delivery. The Algorithm assumed you abandoned the shift." },
    { id: "random_sudden_strike",    type: "random", category: "customer",  baseChance: 0.04, baseSurvival: 0.20, growthPerDeath: 0.15, maxSurvival: 1.0, text: "A sudden strike at the restaurant. All orders cancelled. The Algorithm blamed you for the disruption." },
    { id: "random_dog_attack",       type: "random", category: "physical",  baseChance: 0.05, baseSurvival: 0.05, growthPerDeath: 0.10, maxSurvival: 1.0, text: "A stray dog attacked you mid-delivery. Food scattered. You were deactivated for 'failure to secure cargo.'" },
    { id: "random_car_door",         type: "random", category: "physical",  baseChance: 0.05, baseSurvival: 0.05, growthPerDeath: 0.10, maxSurvival: 1.0, text: "A parked car door swung open. You swerved. The food didn't survive. Neither did your rating." },
    { id: "random_pothole",          type: "random", category: "physical",  baseChance: 0.04, baseSurvival: 0.05, growthPerDeath: 0.10, maxSurvival: 1.0, text: "You hit a pothole at full speed. The drink lid popped off. The Algorithm saw everything via GPS telemetry." },
    { id: "random_negative_nancy",   type: "random", category: "customer",  baseChance: 0.03, baseSurvival: 0.00, growthPerDeath: 0.10, maxSurvival: 1.0, text: "You replied negatively to five customer messages in a row. The Algorithm's sentiment analysis flagged you as a 'risk.'" },

    // ---- Absurd / Easter Eggs ----
    { id: "absurd_robot",      type: "random", category: "absurd", baseChance: 0.005, baseSurvival: 0.30, growthPerDeath: 0.15, maxSurvival: 1.0, text: "You delivered food so perfectly the customer suspected you were a robot. Reported you. Deactivated." },
    { id: "absurd_reflection", type: "random", category: "absurd", baseChance: 0.005, baseSurvival: 0.30, growthPerDeath: 0.15, maxSurvival: 1.0, text: "You saw your own reflection in a shop window. Algorithm flagged 'two accounts, one device.'" },
    { id: "absurd_cat",        type: "random", category: "absurd", baseChance: 0.005, baseSurvival: 0.30, growthPerDeath: 0.15, maxSurvival: 1.0, text: "You paused to pet a cat. The Algorithm flagged 'fraternizing with non-customers.'" },
];

// ================================================================
//  HELPER — initialize the survival map from base values
// ================================================================
export function buildDefaultSurvivalMap() {
    const map = {};
    for (const reason of DEATH_REASONS) {
        map[reason.id] = reason.baseSurvival;
    }
    return map;
}

// ================================================================
//  HELPER — pick a random condition that can be rolled this frame
//  (returns null if nothing to check)
// ================================================================
export function getActiveCondition(state) {
    for (const reason of DEATH_REASONS) {
        if (reason.type !== "condition") continue;
        if (reason.condition(state)) return reason;
    }
    return null;
}

// ================================================================
//  HELPER — roll every random reason once
// ================================================================
export function rollRandomEvent(survivalMap = {}) {
    for (const reason of DEATH_REASONS) {
        if (reason.type !== "random") continue;
        const survival = survivalMap[reason.id] ?? reason.baseSurvival ?? 0;
        const adjustedChance = reason.baseChance * (1 - survival);
        if (Math.random() < adjustedChance) return reason;
    }
    return null;
}

// ================================================================
//  HELPER — find a choice-based reason by ID
// ================================================================
export function getChoiceReason(id) {
    return DEATH_REASONS.find(r => r.id === id && r.type === "choice") || null;
}