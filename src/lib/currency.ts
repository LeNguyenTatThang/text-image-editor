export const CURRENCY_UNITS = ["₩", "won", "KRW"] as const;

export function randomCurrency(): string {
  return CURRENCY_UNITS[Math.floor(Math.random() * CURRENCY_UNITS.length)];
}
