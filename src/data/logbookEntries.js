/**
 * The Deactivation Logbook — every way the Algorithm can end your career.
 * 
 * Categories:
 *   "food"      — food integrity violations
 *   "timing"    — late deliveries, breaks, punctuality
 *   "algorithm" — AI/GPS/app misunderstandings
 *   "customer"  — angry, weird, or unreasonable customers
 *   "physical"  — accidents, weather, road hazards
 *   "absurd"    — rare, surreal, "you got unlucky" deaths
 *   "quitting"  — left the shift before minimum hours
 * 
 * Weight = relative chance. Higher = more common.
 * Trigger = optional flag. If set, this entry is only picked when the
 *           matching game condition is true.
 */

export const LOGBOOK_ENTRIES = [
    // ============ FOOD INTEGRITY (Common) ============
    { id: 1,   category: "food", weight: 10, text: "Customer reported their soup was 'warm, not piping hot.' Immediate deactivation." },
    { id: 2,   category: "food", weight: 8,  text: "Pizza arrived tilted 2 degrees. Customer filmed the box. Viral tweet. Deactivated." },
    { id: 3,   category: "food", weight: 6,  text: "Milkshake melted in transit. Customer called it 'soup.' Deactivated." },
    { id: 4,   category: "food", weight: 7,  text: "Taco shell cracked. AI determined 'intentional sabotage.' Deactivated." },
    { id: 5,   category: "food", weight: 9,  text: "Fries arrived soggy. Customer requested a refund and a formal apology. Both processed. You were deactivated." },
    { id: 6,   category: "food", weight: 5,  text: "Sushi delivered at 71°F. Health code violation flagged in the app. Deactivated." },
    { id: 7,   category: "food", weight: 8,  text: "Ice cream was 'too melted' according to the customer. It was 34°C outside." },
    { id: 8,   category: "food", weight: 6,  text: "Coffee cup lid leaked 4 drops into the bag. Customer photographed the evidence. Deactivated." },
    { id: 9,   category: "food", weight: 4,  text: "Bag smelled slightly of curry from a previous order. Customer reported 'cross-contamination.'" },
    { id: 10,  category: "food", weight: 3,  text: "Delivery was 30 seconds late. Food was technically still hot. Customer didn't care." },
    { id: 11,  category: "food", weight: 5,  text: "Sandwich shifted 1cm in the box during a sharp turn. Customer was 'unsettled.'" },
    { id: 12,  category: "food", weight: 7,  text: "Burger bun got 'slightly squished.' Customer demanded a full refund AND your termination." },

    // ============ TIMING (Common) ============
    { id: 20,  category: "timing", weight: 9,  text: "Arrived 31 seconds past ETA. Customer was hangry. Rated 1 star. Deactivated." },
    { id: 21,  category: "timing", weight: 6,  text: "Took a 90-second bathroom break during surge hours. Flagged as 'productivity theft.'" },
    { id: 22,  category: "timing", weight: 7,  text: "Waited for the elevator for 4 minutes. Algorithm insists you should've 'used the stairs.'" },
    { id: 23,  category: "timing", weight: 5,  text: "Stopped at a red light for the full duration. AI flagged you as 'loitering.'" },
    { id: 24,  category: "timing", weight: 8,  text: "Delivery completed in 11 minutes. ETA said 12. Customer complained you arrived 'before they were ready.'" },
    { id: 25,  category: "timing", weight: 4,  text: "Paused for 6 seconds to check the map. Logged as 'unauthorized idle time.'" },
    { id: 26,  category: "timing", weight: 7,  text: "Waited outside the door for the customer to open. They took 90 seconds. You were penalized for 'lateness.'" },
    { id: 27,  category: "timing", weight: 5,  text: "Completed all deliveries on time. Algorithm flagged this as 'statistically improbable.' Deactivated for suspected fraud." },
    { id: 28,  category: "timing", weight: 3,  text: "Crossed a crosswalk legally during a green light. Algorithm marked it as 'jaywalking.'" },
    { id: 29,  category: "timing", weight: 6,  text: "Delivered a late-night order at 11:59 PM. Customer didn't answer until 12:01 AM. You were deactivated for 'arriving on the wrong day.'" },

    // ============ ALGORITHM / TECH (Uncommon) ============
    { id: 40,  category: "algorithm", weight: 6,  text: "App GPS glitched and marked you as 'teleporting.' Flagged for fraud. Deactivated." },
    { id: 41,  category: "algorithm", weight: 5,  text: "Sneezed while accepting an order. AI detected 'erratic behavior.' Deactivated." },
    { id: 42,  category: "algorithm", weight: 7,  text: "Phone died at 11:58 PM. App assumed you 'abandoned the shift.' Deactivated." },
    { id: 43,  category: "algorithm", weight: 6,  text: "A stranger's dog barked at you. Audio AI flagged it as 'aggressive customer interaction.' Deactivated." },
    { id: 44,  category: "algorithm", weight: 4,  text: "You sneezed. The mic picked it up. AI classified it as 'verbal abuse.' Deactivated." },
    { id: 45,  category: "algorithm", weight: 5,  text: "App sent you to a street that doesn't exist. You wandered for 3 minutes. Algorithm blamed you for 'poor navigation.'" },
    { id: 46,  category: "algorithm", weight: 3,  text: "Your phone's autocorrect changed 'ok' to 'Ok' in a customer chat. AI flagged 'unprofessional capitalization.'" },
    { id: 47,  category: "algorithm", weight: 7,  text: "GPS lost signal in a tunnel for 45 seconds. App marked you as 'offline.' Deactivated." },
    { id: 48,  category: "algorithm", weight: 4,  text: "Algorithm observed you breathing heavily after a long climb. Flagged as 'health risk to the company brand.'" },
    { id: 49,  category: "algorithm", weight: 5,  text: "You blinked during a selfie verification. AI couldn't verify identity. Deactivated." },
    { id: 50,  category: "algorithm", weight: 3,  text: "You received a 5-star rating. Algorithm flagged it as 'suspiciously positive.' Under investigation. Deactivated." },
    { id: 51,  category: "algorithm", weight: 6,  text: "The app updated mid-shift. Your account was flagged as 'outdated.' Deactivated." },
    { id: 52,  category: "algorithm", weight: 4,  text: "Algorithm noticed your heart rate via the phone's accelerometer. Said it was 'too calm for peak hours.'" },
    { id: 53,  category: "algorithm", weight: 3,  text: "The app's AI hallucinated an order you never received. You failed to deliver it. Deactivated." },
    { id: 54,  category: "algorithm", weight: 2,  text: "You said 'thank you' to the app. AI interpreted this as an attempt to 'befriend the algorithm.' Security risk." },

    // ============ CUSTOMER ENCOUNTERS (Varied) ============
    { id: 70,  category: "customer", weight: 7,  text: "Customer wanted their food brought to the 14th floor. Elevator broken. They didn't tip. You were deactivated for 'excessive delay.'" },
    { id: 71,  category: "customer", weight: 8,  text: "Customer typed the wrong address. Blamed you. Deactivated." },
    { id: 72,  category: "customer", weight: 5,  text: "Customer's cat sat on the delivery bag for 2 seconds. Reported 'foreign contaminants.' Deactivated." },
    { id: 73,  category: "customer", weight: 6,  text: "Delivered to a customer in a bathrobe. They felt 'judged.' Deactivated." },
    { id: 74,  category: "customer", weight: 7,  text: "Customer wasn't home. You left the order at the door as instructed. They reported it 'stolen.' Deactivated." },
    { id: 75,  category: "customer", weight: 5,  text: "Customer ordered to a business address after closing. Nobody was there. You were blamed." },
    { id: 76,  category: "customer", weight: 6,  text: "Customer asked you to 'wait just a minute.' It was 8 minutes. Algorithm blamed you for the delay." },
    { id: 77,  category: "customer", weight: 4,  text: "Customer complained your helmet was 'unfashionable.' Rated 1 star. Deactivated." },
    { id: 78,  category: "customer", weight: 5,  text: "Customer yelled at you for a missing item. It wasn't missing. They just didn't look in the bag." },
    { id: 79,  category: "customer", weight: 3,  text: "Customer requested you 'smile more.' You smiled. They said it looked 'creepy.'" },
    { id: 80,  category: "customer", weight: 6,  text: "Delivered to a customer who was on a Zoom call. They shushed you. You waited silently. Got rated 2 stars for 'awkwardness.'" },
    { id: 81,  category: "customer", weight: 4,  text: "Customer asked you to take a photo of the delivery. You did. They said the photo was 'not aesthetic enough.'" },
    { id: 82,  category: "customer", weight: 5,  text: "Customer opened the door with their dog. The dog ate a fry. Customer blamed you." },
    { id: 83,  category: "customer", weight: 3,  text: "Customer's kid answered the door and said 'my mom says you're late.' You weren't late." },
    { id: 84,  category: "customer", weight: 6,  text: "Customer reported the food 'tasted weird.' It was a sealed container from the restaurant. You were blamed anyway." },
    { id: 85,  category: "customer", weight: 4,  text: "Customer answered the door in full cosplay. You said 'nice costume.' They were not in costume." },

    // ============ PHYSICAL WORLD (Varied) ============
    { id: 100, category: "physical", weight: 7,  text: "Hit a pothole. Wings flew into the storm drain. Deactivated." },
    { id: 101, category: "physical", weight: 6,  text: "Stray dog stole your burrito. The customer saw. Deactivated." },
    { id: 102, category: "physical", weight: 5,  text: "A car door opened in front of you. You survived. The food didn't." },
    { id: 103, category: "physical", weight: 4,  text: "Rained so hard the bag flooded. You delivered soup. It was now 'soup soup.'" },
    { id: 104, category: "physical", weight: 6,  text: "Got a flat tire 3 blocks from the customer. Walked the rest. Rated 1 star for 'slowness.'" },
    { id: 105, category: "physical", weight: 5,  text: "A pigeon flew into your face. You swerved. The drink spilled. Deactivated." },
    { id: 106, category: "physical", weight: 4,  text: "Got stuck behind a garbage truck on a one-way street. No alternate route. Deactivated for 'inefficiency.'" },
    { id: 107, category: "physical", weight: 3,  text: "A street performer blocked the crosswalk with a full drum kit. You waited politely. Deactivated for lateness." },
    { id: 108, category: "physical", weight: 5,  text: "Gale-force winds blew your delivery bag open mid-ride. Taco shells gone with the wind." },
    { id: 109, category: "physical", weight: 4,  text: "Ran out of charge on your e-bike. Pedaled a normal bike. Arrived soaked in sweat. Customer complained about 'hygiene.'" },
    { id: 110, category: "physical", weight: 3,  text: "A cyclist cut you off. You braked hard. The pizza survived. Your wrist didn't. Deactivated on medical grounds." },
    { id: 111, category: "physical", weight: 5,  text: "Your shoelace got caught in the pedal. You fell. The customer watched from their window. You were deactivated for 'unprofessional conduct.'" },

    // ============ QUITTING EARLY (Context-triggered only) ============
    { id: 200, category: "quitting", weight: 10, trigger: "left_early", text: "You ended your shift before the app's required minimum hours. The Algorithm noticed." },
    { id: 201, category: "quitting", weight: 10, trigger: "left_early", text: "Logged off 3 minutes before the minimum. The Algorithm does not forgive 3 minutes." },
    { id: 202, category: "quitting", weight: 10, trigger: "left_early", text: "You tried to clock out early. The app said no. The Algorithm said yes to deactivation." },

    // ============ ABSURD / RARE (Easter eggs) ============
    { id: 300, category: "absurd", weight: 1, text: "You were deactivated before your first delivery. Reason: 'Preemptive deactivation based on predictive modeling.'" },
    { id: 301, category: "absurd", weight: 1, text: "You accepted an order from yourself. AI flagged an 'existential loop.' Deactivated." },
    { id: 302, category: "absurd", weight: 1, text: "You delivered food so perfectly the customer suspected you were a robot. Reported you. Deactivated." },
    { id: 303, category: "absurd", weight: 1, text: "You saw your own reflection in a shop window. Algorithm flagged you for 'two accounts, one device.'" },
    { id: 304, category: "absurd", weight: 1, text: "A customer gave you a handwritten thank-you note. The Algorithm classified it as 'bribery.'" },
    { id: 305, category: "absurd", weight: 1, text: "You paused to pet a cat. The Algorithm flagged 'fraternizing with non-customers.'" },
    { id: 306, category: "absurd", weight: 1, text: "You remembered your own name. This triggered a memory leak. The app restarted. Your account didn't." },
    { id: 307, category: "absurd", weight: 1, text: "You started the shift at the correct time. The Algorithm detected 'suspicious punctuality.' Investigation initiated." },
    { id: 308, category: "absurd", weight: 1, text: "You considered quitting. The Algorithm detected your hesitation through the phone's gyroscope. Deactivated first." },
    { id: 309, category: "absurd", weight: 1, text: "You delivered an order with a genuine smile. Reported by three separate customers as 'uncanny.'" },
    { id: 310, category: "absurd", weight: 1, text: "You didn't get deactivated today. This logbook entry is a dream. Wake up. Wake up. Wake up." }
];

// ============================================================
// Helper: pick a random entry, optionally filtered by category
// or trigger condition.
// ============================================================
export function pickLogbookEntry(options = {}) {
    const { category = null, trigger = null, exclude = [] } = options;

    let pool = LOGBOOK_ENTRIES.filter(entry => {
        if (category && entry.category !== category) return false;
        if (trigger && entry.trigger !== trigger) return false;
        if (exclude.includes(entry.id)) return false;
        return true;
    });

    // Fallback: if no entry matched, pick any non-triggered entry
    if (pool.length === 0) {
        pool = LOGBOOK_ENTRIES.filter(e => !e.trigger);
    }

    // Weighted random pick
    const totalWeight = pool.reduce((sum, e) => sum + (e.weight || 1), 0);
    let roll = Math.random() * totalWeight;
    for (const entry of pool) {
        roll -= (entry.weight || 1);
        if (roll <= 0) return entry;
    }
    return pool[pool.length - 1]; // safety fallback
}