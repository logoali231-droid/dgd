import { state } from '../core/State.js';
import { getPositionById } from '../data/hiddenPositions.js';
import { formatCurrency } from '../utils/math.js';

const deliveriesEl = document.getElementById("sc-deliveries");
const cashEl       = document.getElementById("sc-cash");
const ratingEl     = document.getElementById("sc-rating");
const streakEl     = document.getElementById("sc-streak");
const positionsEl  = document.getElementById("shift-complete-positions");

let positionsBeforeShift = [];

/**
 * Capture which positions were already earned — call this right
 * before starting a shift so we can diff afterwards.
 */
export function snapshotPositions() {
    positionsBeforeShift = [...state.earnedPositions];
}

export function renderShiftComplete() {
    deliveriesEl.textContent = state.deliveriesThisShift;
    cashEl.textContent = formatCurrency(state.cash);
    ratingEl.textContent = state.rating.toFixed(1);
    streakEl.textContent = state.shiftsSurvived;

    // Diff positions earned this shift
    const newPositions = state.earnedPositions.filter(id => !positionsBeforeShift.includes(id));

    positionsEl.innerHTML = "";
    if (newPositions.length > 0) {
        const header = document.createElement("p");
        header.textContent = "🎉 NEW POSITIONS:";
        header.style.color = "#39ff14";
        positionsEl.appendChild(header);

        for (const id of newPositions) {
            const pos = getPositionById(id);
            if (!pos) continue;
            const p = document.createElement("p");
            p.textContent = `▸ ${pos.name}`;
            p.style.color = "#ffcc00";
            positionsEl.appendChild(p);
        }
    }
}