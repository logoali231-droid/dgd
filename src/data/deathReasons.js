/**
 * Every way the Algorithm can deactivate you.
 *
 * Three families:
 *
 *   condition  — fires when a stat crosses the line. Rolled on a cooldown
 *                (a "close call"), never per-frame. If you survive the roll
 *                you get a temporary grace so the same line can't be
 *                hammered against you 60 times a second.
 *
 *   choice     — no roll. Always fatal. Reserved for dialogue traps and
 *                for quitting early.
 *
 *   random     — PENALTY EVENTS, not instakills. A random event fires on a
 *                timer; each one carries effects (energy, battery, cash,
 *                stress...) and an optional death reason it *can* escalate
 *                to. The Algorithm's wrath chips at you, and only kills you
 *                when it catches you already on the floor.
 *
 * baseSurvival    — starting survival chance (0.0–1.0).
 * growthPerDeath  — how much survival increases each time you die to it.
 * maxSurvival     — hard cap. At 1.0, this reason can never kill you again.
 */

export const DEATH_REASONS = [
  // ================================================================
  //  CONDITION-BASED
  // ================================================================
  {
    id: "rating_zero",
    type: "condition",
    category: "algorithm",
    baseSurvival: 0.0,
    growthPerDeath: 0.1,
    maxSurvival: 0.9,
    condition: (s) => s.rating <= 0,
    text: "Your rating hit zero. The Algorithm doesn't need a reason. You were deactivated.",
  },
  {
    id: "energy_zero_before_shift",
    type: "condition",
    category: "physical",
    baseSurvival: 0.05,
    growthPerDeath: 0.1,
    maxSurvival: 0.9,
    condition: (s) => s.energy <= 0 && s.shiftTimeRemaining > 0,
    text: "You collapsed from exhaustion before completing the minimum required shift. Deactivated.",
  },
  {
    id: "battery_zero_before_shift",
    type: "condition",
    category: "algorithm",
    baseSurvival: 0.05,
    growthPerDeath: 0.1,
    maxSurvival: 0.9,
    condition: (s) => s.battery <= 0 && s.shiftTimeRemaining > 0,
    text: "Your phone died mid-shift. The Algorithm marked you as 'offline.' Deactivated.",
  },
  {
    id: "cold_food_delivered",
    type: "condition",
    category: "food",
    baseSurvival: 0.15,
    growthPerDeath: 0.1,
    maxSurvival: 0.95,
    condition: (s) => s.lastDelivery && s.lastDelivery.wasCold,
    text: "You delivered cold food. The customer filed a formal complaint with photographic evidence. Deactivated.",
  },
  {
    id: "three_red_lights",
    type: "condition",
    category: "timing",
    baseSurvival: 0.0,
    growthPerDeath: 0.15,
    maxSurvival: 0.95,
    condition: (s) => s.redLightStrikes >= 3,
    text: "You ran three red lights in one shift. The Algorithm's telemetry report was forwarded to the city. Deactivated.",
  },

  // ================================================================
  //  CHOICE-BASED — no rolls, always fatal
  // ================================================================
  {
    id: "quit_early_menu",
    type: "choice",
    category: "quitting",
    baseSurvival: 0.0,
    growthPerDeath: 0.0,
    maxSurvival: 0.0,
    text: "You tapped 'End Shift' before meeting the minimum. The Algorithm flagged it as 'voluntary abandonment.'",
  },
  {
    id: "insulted_customer",
    type: "choice",
    category: "customer",
    baseSurvival: 0.0,
    growthPerDeath: 0.0,
    maxSurvival: 0.0,
    text: "You told a customer to 'figure it out themselves.' They recorded it. The Algorithm reviewed the audio. Deactivated.",
  },
  {
    id: "refused_delivery",
    type: "choice",
    category: "timing",
    baseSurvival: 0.0,
    growthPerDeath: 0.0,
    maxSurvival: 0.0,
    text: "You declined a surge-price order during peak hours. The Algorithm took that personally.",
  },
];

/**
 * Random penalty events. Each fires on the Algorithm's own timer.
 *
 *   weight   — relative chance of being the event that fires
 *   minShift — earliest shift number (career streak) it can appear
 *   effects  — applied to state when the event fires
 *   deathId  — the logbook reason this event can escalate into
 *   killWhen — predicate: does the event *finish you off* right now?
 *              (these are the conditions that make the event lethal)
 *   surviveText — flavour shown when the event hits but doesn't kill
 */
