/**
 * Customer archetypes. Each order rolls one.
 *
 * Modifiers:
 *   payMult         — multiplies base pay
 *   coldTimeMult    — multiplies food cold time (lower = more rushed)
 *   ratingOnTime    — replaces the default +0.1 rating on a clean delivery
 *   ratingLate      — replaces the default -0.5 rating on a cold delivery
 *   bonusTipChance  — chance (0–1) of an extra tip on delivery
 *   bonusTipMult    — multiplier for that bonus tip (applied to payAmount)
 *   complaintChance — chance (0–1) of a complaint penalty (-0.3) at delivery
 */

export const CUSTOMER_TYPES = [
    {
        id: "polite",
        name: "The Polite",
        emoji: "🙂",
        tagline: "Standard customer. Standard expectations.",
        weight: 30,
        payMult: 1.0,
        coldTimeMult: 1.0,
        ratingOnTime: 0.1,
        ratingLate: -0.5,
        bonusTipChance: 0,
        bonusTipMult: 1.0,
        complaintChance: 0
    },
    {
        id: "grateful",
        name: "The Grateful",
        emoji: "😊",
        tagline: "Compliments you no matter what. Tips well.",
        weight: 20,
        payMult: 1.2,
        coldTimeMult: 1.0,
        ratingOnTime: 0.3,
        ratingLate: -0.3,
        bonusTipChance: 0.35,
        bonusTipMult: 0.5,
        complaintChance: 0
    },
    {
        id: "impatient",
        name: "The Impatient",
        emoji: "😤",
        tagline: "Food goes cold fast in their presence. Pays more.",
        weight: 12,
        payMult: 1.4,
        coldTimeMult: 0.6,
        ratingOnTime: 0.2,
        ratingLate: -0.7,
        bonusTipChance: 0.2,
        bonusTipMult: 0.4,
        complaintChance: 0.1
    },
    {
        id: "perfectionist",
        name: "The Perfectionist",
        emoji: "🤓",
        tagline: "Inspects every box. Punishes every flaw.",
        weight: 10,
        payMult: 1.3,
        coldTimeMult: 0.85,
        ratingOnTime: 0.4,
        ratingLate: -0.9,
        bonusTipChance: 0.25,
        bonusTipMult: 0.6,
        complaintChance: 0.15
    },
    {
        id: "drunk",
        name: "The Drunk",
        emoji: "🍺",
        tagline: "Unpredictable. Could tip huge. Could report you.",
        weight: 10,
        payMult: 1.5,
        coldTimeMult: 1.0,
        ratingOnTime: 0.15,
        ratingLate: -0.4,
        bonusTipChance: 0.45,
        bonusTipMult: 1.2,
        complaintChance: 0.2
    },
    {
        id: "suit",
        name: "The Suit",
        emoji: "💼",
        tagline: "Rewards punctuality. Devastated by delay.",
        weight: 8,
        payMult: 1.2,
        coldTimeMult: 0.9,
        ratingOnTime: 0.35,
        ratingLate: -0.9,
        bonusTipChance: 0.15,
        bonusTipMult: 0.3,
        complaintChance: 0.1
    },
    {
        id: "ghost",
        name: "The Ghost",
        emoji: "👻",
        tagline: "Never answers the door. You wait. They still pay.",
        weight: 8,
        payMult: 0.8,
        coldTimeMult: 1.3,
        ratingOnTime: 0.05,
        ratingLate: -0.4,
        bonusTipChance: 0,
        bonusTipMult: 1.0,
        complaintChance: 0.15
    },
    {
        id: "bot",
        name: "The Bot",
        emoji: "🤖",
        tagline: "Automated complaints. No tip ever.",
        weight: 5,
        payMult: 0.7,
        coldTimeMult: 1.0,
        ratingOnTime: 0.0,
        ratingLate: -0.6,
        bonusTipChance: 0,
        bonusTipMult: 1.0,
        complaintChance: 0.25
    }
];

export function getRandomCustomerType() {
    const total = CUSTOMER_TYPES.reduce((s, c) => s + c.weight, 0);
    let roll = Math.random() * total;
    for (const c of CUSTOMER_TYPES) {
        roll -= c.weight;
        if (roll <= 0) return c;
    }
    return CUSTOMER_TYPES[0];
}

export function getCustomerTypeById(id) {
    return CUSTOMER_TYPES.find(c => c.id === id) || null;
}