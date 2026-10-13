import { startGameLoop } from './src/core/GameLoop.js';
import { state, resetShiftCounters } from './src/core/State.js';
import { showGame, showStart, showShop, showConfig } from './src/ui/ScreenManager.js';
import { resetOrderManager } from './src/systems/OrderManager.js';
import { resetDialogueSystem } from './src/systems/DialogueSystem.js';
import { resetRun, startNextShift } from './src/systems/UpgradeSystem.js';
import { renderShop } from './src/ui/ShopUI.js';
import { useCoffee, usePowerBank } from './src/systems/ConsumablesSystem.js';
import { snapshotPositions } from './src/ui/ShiftCompleteUI.js';
import { showLogbook } from './src/ui/ScreenManager.js';
import { renderLogbook } from './src/ui/LogbookUI.js';
import { unlockAudio, SFX } from './src/systems/AudioManager.js';
import { preloadSprites, ASSETS } from './src/assets.js';
import { renderCareerHub } from './src/ui/CareerHubUI.js';
import { renderConfig, bindConfigListeners } from './src/ui/ConfigUI.js';

window.state = state;

preloadSprites([
    ASSETS.sprites.items.pizza_box,
    ASSETS.sprites.items.coffee_cup,
    ASSETS.sprites.items.generic_bag,
    ASSETS.sprites.characters.player_bike_pedaling
]);

// ---- DOM ----
const startButton      = document.getElementById("start-btn");
const restartBtn       = document.getElementById("restart-btn");
const shopContinueBtn  = document.getElementById("shop-continue-btn");
const nextShiftBtn     = document.getElementById("next-shift-btn");
const shiftShopBtn     = document.getElementById("shift-shop-btn");
const useCoffeeBtn     = document.getElementById("use-coffee-btn");
const usePowerBankBtn  = document.getElementById("use-powerbank-btn");
const coffeeCountEl    = document.getElementById("coffee-count");
const powerBankCountEl = document.getElementById("powerbank-count");
const logbookBtn       = document.getElementById("logbook-btn");
const logbookBackBtn   = document.getElementById("logbook-back-btn");
const shopStartBtn     = document.getElementById("shop-start-btn");
const configBtn        = document.getElementById("config-btn");
const configBackBtn    = document.getElementById("config-back-btn");

// ---- HUB HELPER ----
function goToHub() {
    renderCareerHub();
    showStart();
}

// ---- CONSUMABLES ----
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

// ---- START SHIFT ----
startButton.addEventListener("click", () => {
    unlockAudio();
    resetRun();
    resetShiftCounters();
    snapshotPositions();
    refreshConsumableBar();
    showGame();
    startGameLoop();
});

// ---- NEXT SHIFT ----
nextShiftBtn.addEventListener("click", () => {
    startNextShift();
    resetShiftCounters();
    refreshConsumableBar();
    showGame();
    startGameLoop();
});

// ---- SHOP NAV ----
shopStartBtn.addEventListener("click", () => { renderShop(); showShop(); });
shiftShopBtn.addEventListener("click", () => { renderShop(); showShop(); });
shopContinueBtn.addEventListener("click", goToHub);

// ---- DEATH → SHOP ----
restartBtn.addEventListener("click", () => {
    resetOrderManager();
    resetDialogueSystem();
    renderShop();
    showShop();
});

// ---- LOGBOOK ----
logbookBtn.addEventListener("click", () => { renderLogbook(); showLogbook(); });
logbookBackBtn.addEventListener("click", goToHub);

// ---- CONFIG ----
configBtn.addEventListener("click", () => { renderConfig(); showConfig(); });
configBackBtn.addEventListener("click", goToHub);

// Bind config listeners once, at boot
bindConfigListeners();

// ---- INITIAL RENDER ----
refreshConsumableBar();
goToHub();