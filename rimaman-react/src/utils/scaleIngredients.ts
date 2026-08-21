/**
 * Scales a quantity string by the given factor.
 * Handles integer and decimal numbers, leaves non-numeric text untouched.
 * Examples: "500g" × 1.5 → "750g", "2 tasses" × 2 → "4 tasses"
 */
export function scaleQuantity(quantity: string, scale: number): string {
  return quantity.replace(/(\d+(?:[.,]\d+)?)/g, (_, n: string) => {
    const value = parseFloat(n.replace(',', '.')) * scale;
    if (value % 1 === 0) return String(value);
    // Round to 1 decimal but trim trailing zero
    const rounded = Math.round(value * 10) / 10;
    return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
  });
}
