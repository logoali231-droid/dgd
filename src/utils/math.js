//clamp function to limit a value between a min and max
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
//  takes a big number (like 43200 seconds) and turns it into a readable string for your HUD
export function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
}