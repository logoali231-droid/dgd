import { state } from "../core/State.js";
import { formatTime, formatCurrency} from "../utils/math.js";

const ratingEl = document.getElementById("ui-rating");
const energyEl = document.getElementById("ui-energy");
const batteryEl = document.getElementById("ui-battery");
const cashEl = document.getElementById("ui-cash");
const timeEl = document.getElementById("ui-time");

export function updateHUD() {
    ratingEl.textContent = state.rating.toFixed(1);
    energyEl.textContent = `${state.energy.toFixed(0)}%`;
    batteryEl.textContent = `${state.battery.toFixed(0)}%`;
    cashEl.textContent = formatCurrency(state.cash);
    timeEl.textContent = formatTime(state.shiftTimeRemaining);
}