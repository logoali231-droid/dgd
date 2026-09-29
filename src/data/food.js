/**
 * Food types with their own behavior.
 *
 * coldTime     — Real seconds until the food starts losing rating value.
 *                Shorter = riskier delivery.
 * payMultiplier — Higher for riskier foods. Ice cream pays more because
 *                 it's terrifying to deliver.
 *
 * Emojis are placeholders — later these get replaced with pixel art sprites.
 */
export const FOODS = [
  {
    id: "icecream",
    name: "Ice Cream",
    emoji: "🍦",
    coldTime: 20,
    payMultiplier: 1.5,
  },
  {
    id: "coffee",
    name: "Coffee",
    emoji: "☕",
    coldTime: 25,
    payMultiplier: 0.9,
  },
  {
    id: "milkshake",
    name: "Milkshake",
    emoji: "🥤",
    coldTime: 30,
    payMultiplier: 1.3,
  },
  { id: "ramen", name: "Ramen", emoji: "🍜", coldTime: 30, payMultiplier: 1.3 },
  { id: "sushi", name: "Sushi", emoji: "🍣", coldTime: 35, payMultiplier: 1.4 },
  { id: "soup", name: "Soup", emoji: "🍲", coldTime: 40, payMultiplier: 1.1 },
  { id: "fries", name: "Fries", emoji: "🍟", coldTime: 45, payMultiplier: 0.9 },
  { id: "tacos", name: "Tacos", emoji: "🌮", coldTime: 50, payMultiplier: 1.1 },
  {
    id: "burger",
    name: "Burger",
    emoji: "🍔",
    coldTime: 60,
    payMultiplier: 1.2,
  },
  {
    id: "donut",
    name: "Donuts",
    emoji: "🍩",
    coldTime: 65,
    payMultiplier: 0.8,
  },
  { id: "salad", name: "Salad", emoji: "🥗", coldTime: 70, payMultiplier: 1.0 },
  { id: "pizza", name: "Pizza", emoji: "🍕", coldTime: 75, payMultiplier: 1.0 },
];

export function getRandomFood() {
  return FOODS[Math.floor(Math.random() * FOODS.length)];
}
