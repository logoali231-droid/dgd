import { startGameLoop } from './src/core/GameLoop.js';
import { state, resetShiftCounters } from './src/core/State.js';
import { showGame, showStart } from './src/ui/ScreenManager.js';
import { resetOrderManager } from './src/systems/OrderManager.js';
import { resetDialogueSystem } from './src/systems/DialogueSystem.js';

window.state = state;

const startButton = document.getElementById("start-btn");
const restartBtn  = document.getElementById("restart-btn");

startButton.addEventListener("click", () => {
    resetShiftCounters();
    showGame();
    startGameLoop();
});

restartBtn.addEventListener("click", () => {
    resetOrderManager();
    resetDialogueSystem();
    showStart();
});