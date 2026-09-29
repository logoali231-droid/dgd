import { startGameLoop } from './src/core/gameLoop.js';
import { showGame, showStart } from './src/ui/ScreenManager.js';
import { resetOrderManager } from './src/systems/OrderManager.js';
import { resetDialogueSystem } from './src/systems/DialogueSystem.js';
import { state, resetShiftCounters, resetRun } from './src/core/State.js';


window.state = state;

const startButton = document.getElementById("start-btn");
const restartBtn  = document.getElementById("restart-btn");


restartBtn.addEventListener("click", () => {
    resetOrderManager();
    resetDialogueSystem();
    showStart();
});


startButton.addEventListener("click", () => {
    resetRun();          // <-- NEW
    resetShiftCounters();
    showGame();
    startGameLoop();
});