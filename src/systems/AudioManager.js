/**
 * Audio system with graceful fallbacks.
 *
 * Browsers block autoplay until a user interaction occurs — call
 * unlockAudio() from a click handler (we do it in main.js).
 *
 * If an audio file is missing, the play call fails silently.
 */

import { ASSETS } from '../assets.js';
import { state } from '../core/State.js';

let unlocked = false;
const sfxCache = new Map();
let currentMusic = null;
let currentMusicPath = null;

export function unlockAudio() {
    unlocked = true;
}

function soundEnabled() {
    return state.settings ? state.settings.soundOn !== false : true;
}

export function playSFX(path, volume = 1.0) {
    if (!unlocked) return;
    if (!soundEnabled()) return;

    let base = sfxCache.get(path);
    if (!base) {
        base = new Audio(path);
        sfxCache.set(path, base);
    }
    // Clone so overlapping plays work (e.g., two dings back-to-back)
    const clone = base.cloneNode();
    clone.volume = volume;
    clone.play().catch(() => {
        // Swallow — file likely missing
    });
}

export function playMusic(path, volume = 0.4) {
    if (!soundEnabled()) return;
    if (currentMusic && currentMusicPath === path) return;
    stopMusic();

    const music = new Audio(path);
    music.loop = true;
    music.volume = volume;
    music.play().catch(() => {
        // Autoplay blocked or file missing — silent fail
    });
    currentMusic = music;
    currentMusicPath = path;
}

export function stopMusic() {
    if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
        currentMusic = null;
        currentMusicPath = null;
    }
}

/**
 * Called when the player flips the Sound toggle mid-session.
 */
export function syncAudioToSettings() {
    if (!soundEnabled()) stopMusic();
}

// Convenience shortcuts so callers don't need to import ASSETS
export const SFX = {
    orderDing:        () => playSFX(ASSETS.audio.sfx.order_ding),
    deactivationBuzz: () => playSFX(ASSETS.audio.sfx.deactivation_buzz),
    cashRegister:     () => playSFX(ASSETS.audio.sfx.cash_register),
    bikeBell:         () => playSFX(ASSETS.audio.sfx.bike_bell, 0.6),
    dogBark:          () => playSFX(ASSETS.audio.sfx.dog_bark, 0.8),
    carHorn:          () => playSFX(ASSETS.audio.sfx.car_horn, 0.7),
    phoneDyingBeep:   () => playSFX(ASSETS.audio.sfx.phone_dying_beep),
    // The Algorithm pings you. Reuses the phone-beep slot until a
    // dedicated notification sample is added to assets/audio/sfx/.
    algorithmAlert:   () => playSFX(ASSETS.audio.sfx.phone_dying_beep, 0.5)
};

export const MUSIC = {
    lofi:      () => playMusic(ASSETS.audio.music.lofi_calm, 0.35),
    tension:   () => playMusic(ASSETS.audio.music.tension_rush, 0.4),
    gameOver:  () => playMusic(ASSETS.audio.music.game_over_sad, 0.5)
};
