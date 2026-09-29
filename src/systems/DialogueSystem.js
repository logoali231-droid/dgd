import { state } from '../core/State.js';
import { CONFIG } from '../data/config.js';
import { getRandomDialogue } from '../data/dialogueEvents.js';
import { updatePositions } from './PositionTracker.js';
import { clamp } from '../utils/math.js';
import { triggerChoiceDeactivation } from './DeactivationSystem.js';

const dialogueBox    = document.getElementById("dialogue-box");
const dialogueText   = document.getElementById("dialogue-text");
const dialogueChoice = document.getElementById("dialogue-choices");

let nextDialogueIn = CONFIG.DIALOGUE_COOLDOWN_MIN;
let activeEvent = null;

function isDialogueUnlocked() {
    if (state.shiftElapsedRealSeconds < CONFIG.DIALOGUE_UNLOCK_AFTER_REAL_SECONDS) return false;
    if (state.deliveriesThisShift < CONFIG.DIALOGUE_MIN_DELIVERIES) return false;
    return true;
}

function pickAndShow() {
    const event = getRandomDialogue();
    activeEvent = event;
    dialogueText.textContent = event.text;
    dialogueChoice.innerHTML = "";

    event.choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.textContent = choice.label;
        btn.className = "dialogue-btn";
        btn.addEventListener("click", () => handleChoice(choice));
        dialogueChoice.appendChild(btn);
    });

    dialogueBox.classList.remove("hidden");
}

function handleChoice(choice) {
    // Instant death trap
    if (choice.deathId) {
        hideDialogue();
        triggerChoiceDeactivation(choice.deathId);
        return;
    }

    // Immediate effects
    if (choice.effects) {
        if (choice.effects.cash)    state.cash    = Math.max(0, state.cash + choice.effects.cash);
        if (choice.effects.rating)  state.rating  = clamp(state.rating + choice.effects.rating, 0, 5);
        if (choice.effects.energy)  state.energy  = clamp(state.energy + choice.effects.energy, 0, 100);
        if (choice.effects.battery) state.battery = clamp(state.battery + choice.effects.battery, 0, 100);
    }

    // Trait tally — into streakStats
    if (choice.trait) {
        for (const [name, amount] of Object.entries(choice.trait)) {
            state.streakStats[name] = (state.streakStats[name] || 0) + amount;
        }
        state.streakStats.dialoguesAnswered += 1;
    } else {
        // No trait, no effect → counted as ignored
        state.streakStats.dialoguesIgnored += 1;
    }

    // Check if any positions just qualified
    updatePositions();

    hideDialogue();
}

function hideDialogue() {
    activeEvent = null;
    dialogueBox.classList.add("hidden");
}

export function updateDialogueSystem(deltaTime) {
    if (state.currentDelivery) return;
    if (activeEvent) return;

    if (!isDialogueUnlocked()) {
        nextDialogueIn = CONFIG.DIALOGUE_COOLDOWN_MIN;
        return;
    }

    nextDialogueIn -= deltaTime;
    if (nextDialogueIn <= 0) {
        pickAndShow();
        const spread = CONFIG.DIALOGUE_COOLDOWN_MAX - CONFIG.DIALOGUE_COOLDOWN_MIN;
        nextDialogueIn = CONFIG.DIALOGUE_COOLDOWN_MIN + Math.random() * spread;
    }
}

export function resetDialogueSystem() {
    activeEvent = null;
    nextDialogueIn = CONFIG.DIALOGUE_COOLDOWN_MIN;
    dialogueBox.classList.add("hidden");
}