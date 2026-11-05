import { useState } from 'react';
import { GitBranch } from 'lucide-react';
import ImpactKnowledgeGraph, { type GraphNode, type ImpactGraphPayload } from './ImpactKnowledgeGraph';

type Props = {
  data: ImpactGraphPayload;
  /** When nested under Pack & impact, skip duplicate page header and radial graph. */
  embedMode?: boolean;
  showGraph?: boolean;
};

const WHY: Record<string, string> = {
  finishes: 'The new floor and walls are larger, so finishes are remeasured. Fair value prices this group.',
  reinforcement: 'The extended slab and its edge need more bar and mesh.',
  mep: 'Lights, floor drainage and ducts have to follow the new footprint.',
  doors_frames: 'The entrance door and its frame move toward gridline E.',
  formwork: 'The added bay needs new soffit formwork and edge shutters.',
  columns: 'Edge columns, the casing and the movement joint are redrawn.',
};

const PRICED = /tile|skirting/i;

export default function ImpactTracePanel({ data, embedMode = false, showGraph = true }: Props) {
  const clusters = data.nodes.filter((node) => node.type === 'cluster');
  const [selectedId, setSelectedId] = useState<string | null>(clusters[0]?.id ?? null);
  const activeId = selectedId?.split('__')[0] ?? null;

  const select = (node: GraphNode | null) => setSelectedId(node?.id ?? null);

  return (
    <section className={`impact-page ${embedMode ? 'impact-page--embed' : ''}`} aria-labelledby={embedMode ? undefined : 'impact-title'}>
      {!embedMode && (
      <header className="valuation-header">
        <div>
          <div className="valuation-eyebrow"><GitBranch size={14} /> IMPACT TRACE</div>
          <h2 id="impact-title">What the lobby change touches</h2>
          <p>
            One instruction, “increase the lobby by 20%”, is the centre. Each ring is a trade it reaches directly.
            The table under the picture is the same list, with the reason each trade is included.
          </p>
        </div>
        <span className="valuation-case-badge">{data.variation_id}</span>
      </header>
      )}

      {embedMode && (
        <header className="impact-embed-head">
          <h3>Trade knock-on (read-out)</h3>
          <p>Same 263-item trace as the graph above — why each direct trade is in scope and which lines feed Fair value.</p>
        </header>
      )}

      <div className="impact-stats">
        <article>
          <span>Direct</span>
          <strong>{data.stats.direct}</strong>
          <p>Items in the six trades drawn here. The instruction changes them itself.</p>
        </article>
        <article>
          <span>Two steps away</span>
          <strong>{data.stats.indirect_2hop}</strong>
          <p>Knock-on items linked through a direct trade. These are counted, not all drawn.</p>
        </article>
        <article>
          <span>Three steps away</span>
          <strong>{data.stats.indirect_3hop}</strong>
          <p>A further consequence, such as preliminaries or another trade.</p>
        </article>
        <article className="impact-stat-total">
          <span>All affected items</span>
          <strong>{data.stats.total}</strong>
          <p>{data.stats.direct} + {data.stats.indirect_2hop} + {data.stats.indirect_3hop}. Fair value prices the finishes lines only.</p>
        </article>
      </div>

      {showGraph && (
      <ImpactKnowledgeGraph
        data={data}
        lang="en"
        selectedId={selectedId}
        onSelectNode={select}
      />
      )}

      <div className="valuation-card">
        <div className="valuation-card-heading">
          <div>
            <h3>Direct trades</h3>
            <p>Click a row or a circle. Sample lines are examples inside that trade, not the full {data.stats.total}.</p>
          </div>
          <span className="valuation-count">{clusters.length} trades</span>
        </div>
        <div className="valuation-table-scroll" role="region" aria-label="Trades affected by the variation" tabIndex={0}>
          <table className="valuation-table impact-table">
            <caption className="valuation-sr-only">Direct trades affected by {data.variation_id}, why each is included, and sample bill lines</caption>
            <thead>
              <tr>
                <th scope="col">Trade</th>
                <th scope="col">Why it is affected</th>
                <th scope="col">Sample lines</th>
                <th scope="col" className="valuation-number">Items</th>
              </tr>
            </thead>
            <tbody>
              {clusters.map((cluster) => {
                const selected = cluster.id === activeId;
                return (
                  <tr
                    key={cluster.id}
                    className={selected ? 'is-selected' : undefined}
                    aria-selected={selected}
                    tabIndex={0}
                    onClick={() => select(cluster)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        select(cluster);
                      }
                    }}
                  >
                    <th scope="row">{cluster.label.replace(/\n/g, ' ')}</th>
                    <td>{WHY[cluster.id] ?? 'Reached in one step from the variation instruction.'}</td>
                    <td>
                      <ul className="impact-lines">
                        {(cluster.items ?? []).map((item) => (
                          <li key={item}>
                            {item}
                            {cluster.id === 'finishes' && PRICED.test(item) && <em>Priced on Fair value</em>}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="valuation-number">{cluster.count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="valuation-footnote">
          Floor tiles and skirting are the lines that reappear on Fair value. Adhesive and grout are priced there too, because they follow the tile quantity. Reinforcement, MEP, doors, formwork and columns are traced so they are not forgotten. This sample does not build a rate for them.
        </p>
      </div>
    </section>
  );
}
