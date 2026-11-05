import { Fragment, useState } from 'react';
import { ArrowRight, ChevronDown, FileText, Info, Search, SlidersHorizontal } from 'lucide-react';
import { claimCategory, claimTotals, money, percentageAboveFair } from '../lib/valuation';
import type { ClaimData, FairValueData } from '../lib/valuation';

type Props = {
  data: ClaimData;
  fairValue: FairValueData;
  variationId: string;
  onFairValue: () => void;
  onEvidencePack: () => void;
};

const CATEGORY_LABELS = { rate: 'Rate difference', quantity: 'Quantity query', mixed: 'Rate & quantity', other: 'Review required' };

export default function ClaimCheckPanel({ data, fairValue, variationId, onFairValue, onEvidencePack }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  if (data.items.length === 0) {
    return <section className="valuation-data-state"><FileText size={28} aria-hidden="true" /><h2>No claim items yet</h2><p>This variation has no contractor claim lines to compare.</p></section>;
  }
  const totals = claimTotals(data.items);
  const flagged = data.items.filter((item) => item.claim_amount > item.cascade_fair).length;
  const visibleItems = data.items.filter((item) => {
    const category = claimCategory(item);
    const matchesFilter = filter === 'all' || (filter === 'flagged' && item.claim_amount > item.cascade_fair)
      || (filter === 'rate' && (category === 'rate' || category === 'mixed'))
      || (filter === 'quantity' && (category === 'quantity' || category === 'mixed'));
    return matchesFilter && `${item.item} ${item.reason} ${item.flag}`.toLowerCase().includes(query.toLowerCase().trim());
  });

  return (
    <section className="valuation-page" aria-labelledby="claim-check-title">
      <header className="valuation-header">
        <div><div className="valuation-eyebrow"><SlidersHorizontal size={14} /> CLAIM ASSESSMENT</div><h2 id="claim-check-title">Claim check</h2><p>Compare the contractor’s submission with the direct-work valuation.</p></div>
        <span className="valuation-case-badge">{variationId}</span>
      </header>

      <div className="valuation-stat-grid claim-summary">
        <div className="valuation-stat"><span>Contractor claim</span><strong>HK$ {money(totals.claim)}</strong><small>{data.items.length} submitted line items</small></div>
        <div className="valuation-stat"><span>Fair direct works</span><strong>HK$ {money(totals.fair)}</strong><small>Before preliminaries & OH&P</small></div>
        <div className="valuation-stat claim-stat-flag"><span>Flagged difference</span><strong>HK$ {money(totals.difference)}</strong><small>{totals.percentage.toFixed(1)}% of the contractor claim</small></div>
      </div>

      <div className="claim-assessment-note"><span className="claim-note-icon" aria-hidden="true"><Info size={18} /></span><div><strong>{flagged} of {data.items.length} lines above the fair baseline</strong><p>Review the rate and quantity differences below. Flags are assessment prompts; the QS makes the final determination.</p></div></div>

      <div className="valuation-card">
        <div className="valuation-card-heading"><div><h3>Line-by-line comparison</h3><p>Amounts in HKD · expand a line for the assessment basis</p></div><span className="valuation-count">{visibleItems.length} / {data.items.length} lines</span></div>
        <div className="claim-toolbar">
          <label className="claim-search"><Search size={16} aria-hidden="true" /><span className="valuation-sr-only">Search claim items</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search items or reasons…" /></label>
          <label className="claim-filter"><span className="valuation-sr-only">Filter claim items</span><select aria-label="Filter claim items" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All items</option><option value="flagged">Above fair value</option><option value="rate">Rate differences</option><option value="quantity">Quantity queries</option></select></label>
        </div>
        <p className="valuation-scroll-hint">Scroll horizontally to compare all columns <ArrowRight size={13} aria-hidden="true" /></p>
        <div className="valuation-table-scroll" role="region" aria-label="Contractor claim comparison" tabIndex={0}>
          <table className="valuation-table claim-table">
            <caption className="valuation-sr-only">Contractor claim compared with fair direct-work amounts for {variationId}</caption>
            <thead><tr><th scope="col">Item / assessment</th><th scope="col" className="valuation-number">Claim</th><th scope="col" className="valuation-number">Fair value</th><th scope="col" className="valuation-number">Difference</th><th scope="col"><span className="valuation-sr-only">Details</span></th></tr></thead>
            <tbody>
              {visibleItems.map((item) => {
                const category = claimCategory(item);
                const difference = item.claim_amount - item.cascade_fair;
                const percent = percentageAboveFair(item);
                const open = expanded === item.item;
                const index = data.items.indexOf(item);
                const detailId = `claim-line-${index}`;
                const reference = fairValue.items.find((line) => line.item === item.item);
                return <Fragment key={item.item}>
                  <tr className={open ? 'claim-row-expanded' : undefined}>
                    <td><strong>{item.item}</strong><span className={`claim-flag claim-flag-${difference > 0 ? category : 'neutral'}`}>{difference > 0 ? CATEGORY_LABELS[category] : 'Within baseline'}</span></td>
                    <td className="valuation-number">{money(item.claim_amount)}</td>
                    <td className="valuation-number">{money(item.cascade_fair)}</td>
                    <td className={`valuation-number valuation-amount ${difference > 0 ? 'claim-difference' : ''}`}>{difference > 0 ? '+' : difference < 0 ? '−' : ''}{money(Math.abs(difference))}<small>{percent === null ? 'No fair-rate baseline' : `${percent > 0 ? '+' : ''}${percent.toFixed(1)}% vs fair`}</small></td>
                    <td><button type="button" className="claim-expand" aria-expanded={open} aria-controls={detailId} aria-label={`${open ? 'Hide' : 'Show'} assessment for ${item.item}`} onClick={() => setExpanded(open ? null : item.item)}><ChevronDown size={17} /></button></td>
                  </tr>
                  <tr id={detailId} hidden={!open} className="claim-detail-row"><td colSpan={5}><div className="claim-detail-grid"><div><span className="valuation-detail-label">Assessment reason</span><p>{item.reason}</p><span className="claim-review-label">Pending QS review</span></div><div><span className="valuation-detail-label"><FileText size={13} /> Fair-value reference</span>{reference ? <><p><strong>{reference.qty} {reference.unit} × HK$ {money(reference.rate)}</strong></p><p>{reference.basis || 'Basis not supplied'}<br />{reference.source || 'Source not supplied'}</p></> : <p>No source reference supplied for this line.</p>}</div></div></td></tr>
                </Fragment>;
              })}
              {visibleItems.length === 0 && <tr><td colSpan={5}><div className="claim-empty"><Search size={23} /><strong>No matching items</strong><p>Try another search or reset the filters.</p><button type="button" className="valuation-link-button" onClick={() => { setQuery(''); setFilter('all'); }}>Reset filters</button></div></td></tr>}
            </tbody>
            <tfoot><tr><th scope="row">All items total</th><td className="valuation-number">{money(totals.claim)}</td><td className="valuation-number">{money(totals.fair)}</td><td className="valuation-number claim-difference">{totals.difference > 0 ? '+' : ''}{money(totals.difference)}</td><td /></tr></tfoot>
          </table>
        </div>
        <div className="claim-table-note">Line percentages use the fair amount as the baseline. The headline percentage uses the total claim. Totals include all items, even when filtered.</div>
      </div>

      <div className="valuation-card claim-reconciliation"><div><h3>Comparing the same scope</h3><p>The claim is compared against HK$ {money(totals.fair)} in direct works. The HK$ {money(fairValue.total_fair_value)} total on Fair value also includes preliminaries, OH&P and rounding.</p><button type="button" className="valuation-link-button" onClick={onFairValue}>View full valuation build-up <ArrowRight size={15} /></button></div></div>
      <footer className="valuation-bottom-note"><span>Sample case · flags and references supplied with the case</span><button type="button" className="valuation-link-button" onClick={onEvidencePack}>Open evidence pack <ArrowRight size={15} /></button></footer>
    </section>
  );
}
