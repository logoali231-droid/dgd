

const startScreen = document.getElementById('screen-start');
const deactivatedScreen = document.getElementById('screen-deactivated');
const restartBtn = document.getElementById('restart-btn');
const deactivatedReasonEl = document.getElementById("deactivated-reason");
const deactivatedTextEl = document.getElementById("deactivated-text");
const gameScreen = document.getElementById("screen-game");

const screens = [startScreen, gameScreen, deactivatedScreen];
function showScreen(target) {
    for (let i = 0; i < screens.length; i++) {
        screens[i].classList.add("hidden")
    }

    if (target === "start")
        startScreen.classList.remove("hidden")
    else if (target === "deactivated") {   
        deactivatedScreen.classList.remove("hidden")
    // future: else if target === "game": gameScreen.classList.remove("hidden")
} else if (target === "game") {
    gameScreen.classList.remove("hidden");
}
}
export function showStart() {
    showScreen("start");
}

export function showDeactivated() {
    showScreen("deactivated");
}

export function showGame() {
    showScreen("game");   // Does nothing visible yet — no game screen exists
}

export function triggerDeactivation(reason) {
    deactivatedReasonEl.textContent = `Reason: ${reason.id}`;
    deactivatedTextEl.textContent = reason.text;
    showDeactivated();
}