/** Inverse curves: P_D = a - bQ and P_S = c + dQ. Quantities cannot be negative. */
export type MarketInputs = {
  demandIntercept: number;
  supplyIntercept: number;
  demandSlope?: number;
  supplySlope?: number;
  tax: number;
};

function finite(value: number, name: string) {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
}

export function calculateMarket({ demandIntercept: a, supplyIntercept: c, demandSlope: b = 1, supplySlope: d = 1, tax }: MarketInputs) {
  for (const [name, value] of Object.entries({ a, b, c, d, tax })) finite(value, name);
  if (a < 0 || c < 0 || b <= 0 || d <= 0 || tax < 0) throw new RangeError("Use nonnegative intercepts and tax, and positive slopes");
  const untaxedQuantity = Math.max(0, (a - c) / (b + d));
  const quantity = Math.max(0, (a - c - tax) / (b + d));
  const untaxedPrice = untaxedQuantity > 0 ? c + d * untaxedQuantity : null;
  // With no transactions a unique transaction price is undefined.
  const buyerPrice = quantity > 0 ? a - b * quantity : null;
  const sellerPrice = quantity > 0 ? c + d * quantity : null;
  const taxRevenue = tax * quantity;
  const lostQuantity = untaxedQuantity - quantity;
  const deadweightLoss = 0.5 * (b + d) * lostQuantity ** 2;
  return { quantity, untaxedQuantity, untaxedPrice, buyerPrice, sellerPrice, taxRevenue, deadweightLoss };
}

/** Short-run inverse AD and SRAS; all quantities and price levels are teaching indices. */
export type MacroInputs = {
  demandShift: number;
  supplyShift: number;
  potentialOutput?: number;
};

export function calculateMacro({ demandShift, supplyShift, potentialOutput = 100 }: MacroInputs) {
  for (const [name, value] of Object.entries({ demandShift, supplyShift, potentialOutput })) finite(value, name);
  if (potentialOutput <= 0) throw new RangeError("Potential output must be positive");
  const demandIntercept = 160 + demandShift;
  const supplyIntercept = 60 + supplyShift;
  const output = demandIntercept - supplyIntercept;
  const priceLevel = (demandIntercept + supplyIntercept) / 2;
  if (output <= 0 || priceLevel <= 0) throw new RangeError("This model requires a positive interior equilibrium");
  const outputGap = output - potentialOutput;
  const gapPercent = outputGap / potentialOutput * 100;
  const gapType = Math.abs(outputGap) < 1e-9 ? "at-potential" : outputGap < 0 ? "recessionary" : "inflationary";
  return { demandIntercept, supplyIntercept, output, priceLevel, potentialOutput, outputGap, gapPercent, gapType };
}
