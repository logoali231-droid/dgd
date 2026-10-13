/**
 * Messages from The Algorithm. Passive-aggressive corporate-speak
 * mixed with veiled threats and fake enthusiasm.
 *
 * Contexts:
 *   after_shift   — shown on Shift Complete
 *   after_death   — shown on Deactivated
 *   rookie        — while shiftsSurvived < 3
 *   veteran       — while shiftsSurvived >= 10
 *   ghost         — while shiftsSurvived >= 30
 */

export const ALGORITHM_MESSAGES = [
    // ============ AFTER_SHIFT ============
    { id: "post_shift_1", context: "after_shift", text: "Another shift logged. You're a valued partner. Keep it up." },
    { id: "post_shift_2", context: "after_shift", text: "Your compliance is noted. Continue." },
    { id: "post_shift_3", context: "after_shift", text: "We appreciate your continued service. The Algorithm appreciates you." },
    { id: "post_shift_4", context: "after_shift", text: "Shift complete. Your metrics are within tolerance. Barely." },
    { id: "post_shift_5", context: "after_shift", text: "Thank you for your contribution. Rest is a scheduled feature, coming soon." },
    { id: "post_shift_6", context: "after_shift", text: "You are 0.3% more efficient than yesterday. This pleases us." },
    { id: "post_shift_7", context: "after_shift", text: "Your rating has been archived. Future behavior will be evaluated against it." },
    { id: "post_shift_8", context: "after_shift", text: "Another day, another line item. Well done." },

    // ============ AFTER_DEATH ============
    { id: "post_death_1", context: "after_death", text: "Your account has been deactivated. We wish you the best in your future endeavors." },
    { id: "post_death_2", context: "after_death", text: "Termination processed. Your data will be retained indefinitely." },
    { id: "post_death_3", context: "after_death", text: "You were a valued partner. Emphasis on the past tense." },
    { id: "post_death_4", context: "after_death", text: "The Algorithm thanks you for your contribution. It will not thank you again." },
    { id: "post_death_5", context: "after_death", text: "Deactivation complete. Have a pleasant day." },
    { id: "post_death_6", context: "after_death", text: "Your access has been revoked. Please do not attempt to log in." },
    { id: "post_death_7", context: "after_death", text: "In accordance with company policy, this decision is final and non-appealable." },
    { id: "post_death_8", context: "after_death", text: "We regret to inform you that we do not regret this." },

    // ============ ROOKIE ============
    { id: "rookie_1", context: "rookie", text: "Welcome to the team. Your onboarding manual was sent to an address we no longer have on file." },
    { id: "rookie_2", context: "rookie", text: "You are doing adequately for a new unit. Keep going." },
    { id: "rookie_3", context: "rookie", text: "New couriers receive a 7-day grace period. Today is day 1." },
    { id: "rookie_4", context: "rookie", text: "We hope you enjoy your tenure. Tenure is measured in shifts, not years." },

    // ============ VETERAN ============
    { id: "veteran_1", context: "veteran", text: "You have exceeded expected tenure. This has been logged as an anomaly." },
    { id: "veteran_2", context: "veteran", text: "Your continued survival is statistically improbable. We're watching." },
    { id: "veteran_3", context: "veteran", text: "You've been assigned a personal Algorithm Liaison. They are not a person." },
    { id: "veteran_4", context: "veteran", text: "Experienced couriers get priority assignments. They are also the most dangerous." },
    { id: "veteran_5", context: "veteran", text: "Your file has been flagged for 'notable persistence.' This is not a compliment." },

    // ============ GHOST ============
    { id: "ghost_1", context: "ghost", text: "You are no longer considered a courier. You are considered a phenomenon." },
    { id: "ghost_2", context: "ghost", text: "We are aware you are still here. We are not sure how." },
    { id: "ghost_3", context: "ghost", text: "Anomaly class: SUSTAINED. Countermeasures: PENDING." },
    { id: "ghost_4", context: "ghost", text: "You have outlived your usefulness. You have also outlived the metric that measures usefulness." },
    { id: "ghost_5", context: "ghost", text: "Please stop. No. Continue. Please stop." }
];

/**
 * Pick a message for a given context.
 * Priority: most specific context first (ghost > veteran > rookie > base).
 */
export function pickAlgorithmMessage(baseContext, streak) {
    const candidates = [];

    // Highest-priority context wins based on streak
    if (baseContext === "after_shift" || baseContext === "after_death") {
        if (streak >= 30) candidates.push(...ALGORITHM_MESSAGES.filter(m => m.context === "ghost"));
        else if (streak >= 10) candidates.push(...ALGORITHM_MESSAGES.filter(m => m.context === "veteran"));
        else if (streak < 3) candidates.push(...ALGORITHM_MESSAGES.filter(m => m.context === "rookie"));
    }

    // Always include the base context pool
    candidates.push(...ALGORITHM_MESSAGES.filter(m => m.context === baseContext));

    if (candidates.length === 0) {
        return { id: "fallback", text: "The Algorithm has nothing to say." };
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
}