export const CONFIG = {
  // Factory defaults
  DEFAULT_RATING: 5.0,
  DEFAULT_ENERGY: 100,
  DEFAULT_BATTERY: 100,
  DEFAULT_CASH: 0,
  DEFAULT_SHIFT_TIME: 12 * 60 * 60, // 12 in-game hours (in game-seconds)

  // 12 game hours (43200s) / 300 real seconds = 5 real minutes per shift
  TIME_SCALE: 144,

  // Dialogue gating
  DIALOGUE_UNLOCK_AFTER_REAL_SECONDS: 45,
  DIALOGUE_MIN_DELIVERIES: 1,
  DIALOGUE_COOLDOWN_MIN: 15,
  DIALOGUE_COOLDOWN_MAX: 30,

  // Energy: 100 / 180s = 3 real minutes
  // Battery: 100 / 150s = 2.5 real minutes
  BASE_ENERGY_DRAIN: 0.5556,
  BASE_BATTERY_DRAIN: 0.6667,

  // Save key
  SAVE_KEY: "dgd_save_v1",
};
