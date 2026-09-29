import { CONFIG } from '../data/config.js';

const defaultSave = {
    savedTips: 0,
    ownedUpgrades: [],
    logbookEntries: [],
    totalShiftsSurvived: 0,
    bestRating: 5.0,
    survivalMap: {},
    discoveredPositions: []
};

export const Persistence = {
    load() {
        try {
            const raw = localStorage.getItem(CONFIG.SAVE_KEY);
            if (!raw) return { ...defaultSave };
            return { ...defaultSave, ...JSON.parse(raw) };
        } catch (e) {
            console.warn("Save file corrupted. Starting fresh.");
            return { ...defaultSave };
        }
    },
    save(data) {
        localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(data));
    },
    reset() {
        localStorage.removeItem(CONFIG.SAVE_KEY);
    }
};