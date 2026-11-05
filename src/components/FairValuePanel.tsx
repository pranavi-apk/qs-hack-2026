import { ArrowRight, Calculator, FileText, Info, Layers, Scale } from 'lucide-react';
import { money, valuationTotals } from '../lib/valuation';
import type { FairValueData } from '../lib/valuation';

type Props = {
  data: FairValueData;
  variationId: string;
  onClaimCheck: () => void;
};

export default function FairValuePanel({ data, variationId, onClaimCheck }: Props) {
  if (data.items.length === 0) {
    return <section className="valuation-data-state"><FileText size={28} aria-hidden="true" /><h2>No valuation items yet</h2><p>This variation has no fair-value line items to display.</p></section>;
  }
  const totals = valuationTotals(data);
  const breakdown = Object.entries(data.rate_breakdown ?? {});

  return (
    <section className="valuation-page" aria-labelledby="fair-value-title">
      <header className="valuation-header">
        <div>
          <div className="valuation-eyebrow"><Calculator size={14} /> VARIATION VALUATION</div>
          <h2 id="fair-value-title">Fair value</h2>
          <p>The priced finishes from the impact graph. Each amount is quantity times unit rate, then preliminaries and overhead are added once.</p>
        </div>
        <span className="valuation-case-badge">{variationId}</span>
      </header>

      <div className="valuation-hero">
        <div>
          <span className="valuation-hero-label">TOTAL FAIR VALUE · HKD</span>
          <div className="valuation-hero-amount"><span>HK$</span> {money(totals.total)}</div>
          <p>Including preliminaries, overheads, profit and rounding.</p>
        </div>
        <span className="valuation-hero-icon" aria-hidden="true"><Scale size={30} strokeWidth={1.5} /></span>
      </div>

      <ol className="fv-steps">
        <li><span>1 · Measure</span><strong>From the drawing</strong><p>Quantities come from the cited drawing or bill line. Site photos are not used for these areas.</p></li>
        <li><span>2 · Rate each line</span><strong>{data.items.length} finishes lines</strong><p>Quantity times the sample rate. Direct works come to HK$ {money(totals.subtotal)}.</p></li>
        <li><span>3 · Add overhead once</span><strong>{data.adjustments.description}</strong><p>Applied to the direct-works subtotal, then rounded to the total above.</p></li>
      </ol>

      <div className="valuation-card">
        <div className="valuation-card-heading">
          <div><h3><Layers size={17} /> Valuation build-up</h3><p>Read across: what was measured, the sum, the rate, and the amount that sum produces.</p></div>
          <span className="valuation-count">{data.items.length} items</span>
        </div>
        <p className="valuation-scroll-hint">Scroll horizontally to view all columns <ArrowRight size={13} aria-hidden="true" /></p>
        <div className="valuation-table-scroll" role="region" aria-label="Fair value line items" tabIndex={0}>
          <table className="valuation-table fv-table">
            <caption className="valuation-sr-only">Fair value quantities, unit rates and amounts for {variationId}</caption>
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Where the quantity and rate come from</th>
                <th scope="col" className="valuation-number">Quantity</th>
                <th scope="col" className="valuation-number">Unit rate</th>
                <th scope="col" className="valuation-number">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={item.item}>
                  <th scope="row">
                    <div className="valuation-item">
                      <span className="valuation-item-index">{String(index + 1).padStart(2, '0')}</span>
                      <strong>{item.item}</strong>
                    </div>
                  </th>
                  <td className="fv-ref">
                    <span>Measurement rule</span>
                    <p>{item.basis || 'Not supplied'}</p>
                    <span>Document</span>
                    <p>{item.source || 'Not supplied'}</p>
                  </td>
                  <td className="valuation-number">{item.qty.toLocaleString('en-HK')} <span className="valuation-unit">{item.unit}</span></td>
                  <td className="valuation-number">{money(item.rate)}</td>
                  <td className="valuation-number">
                    <span className="fv-formula">{item.qty.toLocaleString('en-HK')} × {money(item.rate)}</span>
                    <span className="valuation-amount">{money(item.amount)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="fv-receipt">
          <div className="valuation-basis-note"><Info size={16} /><p>Drawing quantities set the scope. Photographs support milestone review later and do not change these areas.</p></div>
          <ol className="fv-sum">
            <li><span>Direct works</span><b>{money(totals.subtotal)}</b></li>
            <li><span>{data.adjustments.description}</span><b>+ {money(totals.adjustment)}</b></li>
            {totals.rounding !== 0 && <li><span>Rounding</span><b>{totals.rounding > 0 ? '+' : '−'} {money(Math.abs(totals.rounding))}</b></li>}
            <li className="fv-sum-total"><span>Total fair value</span><b>HK$ {money(totals.total)}</b></li>
          </ol>
        </div>
        <p className="valuation-footnote">Claim check compares the contractor with the direct-works figure, HK$ {money(totals.subtotal)}. It does not subtract from HK$ {money(totals.total)}, because that total already includes preliminaries and overhead.</p>
      </div>

      {breakdown.length > 0 && <div className="valuation-card valuation-rate-card">
        <div className="valuation-card-heading"><div><h3>Rate composition</h3><p>How a typical rate in this sample splits. This bar does not change the amounts in the table.</p></div></div>
        <div className="valuation-rate-bar" aria-hidden="true">{breakdown.map(([name, share]) => <span key={name} className={`valuation-rate-${name}`} style={{ flexGrow: share }} />)}</div>
        <ul className="valuation-rate-legend">{breakdown.map(([name, share]) => <li key={name}><i className={`valuation-rate-${name}`} aria-hidden="true" /><span>{name}</span><strong>{share}%</strong></li>)}</ul>
      </div>}

      <footer className="valuation-bottom-note"><span>Sample case · valuation subject to QS review</span><button type="button" className="valuation-link-button" onClick={onClaimCheck}>Compare contractor claim <ArrowRight size={15} /></button></footer>
    </section>
  );
}
