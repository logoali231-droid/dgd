/**
 * Central manifest for every game asset.
 * 
 * Why a single file? So when you swap from mock to real, you only change
 * paths here — nothing else in the codebase needs to know.
 * 
 * Usage:
 *   import { ASSETS, loadSprite, getSprite } from './assets.js';
 *   await loadSprite(ASSETS.sprites.items.item_pizza_box);
 *   const img = getSprite(ASSETS.sprites.items.item_pizza_box);
 *   if (img) someElement.src = img.src;
 *   else      someElement.textContent = "🍕";  // emoji fallback
 */

const BASE = "assets";

export const ASSETS = {
    // ==================== SPRITES ====================
    sprites: {
        characters: {
            player_bike_idle:     `${BASE}/sprites/characters/player_bike_idle.png`,
            player_bike_pedaling: `${BASE}/sprites/characters/player_bike_pedaling.png`,
            player_walking_tired: `${BASE}/sprites/characters/player_walking_tired.png`,
            player_fainted:       `${BASE}/sprites/characters/player_fainted.png`,
            npc_courier_friend:   `${BASE}/sprites/characters/npc_courier_friend.png`
        },
        customers: {
            happy:        `${BASE}/sprites/customers/customer_happy.png`,
            impatient:    `${BASE}/sprites/customers/customer_impatient.png`,
            drunk:        `${BASE}/sprites/customers/customer_drunk.png`,
            ghost_door:   `${BASE}/sprites/customers/customer_ghost_door.png`,
            perfectionist:`${BASE}/sprites/customers/customer_perfectionist.png`
        },
        hazards: {
            car_door:         `${BASE}/sprites/hazards/hazard_car_door.png`,
            stray_dog:        `${BASE}/sprites/hazards/hazard_stray_dog.png`,
            pothole:          `${BASE}/sprites/hazards/hazard_pothole.png`,
            construction_cone:`${BASE}/sprites/hazards/hazard_construction_cone.png`,
            rain_cloud:       `${BASE}/sprites/hazards/hazard_rain_cloud.png`
        },
        items: {
            pizza_box:       `${BASE}/sprites/items/item_pizza_box.png`,
            soup_container:  `${BASE}/sprites/items/item_soup_container.png`,
            coffee_cup:      `${BASE}/sprites/items/item_coffee_cup.png`,
            milkshake:       `${BASE}/sprites/items/item_milkshake.png`,
            generic_bag:     `${BASE}/sprites/items/item_generic_bag.png`,
            phone_dead:      `${BASE}/sprites/items/item_phone_dead.png`,
            power_bank:      `${BASE}/sprites/items/item_power_bank.png`
        },
        ui: {
            star_full:        `${BASE}/sprites/ui/ui_star_full.png`,
            star_empty:       `${BASE}/sprites/ui/ui_star_empty.png`,
            battery_icon:     `${BASE}/sprites/ui/ui_battery_icon.png`,
            energy_icon:      `${BASE}/sprites/ui/ui_energy_icon.png`,
            cash_icon:        `${BASE}/sprites/ui/ui_cash_icon.png`,
            button_apologize: `${BASE}/sprites/ui/ui_button_apologize.png`
        },
        logbook: {
            soup_warm:       `${BASE}/sprites/logbook/log_pixel_soup_warm.png`,
            dog_stealing:    `${BASE}/sprites/logbook/log_pixel_dog_stealing.png`,
            taco_crash:      `${BASE}/sprites/logbook/log_pixel_taco_crash.png`,
            pizza_face_down: `${BASE}/sprites/logbook/log_pixel_pizza_face_down.png`,
            phone_died:      `${BASE}/sprites/logbook/log_pixel_phone_died.png`
        },
        backgrounds: {
            city_map_day:       `${BASE}/sprites/backgrounds/bg_city_map_day.png`,
            city_map_night:     `${BASE}/sprites/backgrounds/bg_city_map_night.png`,
            apartment_hallway:  `${BASE}/sprites/backgrounds/bg_apartment_hallway.png`,
            shop_menu:          `${BASE}/sprites/backgrounds/bg_shop_menu.png`
        }
    },

    // ==================== AUDIO ====================
    audio: {
        sfx: {
            order_ding:        `${BASE}/audio/sfx/sfx_order_ding.wav`,
            deactivation_buzz: `${BASE}/audio/sfx/sfx_deactivation_buzz.wav`,
            cash_register:     `${BASE}/audio/sfx/sfx_cash_register.wav`,
            bike_bell:         `${BASE}/audio/sfx/sfx_bike_bell.wav`,
            dog_bark:          `${BASE}/audio/sfx/sfx_dog_bark.wav`,
            car_horn:          `${BASE}/audio/sfx/sfx_car_horn.wav`,
            phone_dying_beep:  `${BASE}/audio/sfx/sfx_phone_dying_beep.wav`
        },
        music: {
            lofi_calm:     `${BASE}/audio/music/music_lofi_calm.ogg`,
            tension_rush:  `${BASE}/audio/music/music_tension_rush.ogg`,
            game_over_sad: `${BASE}/audio/music/music_game_over_sad.ogg`
        }
    }
};

// ============================================================
// SPRITE LOADER — caches by URL, resolves to null on failure
// ============================================================
const _imageCache = new Map();

export function loadSprite(path) {
    if (_imageCache.has(path)) {
        return Promise.resolve(_imageCache.get(path));
    }
    return new Promise(resolve => {
        const img = new Image();
        img.onload  = () => { _imageCache.set(path, img);  resolve(img);  };
        img.onerror = () => { _imageCache.set(path, null); resolve(null); };
        img.src = path;
    });
}

export function getSprite(path) {
    return _imageCache.get(path) || null;
}

/**
 * Preload a list of sprite paths in parallel. Safe to call even if
 * files don't exist — missing ones silently resolve to null.
 */
export function preloadSprites(paths) {
    return Promise.all(paths.map(loadSprite));
}