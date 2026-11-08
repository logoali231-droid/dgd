/**
 * The Arrival mini-game.
 *
 * Once you reach the customer's door, you choose HOW to hand the food over.
 * Every option is a real trade-off — there is no "correct" answer, only
 * different ways to get burned.
 *
 * Each action declares:
 *   id            — stable key
 *   label         — button text
 *   hint          — one-line explanation shown under the button
 *   batteryCost   — phone battery spent (0 for physical actions)
 *   energyCost    — energy spent
 *   timeCost      — seconds added to the food timer (negative = you save time)
 *   baseSuccess   — baseline chance the hand-off goes cleanly (0–1)
 *   success       — { rating, tipMult, text }  when it goes well
 *   failure       — { rating, tipMult, text }  when it goes wrong
 *   theftChance   — chance the food is stolen (leave-at-door only)
 *   theft         — { rating, text } when stolen
 *
 * The customer archetype nudges baseSuccess (see ArrivalSystem).
 */

export const ARRIVAL_ACTIONS = [
    {
        id: "knock",
        label: "✊ Knock Politely",
        hint: "Safe. Costs a little time. No battery.",
        batteryCost: 0,
        energyCost: 0,
        timeCost: 3,
        baseSuccess: 0.85,
        success: { rating: 0.15, tipMult: 1.0, text: "They opened the door, took the bag, and nodded. Clean." },
        failure: { rating: -0.1, tipMult: 0.8, text: "You knocked. They were in the shower. Awkward wait." }
    },
    {
        id: "call",
        label: "📞 Call Them",
        hint: "Reliable, but burns phone battery.",
        batteryCost: 8,
        energyCost: 0,
        timeCost: 1,
        baseSuccess: 0.9,
        success: { rating: 0.1, tipMult: 1.05, text: "They picked up on the first ring and met you at the door." },
        failure: { rating: -0.15, tipMult: 0.7, text: "Straight to voicemail. You left a message nobody will hear." }
    },
    {
        id: "text",
        label: "💬 Text Them",
        hint: "Slow, low stress, low battery.",
        batteryCost: 3,
        energyCost: 0,
        timeCost: 5,
        baseSuccess: 0.75,
        success: { rating: 0.05, tipMult: 1.0, text: "They texted back 'omw' and appeared two minutes later." },
        failure: { rating: -0.2, tipMult: 0.6, text: "They never read it. You stood there holding a cooling bag." }
    },
    {
        id: "leave_at_door",
        label: "🚪 Leave at Door",
        hint: "Instant. But anyone could take it.",
        batteryCost: 0,
        energyCost: 0,
        timeCost: -2,
        baseSuccess: 0.7,
        success: { rating: 0.0, tipMult: 0.9, text: "You set it down, snapped the photo, and rolled out." },
        failure: { rating: -0.25, tipMult: 0.5, text: "You left it. They say they never got it. Your word against theirs." },
        theftChance: 0.12,
        theft: { rating: -0.5, text: "You turned the corner and watched a stranger walk off with the bag." }
    }
];

export function getArrivalActionById(id) {
    return ARRIVAL_ACTIONS.find(a => a.id === id) || null;
}

/**
 * How much each customer archetype likes / distrusts each hand-off method.
 * Positive = more likely to go well. Applied on top of baseSuccess.
 */
export const ARCHETYPE_ARRIVAL_MODS = {
    polite:        { knock: 0.05, call: 0.0,  text: 0.0,  leave_at_door: 0.0 },
    grateful:      { knock: 0.1,  call: 0.05, text: 0.05, leave_at_door: 0.05 },
    impatient:     { knock: -0.1, call: 0.1,  text: -0.05, leave_at_door: 0.1 },
    perfectionist: { knock: 0.05, call: 0.0,  text: -0.1, leave_at_door: -0.2 },
    drunk:         { knock: -0.15, call: 0.05, text: 0.0, leave_at_door: 0.15 },
    suit:          { knock: 0.0,  call: 0.1,  text: 0.05, leave_at_door: -0.05 },
    ghost:         { knock: -0.3, call: 0.15, text: 0.1,  leave_at_door: 0.2 },
    bot:           { knock: -0.1, call: -0.05, text: 0.05, leave_at_door: 0.0 }
};

export function getArrivalMod(archetypeId, actionId) {
    const row = ARCHETYPE_ARRIVAL_MODS[archetypeId];
    if (!row) return 0;
    return row[actionId] || 0;
}
