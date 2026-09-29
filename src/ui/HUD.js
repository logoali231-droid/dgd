import { state } from "../core/State.js";
import { formatTime, formatCurrency } from "../utils/math.js";
import { getPositionById } from "../data/hiddenPositions.js";

const ratingEl = document.getElementById("ui-rating");
const energyEl = document.getElementById("ui-energy");
const batteryEl = document.getElementById("ui-battery");
const cashEl = document.getElementById("ui-cash");
const timeEl = document.getElementById("ui-time");
const streakEl = document.getElementById("ui-streak");
const positionsBar = document.getElementById("positions-bar");

let lastPositionsSignature = "";

export function updateHUD() {
    ratingEl.textContent = state.rating.toFixed(1);
    energyEl.textContent = `${state.energy.toFixed(0)}%`;
    batteryEl.textContent = `${state.battery.toFixed(0)}%`;
    cashEl.textContent = formatCurrency(state.cash);
    timeEl.textContent = formatTime(state.shiftTimeRemaining);
    streakEl.textContent = state.shiftsSurvived;

    // Only re-render positions bar when the list changes
    const signature = state.earnedPositions.join(",");
    if (signature !== lastPositionsSignature) {
        lastPositionsSignature = signature;
        renderPositionsBar();
    }
}

function renderPositionsBar() {
    positionsBar.innerHTML = "";

    if (state.earnedPositions.length === 0) {
        positionsBar.classList.add("hidden");
        return;
    }
    positionsBar.classList.remove("hidden");

    for (const id of state.earnedPositions) {
        const pos = getPositionById(id);
        if (!pos) continue;
        const chip = document.createElement("div");
        chip.className = "position-chip";
        chip.textContent = pos.name;
        chip.title = pos.text;
        positionsBar.appendChild(chip);
    }
}