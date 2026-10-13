import { state } from '../core/State.js';
import { getCareerTier } from '../data/difficultyScaling.js';
import { getPositionById } from '../data/hiddenPositions.js';
import { formatCurrency } from '../utils/math.js';
import { DEATH_REASONS } from '../data/deathReasons.js';

const streakEl   = document.getElementById("hub-streak");
const tierEl     = document.getElementById("hub-tier");
const tipsEl     = document.getElementById("hub-tips");
const bestEl     = document.getElementById("hub-best");
const positionsEl = document.getElementById("hub-positions");
const lastDeathEl = document.getElementById("hub-last-death");

export function renderCareerHub() {
    // ---- Basic stats ----
    streakEl.textContent = state.shiftsSurvived;

    const tier = getCareerTier(state.shiftsSurvived);
    tierEl.textContent = tier.name;
    tierEl.style.color = tier.color;

    tipsEl.textContent = formatCurrency(state.savedTips);
    bestEl.textContent = state.bestRating.toFixed(1);

    // ---- Positions ----
    positionsEl.innerHTML = "";
    if (state.earnedPositions.length > 0) {
        const label = document.createElement("p");
        label.textContent = "ACTIVE POSITIONS:";
        label.style.color = "#ffcc00";
        positionsEl.appendChild(label);

        const chips = document.createElement("div");
        chips.className = "hub-positions-row";
        for (const id of state.earnedPositions) {
            const pos = getPositionById(id);
            if (!pos) continue;
            const chip = document.createElement("span");
            chip.className = "position-chip";
            chip.textContent = pos.name;
            chip.title = pos.text;
            chips.appendChild(chip);
        }
        positionsEl.appendChild(chips);
    }

    // ---- Last deactivation ----
    lastDeathEl.innerHTML = "";
    if (state.lastDeathReason) {
        const reason = DEATH_REASONS.find(r => r.id === state.lastDeathReason);
        if (reason) {
            const label = document.createElement("p");
            label.textContent = "LAST DEACTIVATION:";
            label.style.color = "#ff4444";
            lastDeathEl.appendChild(label);

            const text = document.createElement("p");
            text.textContent = reason.text;
            text.style.fontSize = "8px";
            text.style.lineHeight = "1.7";
            text.style.color = "#aaa";
            text.style.textAlign = "left";
            text.style.marginTop = "4px";
            lastDeathEl.appendChild(text);
        }
    } else {
        const p = document.createElement("p");
        p.textContent = "No deactivations on record.";
        p.style.color = "#555";
        lastDeathEl.appendChild(p);
    }
}