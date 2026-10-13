import { state, saveMeta } from '../core/State.js';

export function isSoundOn()      { return state.settings.soundOn; }
export function isVibrationOn()  { return state.settings.vibrationOn; }

export function toggleSound() {
    state.settings.soundOn = !state.settings.soundOn;
    saveMeta();
    return state.settings.soundOn;
}

export function toggleVibration() {
    state.settings.vibrationOn = !state.settings.vibrationOn;
    saveMeta();
    return state.settings.vibrationOn;
}