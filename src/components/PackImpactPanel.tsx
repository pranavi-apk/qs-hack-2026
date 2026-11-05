import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Database, FileText, GitBranch } from 'lucide-react';
import type { GraphNode, ImpactGraphPayload } from './ImpactKnowledgeGraph';
import {
  anchorRectEdge,
  blastRadiusFromDoc,
  layoutPackImpactGraph,
} from '../lib/packGraphLayout';

type Props = {
  data: ImpactGraphPayload;
  uploadedNames?: string[];
  onUpload?: (files: FileList) => void;
};

function fmt(n: number) {
  return n.toLocaleString('en-HK', { maximumFractionDigits: 0 });
}

export default function PackImpactPanel({ data, uploadedNames = [], onUpload }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dims, setDims] = useState({ w: 900, h: 480 });
  const [showBq, setShowBq] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [revealed, setRevealed] = useState(3);

  const docs = useMemo(
    () => data.nodes.filter((n) => n.type === 'document'),
    [data.nodes]
  );

  const triggerDoc = docs.find((d) => d.is_trigger) ?? docs[0];

  useEffect(() => {
    if (triggerDoc) setSelectedDocId(triggerDoc.id);
  }, [triggerDoc?.id]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setDims({ w: entry.contentRect.width, h: Math.max(440, entry.contentRect.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const blast = useMemo(() => {
    if (!selectedDocId) return new Set<string>();
    return blastRadiusFromDoc(selectedDocId, data.nodes, data.links);
  }, [selectedDocId, data]);

  useEffect(() => {
    if (!selectedDocId) return;
    setRevealed(0);
    const timers = [0, 1, 2, 3].map((d) =>
      window.setTimeout(() => setRevealed(d), d * 420)
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [selectedDocId]);

  const layout = useMemo(
    () => layoutPackImpactGraph(data.nodes, data.links, dims.w, dims.h, showBq),
    [data, dims, showBq]
  );

  const nodeMap = useMemo(() => new Map(layout.nodes.map((n) => [n.id, n])), [layout.nodes]);

  const engineLabel =
    data.engine === 'neo4j' ? 'Neo4j live graph' : 'Neo4j ontology (demo store)';

  const selectedDoc = selectedDocId ? nodeMap.get(selectedDocId) : null;
  const focusNode = selectedNode ?? selectedDoc ?? null;

  const hopDepth = (id: string): number | undefined => {
    if (!selectedDocId || !blast.has(id)) return undefined;
    const n = nodeMap.get(id);
    if (!n) return undefined;
    if (n.id === selectedDocId) return 0;
    if (n.type === 'variation') return 1;
    if (n.type === 'cluster') return 2;
    if (n.type === 'bq_item') return 3;
    return undefined;
  };

  const linkActive = (l: (typeof data.links)[0]) => {
    const s = l.source as string;
    const t = l.target as string;
    if (!blast.has(s) || !blast.has(t)) return false;
    const ds = hopDepth(s);
    const dt = hopDepth(t);
    if (ds === undefined || dt === undefined) return false;
    return Math.max(ds, dt) <= revealed;
  };

  const counts = useMemo(() => {
    const clusters = [...blast].filter((id) => nodeMap.get(id)?.type === 'cluster').length;
    const bq = [...blast].filter((id) => nodeMap.get(id)?.type === 'bq_item').length;
    return { clusters, bq, total: data.stats.total };
  }, [blast, nodeMap, data.stats.total]);

  return (
    <div className="pack-impact">
      <header className="pack-impact-header">
        <div>
          <p className="pack-impact-kicker">Pack &amp; impact trace</p>
          <h2 className="pack-impact-title">How pack documents drive contract knock-on</h2>
          <p className="pack-impact-lead">
            Select a file to see blast radius: document → variation{' '}
            <strong>{data.variation_id}</strong> → trade clusters → sample BQ lines (
            <strong>{fmt(data.stats.total)}</strong> items total).
          </p>
        </div>
        <div className="pack-impact-stats">
          <span>
            <strong>{counts.clusters}</strong> clusters in view
          </span>
          <span>
            <strong>{counts.bq}</strong> BQ samples
          </span>
          <span>
            HK$ <strong>{fmt(data.stats.estimated_impact)}</strong> est. impact
          </span>
        </div>
      </header>

      <div className="pack-impact-body">
        <aside className="pack-doc-rail">
          <div className="pack-doc-rail-head">
            <span>Variation pack</span>
            {onUpload && (
              <>
                <button type="button" className="pack-doc-upload" onClick={() => fileRef.current?.click()}>
                  Add
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  hidden
                  accept=".pdf,.png,.jpg,.jpeg,.xlsx,.csv"
                  onChange={(e) => e.target.files && onUpload(e.target.files)}
                />
              </>
            )}
          </div>
          <ul className="pack-doc-list">
            {docs.map((d) => {
              const uploaded = uploadedNames.some((n) => n.includes(d.filename?.replace(/_/g, '') ?? ''));
              const active = d.id === selectedDocId;
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    className={`pack-doc-item ${active ? 'active' : ''} ${d.is_trigger ? 'trigger' : ''}`}
                    onClick={() => {
                      setSelectedDocId(d.id);
                      setSelectedNode(d);
                    }}
                  >
                    <FileText size={16} className="pack-doc-icon" />
                    <div className="pack-doc-copy">
                      <strong>{d.filename ?? d.label}</strong>
                      <span>{d.discipline}</span>
                      <span className="pack-doc-role">{d.role}</span>
                    </div>
                    {d.is_trigger ?
                      <span className="pack-doc-tag">Trigger</span>
                    : uploaded ?
                      <span className="pack-doc-tag muted">Uploaded</span>
                    : <span className="pack-doc-tag muted">Sample</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="pack-graph-wrap" ref={containerRef}>
          <div className="pack-graph-toolbar">
            <span className="pack-graph-engine">
              <Database size={14} />
              {engineLabel}
            </span>
            <button type="button" className={`pack-graph-toggle ${showBq ? 'on' : ''}`} onClick={() => setShowBq((v) => !v)}>
              {showBq ? 'Hide BQ leaves' : 'Show BQ leaves'}
            </button>
            <span className="pack-graph-hint">
              <GitBranch size={14} />
              Click a node · blast animates left → right
            </span>
          </div>

          <svg
            width="100%"
            height={layout.graphH}
            viewBox={`0 0 ${layout.graphW} ${layout.graphH}`}
            className="pack-graph-svg"
          >
            {layout.links.map((link) => {
              const a = nodeMap.get(link.source as string);
              const b = nodeMap.get(link.target as string);
              if (!a || !b) return null;
              const active = linkActive(link);
              const { x1, y1, x2, y2 } = anchorRectEdge(a.x, a.y, a.w, a.h, b.x, b.y, b.w, b.h);
              const stroke =
                link.type === 'triggers' ? '#0f766e'
                : link.type === 'supports' ? '#14b8a6'
                : link.type === 'cites' ? '#94a3b8'
                : link.type === 'direct' ? '#115e59'
                : link.type === 'indirect_2hop' ? '#d97706'
                : '#94a3b8';
              return (
                <line
                  key={`${link.source}-${link.target}-${link.type}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={stroke}
                  strokeWidth={active ? 2.2 : 1}
                  strokeOpacity={active ? 0.85 : 0.2}
                  strokeDasharray={link.type === 'cites' || link.type === 'supports' ? '5 4' : undefined}
                />
              );
            })}

            {layout.nodes.map((node) => {
              const depth = hopDepth(node.id);
              const inBlast = depth !== undefined && depth <= revealed;
              const idle = selectedDocId && !inBlast;
              const x = node.x - node.w / 2;
              const y = node.y - node.h / 2;

              const fill =
                node.type === 'document' ? '#f0fdfa'
                : node.type === 'variation' ? '#0b1f17'
                : node.type === 'cluster' ? '#ecfdf5'
                : '#f1f5f9';
              const stroke =
                node.id === (selectedNode?.id ?? selectedDocId) ? '#14b8a6'
                : inBlast && node.type === 'cluster' ? '#0f766e'
                : inBlast ? '#5eead4'
                : '#cfe3da';

              return (
                <g
                  key={node.id}
                  transform={`translate(${x},${y})`}
                  className="pack-graph-node"
                  onClick={() => setSelectedNode(node)}
                  role="button"
                  tabIndex={0}
                  opacity={idle ? 0.35 : 1}
                >
                  <rect
                    width={node.w}
                    height={node.h}
                    rx={node.type === 'variation' ? 12 : 8}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={node.type === 'variation' ? 2.5 : 1.5}
                  />
                  {node.type === 'document' && (
                    <>
                      <text x={10} y={16} fontSize={9} fontWeight={700} fill="#5b7368">
                        {(node.discipline ?? 'DOC').toUpperCase()}
                      </text>
                      <text x={10} y={34} fontSize={11} fontWeight={700} fill="#0b1f17">
                        {node.label}
                      </text>
                    </>
                  )}
                  {node.type === 'variation' && (
                    <>
                      <text x={node.w / 2} y={22} textAnchor="middle" fontSize={10} fontWeight={700} fill="#5eead4">
                        VARIATION
                      </text>
                      <text x={node.w / 2} y={40} textAnchor="middle" fontSize={11} fontWeight={700} fill="#ffffff">
                        {node.label.replace('\n', ' ')}
                      </text>
                      <text x={node.w / 2} y={54} textAnchor="middle" fontSize={9} fill="#99f6e4">
                        {node.count} BQ lines
                      </text>
                    </>
                  )}
                  {node.type === 'cluster' && (
                    <>
                      <text x={node.w / 2} y={20} textAnchor="middle" fontSize={10} fontWeight={700} fill="#115e59">
                        {node.label.length > 14 ? `${node.label.slice(0, 12)}…` : node.label}
                      </text>
                      <text x={node.w / 2} y={36} textAnchor="middle" fontSize={9} fill="#0f766e">
                        ({node.count}) lines
                      </text>
                    </>
                  )}
                  {node.type === 'bq_item' && (
                    <text x={node.w / 2} y={node.h / 2 + 3} textAnchor="middle" fontSize={8} fontWeight={600} fill="#334155">
                      {node.label.slice(0, 18)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          <div className="pack-graph-footer">
            {selectedDoc ?
              <>Epicentre · {selectedDoc.filename ?? selectedDoc.label} → {counts.clusters} clusters · {counts.bq} BQ samples</>
            : 'Select a pack document'}
          </div>
        </div>
      </div>

      {focusNode && (
        <div className="pack-impact-detail">
          <strong>{focusNode.filename ?? focusNode.label}</strong>
          <span>{focusNode.role ?? focusNode.type}</span>
          {focusNode.type === 'cluster' && focusNode.items?.length ?
            <ul>
              {focusNode.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          : null}
          {focusNode.type === 'document' && focusNode.cluster_ids?.length ?
            <p>
              Supports knock-on clusters:{' '}
              <em>{focusNode.cluster_ids.join(', ')}</em>
            </p>
          : null}
        </div>
      )}
    </div>
  );
}
