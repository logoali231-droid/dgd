// 1. Imports
import { startGameLoop } from './src/core/gameLoop.js';
import { state } from './src/core/State.js';

// 2. Debug helper
window.state = state;

// 3. Grab button
const startButton = document.getElementById("start-btn");

// 4. Attach listener
startButton.addEventListener("click", () => {
    startButton.disabled = true;
    startGameLoop();
});