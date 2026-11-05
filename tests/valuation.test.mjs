import assert from 'node:assert/strict';
import test from 'node:test';
import { claimCategory, claimTotals, percentageAboveFair, valuationTotals } from '../src/lib/valuation.ts';

const claimItems = [
  { item: 'Tiles', claim_amount: 20400, cascade_fair: 15360 },
  { item: 'Tile Adhesive', claim_amount: 900, cascade_fair: 504 },
  { item: 'Grout', claim_amount: 250, cascade_fair: 150 },
  { item: 'Skirting', claim_amount: 960, cascade_fair: 576 },
];

test('sample valuation reconciles the direct-work baseline with the final rounded value', () => {
  const totals = valuationTotals({
    items: claimItems.map((item) => ({ amount: item.cascade_fair })),
    adjustments: { amount: 2157 },
    total_fair_value: 18750,
  });
  assert.deepEqual(totals, { subtotal: 16590, adjustment: 2157, rounding: 3, total: 18750 });
  assert.equal(totals.subtotal + totals.adjustment + totals.rounding, totals.total);
});

test('claim comparison uses direct works, excluding overheads and final rounding', () => {
  const totals = claimTotals(claimItems);
  assert.equal(totals.claim, 22510);
  assert.equal(totals.fair, 16590);
  assert.equal(totals.difference, 5920);
  assert.equal(totals.percentage.toFixed(1), '26.3');
  // Line variance percentages have a different denominator from the headline.
  assert.equal(percentageAboveFair(claimItems[1]).toFixed(1), '78.6');
});

test('rate-and-quantity issues remain discoverable under either filter category', () => {
  assert.equal(claimCategory({ flag: 'Overpriced', reason: 'Claimed 30 bags ($30/bag) vs verified theoretical coverage of 18 bags ($28/bag)' }), 'mixed');
  assert.equal(claimCategory({ flag: 'Excess Qty', reason: 'Excess quantity claimed without justification' }), 'quantity');
  assert.equal(claimCategory({ flag: 'Overpriced', reason: 'Rate higher than benchmark' }), 'rate');
});

test('zero baselines and empty submissions never produce infinite percentages', () => {
  assert.equal(percentageAboveFair({ claim_amount: 100, cascade_fair: 0 }), null);
  assert.deepEqual(claimTotals([]), { claim: 0, fair: 0, difference: 0, percentage: 0 });
});

test('rounding adjustments support cents and both directions', () => {
  assert.equal(valuationTotals({ items: [{ amount: 100 }], adjustments: { amount: 13 }, total_fair_value: 112.95 }).rounding, -0.05);
  const totals = claimTotals([{ claim_amount: 0.3, cascade_fair: 0.1 }]);
  assert.equal(totals.difference, 0.2);
});