export const RANDOM_EVENTS = [
  {
    id: "audit",
    weight: 16,
    minShift: 0,
    effects: { rating: -0.25 },
    deathId: "random_negative_nancy",
    killWhen: (s) => s.rating <= 0,
    surviveText: "AUDIT: metrics reviewed. Rating -0.25. Corrective action logged.",
  },
  {
    id: "surge_temptation",
    weight: 14,
    minShift: 0,
    effects: { energy: -12, cash: 20 },
    deathId: "random_got_two_jobs",
    killWhen: (s) => s.energy <= 0,
    surviveText: "PEAK PAY: you took the surge. +$20, but your legs are gone.",
  },
  {
    id: "complaint_wave",
    weight: 13,
    minShift: 0,
    effects: { rating: -0.3 },
    deathId: "random_negative_nancy",
    killWhen: (s) => s.rating <= 0,
    surviveText: "COMPLAINT WAVE: three customers filed at once. Rating -0.3.",
  },
  {
    id: "app_update",
    weight: 11,
    minShift: 1,
    effects: { battery: -15 },
    deathId: "battery_zero_before_shift",
    killWhen: (s) => s.battery <= 0,
    surviveText: "APP UPDATE: forced install mid-shift. Battery -15%.",
  },
  {
    id: "gps_outage",
    weight: 10,
    minShift: 1,
    effects: { battery: -10, energy: -6 },
    deathId: "random_left_early",
    killWhen: (s) => s.battery <= 0,
    surviveText: "GPS OUTAGE: you circled for two minutes. Battery -10%, energy -6.",
  },
  {
    id: "dog_attack",
    weight: 9,
    minShift: 0,
    effects: { energy: -14, rating: -0.15 },
    deathId: "random_dog_attack",
    killWhen: (s) => s.energy <= 0,
    surviveText: "STRAY DOG: it got the bag. You got away. Energy -14, rating -0.15.",
  },
  {
    id: "car_door",
    weight: 9,
    minShift: 0,
    effects: { energy: -16, cash: -10 },
    deathId: "random_car_door",
    killWhen: (s) => s.energy <= 0,
    surviveText: "CAR DOOR: you swerved into a bollard. Energy -16, repair -$10.",
  },
  {
    id: "pothole_spill",
    weight: 8,
    minShift: 0,
    effects: { rating: -0.2 },
    deathId: "random_pothole",
    killWhen: (s) => s.rating <= 0,
    surviveText: "POTHOLE: lid popped off. Rating -0.2.",
  },
  {
    id: "restaurant_strike",
    weight: 7,
    minShift: 2,
    effects: { energy: -8, rating: -0.1 },
    deathId: "random_sudden_strike",
    killWhen: (s) => s.energy <= 0,
    surviveText: "STRIKE: the kitchen walked out. You waited in the cold. Energy -8.",
  },
  {
    id: "screenshot_flag",
    weight: 6,
    minShift: 3,
    effects: { rating: -0.35 },
    deathId: "random_screenshot",
    killWhen: (s) => s.rating <= 0,
    surviveText: "SECURITY: you screenshotted the app. Rating -0.35.",
  },
  {
    id: "surprise_termination",
    weight: 5,
    minShift: 4,
    effects: { rating: -0.2 },
    deathId: "random_company_bankrupt",
    killWhen: (s) => s.rating < 2.0,
    surviveText: "RESTRUCTURING: your region was 'consolidated.' You survived by luck.",
  },

  // ---- Absurd / Easter eggs -------------------------------------
  {
    id: "absurd_cat",
    weight: 2,
    minShift: 0,
    effects: { rating: -0.1, energy: 5 },
    deathId: "absurd_cat",
    killWhen: () => false,
    surviveText: "You paused to pet a cat. Rating -0.1. Worth it.",
  },
  {
    id: "absurd_robot",
    weight: 1,
    minShift: 5,
    effects: {},
    deathId: "absurd_robot",
    killWhen: () => false,
    surviveText: "A customer squinted at you. 'You're not a robot, are you?'",
  },
  {
    id: "absurd_reflection",
    weight: 1,
    minShift: 5,
    effects: {},
    deathId: "absurd_reflection",
    killWhen: () => false,
    surviveText: "You caught your reflection in a shop window. It looked tired.",
  },
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
//  HELPER — pick the first condition currently being violated
// ================================================================
export function getActiveCondition(state) {
  for (const reason of DEATH_REASONS) {
    if (reason.type !== "condition") continue;
    if (reason.condition(state)) return reason;
  }
  return null;
}

// ================================================================
//  HELPER — pick a random penalty event appropriate to this career
// ================================================================
export function pickRandomEvent(streak = 0) {
  const pool = RANDOM_EVENTS.filter((e) => (e.minShift ?? 0) <= streak);
  const totalWeight = pool.reduce((sum, e) => sum + (e.weight || 1), 0);
  let roll = Math.random() * totalWeight;
  for (const e of pool) {
    roll -= e.weight || 1;
    if (roll <= 0) return e;
  }
  return pool[pool.length - 1] || null;
}

// ================================================================
//  HELPER — find a death reason by id (any type)
// ================================================================
export function getReasonById(id) {
  return DEATH_REASONS.find((r) => r.id === id) || null;
}

// ================================================================
//  HELPER — find a choice-based reason by ID
// ================================================================
export function getChoiceReason(id) {
  return DEATH_REASONS.find((r) => r.id === id && r.type === "choice") || null;
}
