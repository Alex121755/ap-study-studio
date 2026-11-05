import test from "node:test";
import assert from "node:assert/strict";
import { calculateMarket, calculateMacro } from "../lib/economics-lab-core.ts";

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test("market equilibrium and per-unit tax wedge satisfy both inverse curves", () => {
  const market = calculateMarket({ demandIntercept: 120, supplyIntercept: 20, tax: 20 });
  assert.equal(market.untaxedQuantity, 50);
  assert.equal(market.untaxedPrice, 70);
  assert.equal(market.quantity, 40);
  assert.equal(market.buyerPrice, 80);
  assert.equal(market.sellerPrice, 60);
  assert.equal(market.buyerPrice - market.sellerPrice, 20);
  assert.equal(market.taxRevenue, 800);
  assert.equal(market.deadweightLoss, 100);
});

test("tax incidence reflects slopes, and zero tax preserves efficient equilibrium", () => {
  const untaxed = calculateMarket({ demandIntercept: 140, supplyIntercept: 20, demandSlope: 2, supplySlope: 1, tax: 0 });
  const taxed = calculateMarket({ demandIntercept: 140, supplyIntercept: 20, demandSlope: 2, supplySlope: 1, tax: 30 });
  assert.equal(untaxed.deadweightLoss, 0);
  assert.equal(untaxed.buyerPrice, untaxed.sellerPrice);
  assert.equal(taxed.quantity, 30);
  assert.equal(taxed.buyerPrice - untaxed.untaxedPrice, 20);
  assert.equal(untaxed.untaxedPrice - taxed.sellerPrice, 10);
  assert.equal(taxed.deadweightLoss, 150);
});

test("prohibitive tax and no initial gains from trade use zero quantity with no fictional transaction price", () => {
  const blocked = calculateMarket({ demandIntercept: 100, supplyIntercept: 20, tax: 100 });
  assert.equal(blocked.quantity, 0);
  assert.equal(blocked.buyerPrice, null);
  assert.equal(blocked.sellerPrice, null);
  assert.equal(blocked.taxRevenue, 0);
  assert.equal(blocked.deadweightLoss, 1600);
  const noTrade = calculateMarket({ demandIntercept: 10, supplyIntercept: 20, tax: 0 });
  assert.equal(noTrade.untaxedPrice, null);
  assert.equal(noTrade.deadweightLoss, 0);
});

test("every displayed micro control combination retains an interior equilibrium", () => {
  for (const demandIntercept of [100, 160]) for (const supplyIntercept of [10, 50]) for (const tax of [0, 40]) {
    const result = calculateMarket({ demandIntercept, supplyIntercept, tax });
    assert.ok(result.quantity > 0);
    assert.ok(result.buyerPrice <= demandIntercept);
    assert.ok(result.sellerPrice >= supplyIntercept);
    close(result.buyerPrice - result.sellerPrice, tax);
    close(result.deadweightLoss, 0.5 * tax * (result.untaxedQuantity - result.quantity));
  }
});

test("demand increase raises both equilibrium price and quantity, while higher production cost reduces quantity", () => {
  const baseline = calculateMarket({ demandIntercept: 120, supplyIntercept: 20, tax: 0 });
  const demandIncrease = calculateMarket({ demandIntercept: 140, supplyIntercept: 20, tax: 0 });
  const costIncrease = calculateMarket({ demandIntercept: 120, supplyIntercept: 40, tax: 0 });
  assert.equal(demandIncrease.quantity - baseline.quantity, 10);
  assert.equal(demandIncrease.buyerPrice - baseline.buyerPrice, 10);
  assert.equal(costIncrease.quantity - baseline.quantity, -10);
  assert.equal(costIncrease.buyerPrice - baseline.buyerPrice, 10);
});

test("AD demand expansion raises output and price level; adverse SRAS shock lowers output but raises price level", () => {
  const baseline = calculateMacro({ demandShift: 0, supplyShift: 0 });
  assert.equal(baseline.output, 100);
  assert.equal(baseline.priceLevel, 110);
  assert.equal(baseline.gapType, "at-potential");
  const expansion = calculateMacro({ demandShift: 20, supplyShift: 0 });
  assert.equal(expansion.output, 120);
  assert.equal(expansion.priceLevel, 120);
  assert.equal(expansion.gapType, "inflationary");
  const supplyShock = calculateMacro({ demandShift: 0, supplyShift: 20 });
  assert.equal(supplyShock.output, 80);
  assert.equal(supplyShock.priceLevel, 120);
  assert.equal(supplyShock.gapType, "recessionary");
  assert.equal(supplyShock.gapPercent, -20);
});

test("macro curves intersect at computed values throughout displayed controls", () => {
  for (const demandShift of [-30, 0, 30]) for (const supplyShift of [-30, 0, 30]) {
    const result = calculateMacro({ demandShift, supplyShift });
    close(result.demandIntercept - 0.5 * result.output, result.priceLevel);
    close(result.supplyIntercept + 0.5 * result.output, result.priceLevel);
    assert.ok(result.output > 0 && result.output <= 180);
    assert.ok(result.priceLevel > 0 && result.priceLevel <= 200);
  }
});

test("invalid economic parameters fail clearly instead of returning invalid graph coordinates", () => {
  for (const input of [{ demandIntercept: 120, supplyIntercept: 20, tax: -1 }, { demandIntercept: NaN, supplyIntercept: 20, tax: 0 }, { demandIntercept: 120, supplyIntercept: 20, demandSlope: 0, tax: 0 }]) assert.throws(() => calculateMarket(input), RangeError);
  for (const input of [{ demandShift: Infinity, supplyShift: 0 }, { demandShift: 0, supplyShift: 0, potentialOutput: 0 }, { demandShift: -200, supplyShift: 0 }]) assert.throws(() => calculateMacro(input), RangeError);
});
