/**
 * Dialogue events that appear during idle time.
 * 
 * Each choice can have:
 *   effects: { cash, rating, energy, battery } — immediate stat deltas
 *   trait:   { compliance: 1 }                 — adds to hidden tally
 *   deathId: "insulted_customer"               — triggers instant deactivation
 */

export const DIALOGUE_EVENTS = [
    {
        id: "algo_check_in",
        text: "The Algorithm: 'You are 12 seconds behind optimal pace. Confirm you are on track.'",
        choices: [
            { label: "On track!", effects: { rating: 0.1 }, trait: { compliance: 1 } },
            { label: "I'm doing my best.", effects: {}, trait: { defiance: 1 } },
            { label: "Go touch grass.", deathId: "insulted_customer" }
        ]
    },
    {
        id: "customer_waiting",
        text: "A customer messages: 'Hey, I know you're not here yet, but my kid is starving. Can you hurry?'",
        choices: [
            { label: "I'll be there in 2 min.", effects: { energy: -5 }, trait: { care: 1 } },
            { label: "I'll arrive when I arrive.", effects: { rating: -0.1 }, trait: { efficiency: 1 } },
            { label: "Not my problem.", deathId: "insulted_customer" }
        ]
    },
    {
        id: "surge_offer",
        text: "The Algorithm offers a 2x-pay surge order, but you're already tired.",
        choices: [
            { label: "Take it. Cash is cash.", effects: { energy: -20, cash: 15 }, trait: { efficiency: 1 } },
            { label: "Decline. Self-care first.", effects: {}, trait: { defiance: 1 } },
            { label: "Refuse the surge.", deathId: "refused_delivery" }
        ]
    },
    {
        id: "restaurant_chat",
        text: "The restaurant owner says: 'Hey, we're short-staffed. Can you wait 5 extra minutes for the order?'",
        choices: [
            { label: "Sure, I'll wait.", effects: { energy: -10 }, trait: { care: 1 } },
            { label: "I have other orders.", effects: {}, trait: { efficiency: 1 } },
            { label: "This is ridiculous.", deathId: "insulted_customer" }
        ]
    },
    {
        id: "app_review",
        text: "The Algorithm: 'Please rate your experience with us: 5 stars recommended.'",
        choices: [
            { label: "5 stars! Great app!", effects: {}, trait: { compliance: 2 } },
            { label: "I'll be honest.", effects: { rating: -0.2 }, trait: { defiance: 2 } },
        ]
    },
    {
        id: "peer_courier",
        text: "Another courier waves at you: 'Hey, quit this gig. Join the union.'",
        choices: [
            { label: "I'm fine where I am.", trait: { compliance: 2 } },
            { label: "Tell me more.", trait: { defiance: 2 } },
            { label: "I'll think about it.", effects: { energy: 10 } }
        ]
    },
    {
        id: "slow_day",
        text: "Orders are dry. The Algorithm suggests you 'wait closer to the surge zone.'",
        choices: [
            { label: "Relocate immediately.", effects: { energy: -8 }, trait: { compliance: 1 } },
            { label: "Take a short break.", effects: { energy: 15, cash: -5 }, trait: { defiance: 1 } }
        ]
    },
    {
        id: "dog_in_road",
        text: "A stray dog sits in the middle of the road. It looks hungry.",
        choices: [
            { label: "Give it a fry.", effects: { cash: -2 }, trait: { care: 2 } },
            { label: "Ride around it.", effects: {}, trait: { efficiency: 1 } },
            { label: "Shoo it away.", effects: { rating: -0.1 }, trait: { defiance: 1 } }
        ]
    }
];

export function getRandomDialogue() {
    return DIALOGUE_EVENTS[Math.floor(Math.random() * DIALOGUE_EVENTS.length)];
}