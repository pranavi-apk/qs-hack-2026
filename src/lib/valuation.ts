export type ValuationItem = {
  item: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
  basis?: string;
  source?: string;
};

export type FairValueData = {
  items: ValuationItem[];
  subtotal: number;
  adjustments: { description: string; amount: number };
  total_fair_value: number;
  rate_breakdown?: Record<string, number>;
};

export type ClaimItem = {
  item: string;
  claim_amount: number;
  cascade_fair: number;
  variance: number;
  variance_pct: number;
  flag: string;
  reason: string;
};

export type ClaimData = {
  items: ClaimItem[];
  total_claim: number;
  total_cascade_fair: number;
  total_variance: number;
  inflated_percentage: number;
};

export type VariationDetail = {
  id: string;
  title: string;
  project: string;
  fair_value_calculation: FairValueData;
  contractor_claim_adjudication: ClaimData;
};

export const money = (value: number) =>
  value.toLocaleString('en-HK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Keep reconciliation explicit: the demo total includes rounding after OH&P.
export function valuationTotals(value: FairValueData) {
  const subtotal = value.items.reduce((sum, item) => sum + item.amount, 0);
  const adjustment = value.adjustments.amount;
  const rounding = Math.round((value.total_fair_value - subtotal - adjustment) * 100) / 100;
  return { subtotal, adjustment, rounding, total: value.total_fair_value };
}

export function claimTotals(items: ClaimItem[]) {
  const claim = items.reduce((sum, item) => sum + item.claim_amount, 0);
  const fair = items.reduce((sum, item) => sum + item.cascade_fair, 0);
  const difference = Math.round((claim - fair) * 100) / 100;
  return { claim, fair, difference, percentage: claim > 0 ? (difference / claim) * 100 : 0 };
}

export function claimCategory(item: ClaimItem): 'rate' | 'quantity' | 'mixed' | 'other' {
  const quantity = /qty|quantity|coverage|claimed \d+ bags/i.test(`${item.flag} ${item.reason}`);
  const rate = /rate|overpriced|\$\d+\/bag/i.test(`${item.flag} ${item.reason}`);
  return quantity && rate ? 'mixed' : quantity ? 'quantity' : rate ? 'rate' : 'other';
}

export function percentageAboveFair(item: ClaimItem) {
  return item.cascade_fair > 0
    ? ((item.claim_amount - item.cascade_fair) / item.cascade_fair) * 100
    : null;
}
