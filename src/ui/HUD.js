import { state } from "../core/State.js";
import { formatTime, formatCurrency } from "../utils/math.js";
import { getPositionById } from "../data/hiddenPositions.js";
import { getSprite, ASSETS } from "../assets.js";

const ratingEl = document.getElementById("ui-rating");
const energyEl = document.getElementById("ui-energy");
const batteryEl = document.getElementById("ui-battery");
const cashEl = document.getElementById("ui-cash");
const timeEl = document.getElementById("ui-time");
const streakEl = document.getElementById("ui-streak");
const positionsBar = document.getElementById("positions-bar");

let lastPositionsSignature = "";

/**
 * Returns an <img> if the sprite exists, else the emoji fallback.
 */
function iconFor(spritePath, fallbackEmoji) {
    const img = getSprite(spritePath);
    if (img) {
        const el = document.createElement("img");
        el.src = img.src;
        el.alt = "";
        el.className = "hud-icon";
        return el;
    }
    const span = document.createElement("span");
    span.textContent = fallbackEmoji;
    span.className = "hud-icon";
    return span;
}

// Optional: swap the label's emoji for a sprite if available.
// Only runs once per page load.
function applyHudIcons() {
    const batterySprite = getSprite(ASSETS.sprites.ui.battery_icon);
    const energySprite  = getSprite(ASSETS.sprites.ui.energy_icon);
    const cashSprite    = getSprite(ASSETS.sprites.ui.cash_icon);
    const starSprite    = getSprite(ASSETS.sprites.ui.star_full);

    if (batterySprite) document.querySelector('.stat-box:nth-child(3) .label').prepend(iconFor(ASSETS.sprites.ui.battery_icon, "🔋"));
    if (energySprite)  document.querySelector('.stat-box:nth-child(2) .label').prepend(iconFor(ASSETS.sprites.ui.energy_icon, "⚡"));
    if (cashSprite)    document.querySelector('.stat-box:nth-child(4) .label').prepend(iconFor(ASSETS.sprites.ui.cash_icon, "💵"));
    if (starSprite)    document.querySelector('.stat-box:nth-child(1) .label').prepend(iconFor(ASSETS.sprites.ui.star_full, "⭐"));
}

export function updateHUD() {
    ratingEl.textContent = state.rating.toFixed(1);
    energyEl.textContent = `${state.energy.toFixed(0)}%`;
    batteryEl.textContent = `${state.battery.toFixed(0)}%`;
    cashEl.textContent = formatCurrency(state.cash);
    timeEl.textContent = formatTime(state.shiftTimeRemaining);
    streakEl.textContent = state.shiftsSurvived;

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

// Attempt to upgrade labels once sprites load
setTimeout(applyHudIcons, 500);