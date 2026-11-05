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
          <p>Review the quantities, rates and build-up behind this variation.</p>
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

      <div className="valuation-stat-grid">
        <div className="valuation-stat"><span>Direct works</span><strong>HK$ {money(totals.subtotal)}</strong><small>{data.items.length} valuation items</small></div>
        <div className="valuation-stat"><span>Preliminaries & OH&P</span><strong>HK$ {money(totals.adjustment)}</strong><small>{data.adjustments.description}</small></div>
        <div className="valuation-stat"><span>Measurement basis</span><strong className="valuation-stat-text">HKSMM4</strong><small>References shown with each item</small></div>
      </div>

      <div className="valuation-card">
        <div className="valuation-card-heading">
          <div><h3><Layers size={17} /> Valuation build-up</h3><p>Amounts in HKD · quantities and rates from the sample case</p></div>
          <span className="valuation-count">{data.items.length} items</span>
        </div>
        <p className="valuation-scroll-hint">Scroll horizontally to view all columns <ArrowRight size={13} aria-hidden="true" /></p>
        <div className="valuation-table-scroll" role="region" aria-label="Fair value line items" tabIndex={0}>
          <table className="valuation-table">
            <caption className="valuation-sr-only">Fair value quantities, unit rates and amounts for {variationId}</caption>
            <thead><tr><th scope="col">Item & reference</th><th scope="col" className="valuation-number">Quantity</th><th scope="col" className="valuation-number">Unit rate</th><th scope="col" className="valuation-number">Amount</th></tr></thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={item.item}>
                  <td><div className="valuation-item"><span className="valuation-item-index">{String(index + 1).padStart(2, '0')}</span><div><strong>{item.item}</strong><details className="valuation-source"><summary><FileText size={12} /> View basis & source</summary><div><span>Basis</span><p>{item.basis || 'Not supplied'}</p><span>Source reference</span><p>{item.source || 'Not supplied'}</p></div></details></div></div></td>
                  <td className="valuation-number">{item.qty.toLocaleString('en-HK')} <span className="valuation-unit">{item.unit}</span></td>
                  <td className="valuation-number">{money(item.rate)}</td>
                  <td className="valuation-number valuation-amount">{money(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="valuation-buildup-footer">
          <div className="valuation-basis-note"><Info size={16} /><p>Drawing quantities establish the scope. Site photographs support milestone review and are not the basis of this quantity takeoff.</p></div>
          <dl className="valuation-totals">
            <div><dt>Direct works subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
            <div><dt>{data.adjustments.description}</dt><dd>{money(totals.adjustment)}</dd></div>
            {totals.rounding !== 0 && <div><dt>Rounding adjustment</dt><dd>{totals.rounding > 0 ? '+' : '−'}{money(Math.abs(totals.rounding))}</dd></div>}
            <div className="valuation-total-final"><dt>Total fair value</dt><dd>HK$ {money(totals.total)}</dd></div>
          </dl>
        </div>
      </div>

      {breakdown.length > 0 && <div className="valuation-card valuation-rate-card">
        <div className="valuation-card-heading"><div><h3>Rate composition</h3><p>Indicative allocation supplied with the sample case</p></div></div>
        <div className="valuation-rate-bar" aria-hidden="true">{breakdown.map(([name, share]) => <span key={name} className={`valuation-rate-${name}`} style={{ flexGrow: share }} />)}</div>
        <ul className="valuation-rate-legend">{breakdown.map(([name, share]) => <li key={name}><i className={`valuation-rate-${name}`} aria-hidden="true" /><span>{name}</span><strong>{share}%</strong></li>)}</ul>
      </div>}

      <footer className="valuation-bottom-note"><span>Sample case · valuation subject to QS review</span><button type="button" className="valuation-link-button" onClick={onClaimCheck}>Compare contractor claim <ArrowRight size={15} /></button></footer>
    </section>
  );
}
