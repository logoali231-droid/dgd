import { state } from '../core/State.js';
import { clamp } from '../utils/math.js';
import { SFX } from './AudioManager.js';
import { getMaxEnergy, getMaxBattery } from './UpgradeSystem.js';
import {
    ARRIVAL_ACTIONS,
    getArrivalActionById,
    getArrivalMod,
} from '../data/arrivalActions.js';

// ---- DOM ----
const arrivalPanel = document.getElementById("arrival-panel");
const arrivalTitle = document.getElementById("arrival-title");
const arrivalSub = document.getElementById("arrival-sub");
const arrivalActions = document.getElementById("arrival-actions");
const arrivalResult = document.getElementById("arrival-result");

// ---- STATE ----
let active = null; // { delivery, onResolved }

/**
 * Open the arrival mini-game for a completed ride.
 * `onResolved(result)` is called once the player picks a hand-off method.
 */
export function beginArrival(delivery, onResolved) {
    active = { delivery, onResolved };

    const archetype = delivery.customerType || { name: "The Customer", emoji: "🙂" };
    arrivalTitle.textContent = `${archetype.emoji} ${archetype.name}`;
    arrivalSub.textContent = "You're at the door. How do you hand it over?";
    arrivalResult.textContent = "";
    arrivalResult.classList.add("hidden");

    arrivalActions.innerHTML = "";
    for (const action of ARRIVAL_ACTIONS) {
        const btn = document.createElement("button");
        btn.className = "arrival-btn";
        btn.innerHTML = `<span class="arrival-btn-label">${action.label}</span>
                         <span class="arrival-btn-hint">${action.hint}</span>`;
        btn.addEventListener("click", () => choose(action.id));
        arrivalActions.appendChild(btn);
    }

    arrivalPanel.classList.remove("hidden");
}

function choose(actionId) {
    if (!active) return;
    const { delivery, onResolved } = active;
    const action = getArrivalActionById(actionId);
    if (!action) return;

    const archetype = delivery.customerType || { id: "polite" };

    // ---- Success roll, nudged by the customer archetype ----
    const mod = getArrivalMod(archetype.id, action.id);
    const successChance = clamp(action.baseSuccess + mod, 0.05, 0.98);
    const success = Math.random() < successChance;

    // ---- Theft roll (leave-at-door only) ----
    let stolen = false;
    if (action.theftChance && Math.random() < action.theftChance) {
        stolen = true;
    }

    // ---- Resolve the outcome ----
    let ratingDelta = 0;
    let tipMult = 1.0;
    let text = "";

    if (stolen) {
        ratingDelta = action.theft.rating;
        tipMult = 0;
        text = action.theft.text;
    } else if (success) {
        ratingDelta = action.success.rating;
        tipMult = action.success.tipMult;
        text = action.success.text;
    } else {
        ratingDelta = action.failure.rating;
        tipMult = action.failure.tipMult;
        text = action.failure.text;
    }

    // ---- Spend the costs ----
    if (action.batteryCost) {
        state.battery = clamp(state.battery - action.batteryCost, 0, getMaxBattery());
    }
    if (action.energyCost) {
        state.energy = clamp(state.energy - action.energyCost, 0, getMaxEnergy());
    }

    // ---- Show the outcome briefly, then hand back to OrderManager ----
    arrivalActions.innerHTML = "";
    arrivalResult.textContent = text;
    arrivalResult.classList.remove("hidden");
    arrivalResult.className = "arrival-result " + (stolen || !success ? "bad" : "good");

    if (stolen || !success) SFX.algorithmAlert();
    else SFX.cashRegister();

    const result = {
        ratingDelta,
        tipMult,
        timeCost: action.timeCost || 0,
        stolen,
        success,
        text,
    };

    active = null;
    setTimeout(() => {
        hideArrival();
        onResolved(result);
    }, 1500);
}

export function hideArrival() {
    arrivalPanel.classList.add("hidden");
    arrivalActions.innerHTML = "";
    arrivalResult.classList.add("hidden");
}

export function resetArrivalSystem() {
    active = null;
    hideArrival();
}
