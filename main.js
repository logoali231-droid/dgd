import { startGameLoop } from './src/core/GameLoop.js';
import { state, resetShiftCounters } from './src/core/State.js';
import { showGame, showStart, showShop } from './src/ui/ScreenManager.js';
import { resetOrderManager } from './src/systems/OrderManager.js';
import { resetDialogueSystem } from './src/systems/DialogueSystem.js';
import { resetRun, startNextShift } from './src/systems/UpgradeSystem.js';
import { renderShop } from './src/ui/ShopUI.js';
import { useCoffee, usePowerBank } from './src/systems/ConsumableSystem.js';
import { snapshotPositions } from './src/ui/ShiftCompleteUI.js';

window.state = state;

const startButton     = document.getElementById("start-btn");
const restartBtn      = document.getElementById("restart-btn");
const shopContinueBtn = document.getElementById("shop-continue-btn");
const nextShiftBtn    = document.getElementById("next-shift-btn");
const shiftShopBtn    = document.getElementById("shift-shop-btn");

const useCoffeeBtn    = document.getElementById("use-coffee-btn");
const usePowerBankBtn = document.getElementById("use-powerbank-btn");
const coffeeCountEl   = document.getElementById("coffee-count");
const powerBankCountEl = document.getElementById("powerbank-count");

export function refreshConsumableBar() {
    const coffeeDisabled = state.shiftCoffeeUsed || state.coffeeCount <= 0;
    const bankDisabled   = state.shiftPowerBankUsed || state.powerBankCount <= 0;

    if (state.shiftCoffeeUsed) {
        useCoffeeBtn.textContent = "☕ Used this shift";
    } else {
        useCoffeeBtn.innerHTML = `☕ Coffee <span id="coffee-count">x${state.coffeeCount}</span>`;
    }
    if (state.shiftPowerBankUsed) {
        usePowerBankBtn.textContent = "🔋 Used this shift";
    } else {
        usePowerBankBtn.innerHTML = `🔋 Power Bank <span id="powerbank-count">x${state.powerBankCount}</span>`;
    }

    useCoffeeBtn.disabled = coffeeDisabled;
    usePowerBankBtn.disabled = bankDisabled;
}

useCoffeeBtn.addEventListener("click", () => {
    if (useCoffee().ok) refreshConsumableBar();
});

usePowerBankBtn.addEventListener("click", () => {
    if (usePowerBank().ok) refreshConsumableBar();
});

// ---- Start a fresh streak ----
startButton.addEventListener("click", () => {
    resetRun();
    resetShiftCounters();
    snapshotPositions();
    refreshConsumableBar();
    showGame();
    startGameLoop();
});

// ---- Next shift within a streak ----
nextShiftBtn.addEventListener("click", () => {
    startNextShift();
    resetShiftCounters();
    refreshConsumableBar();
    showGame();
    startGameLoop();
});

// ---- Shop from Shift Complete (streak preserved) ----
shiftShopBtn.addEventListener("click", () => {
    renderShop();
    showShop();
});

// ---- After death → shop ----
restartBtn.addEventListener("click", () => {
    resetOrderManager();
    resetDialogueSystem();
    renderShop();
    showShop();
});

// ---- From shop → back to start (fresh streak) ----
shopContinueBtn.addEventListener("click", () => {
    showStart();
});

refreshConsumableBar();