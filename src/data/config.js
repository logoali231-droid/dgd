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

  // Energy: 100 / 238s ≈ 4 real minutes
  // Battery: 100 / 250s ≈ 4.2 real minutes
  // Both run dry BEFORE the 300s shift ends unless deliveries top you up.
  BASE_ENERGY_DRAIN: 0.42,
  BASE_BATTERY_DRAIN: 0.40,

  // Every completed delivery buys you a bite and a charge.
  // This is what makes a 12-hour shift survivable without upgrades.
  DELIVERY_ENERGY_RESTORE: 8,
  DELIVERY_BATTERY_RESTORE: 6,

  // The Algorithm is quiet for the first stretch of every shift.
  RANDOM_EVENT_GRACE: 25,

  // You are allowed to sit at 0 energy/battery this long before the
  // Algorithm can act on it (gives you time to reach for a consumable).
  COLLAPSE_GRACE_SECONDS: 6,

  // Save key
  SAVE_KEY: "dgd_save_v1",
};
