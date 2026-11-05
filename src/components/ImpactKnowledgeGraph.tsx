import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Database, GitBranch } from 'lucide-react';
import { anchorEdge, layoutImpactGraph } from '../lib/impactGraphLayout';

export type GraphNode = {
  id: string;
  label: string;
  type: 'variation' | 'cluster' | 'bq_item' | 'document';
  hop: number;
  count: number;
  size?: number;
  items?: string[];
  filename?: string;
  discipline?: string;
  role?: string;
  is_trigger?: boolean;
  cluster_ids?: string[];
};

export type GraphLink = {
  source: string;
  target: string;
  hop: number;
  type: string;
  label?: string;
};

export type ImpactGraphPayload = {
  variation_id: string;
  engine: string;
  engine_note?: string;
  documents?: {
    id: string;
    label: string;
    filename: string;
    discipline: string;
    role: string;
    is_trigger?: boolean;
    cluster_ids?: string[];
  }[];
  nodes: GraphNode[];
  links: GraphLink[];
  stats: {
    total: number;
    direct: number;
    indirect_2hop: number;
    indirect_3hop: number;
    estimated_impact: number;
  };
};

const LINK_STROKE: Record<string, { color: string; width: number; dash?: string }> = {
  direct: { color: '#1A3D32', width: 2.5 },
  indirect_2hop: { color: '#B45309', width: 1.8, dash: '7 5' },
  indirect_3hop: { color: '#94A3B8', width: 1.4, dash: '2 5' },
  triggers: { color: '#0f766e', width: 2.2 },
  cites: { color: '#64748b', width: 1.6, dash: '4 4' },
  supports: { color: '#14b8a6', width: 1.5, dash: '3 5' },
};

type Props = {
  data: ImpactGraphPayload;
  lang: string;
  onSelectNode: (node: GraphNode | null) => void;
  selectedId: string | null;
};

export default function ImpactKnowledgeGraph({ data, lang, onSelectNode, selectedId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 720, h: 520 });
  const [showLeaves, setShowLeaves] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setDims({
        w: entry.contentRect.width,
        h: Math.max(480, entry.contentRect.height),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { nodes, links } = useMemo(
    () => layoutImpactGraph(data.nodes, data.links, dims.w, dims.h, showLeaves),
    [data, dims, showLeaves]
  );

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const engineLabel =
    data.engine === 'neo4j' ?
      lang === 'en' ?
        'Neo4j live graph'
      : lang === 'zh-HK' ?
        'Neo4j 即時圖譜'
      : 'Neo4j 实时图谱'
    : lang === 'en' ?
      'Neo4j ontology (demo store)'
    : lang === 'zh-HK' ?
      'Neo4j 本體模型（演示存儲）'
    : 'Neo4j 本体模型（演示存储）';

  const cx = dims.w / 2;
  const cy = dims.h / 2;
  const orbit = Math.min(dims.w, dims.h) / 2 - 96;

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[520px] rounded-2xl overflow-hidden border border-[#DFDAC8] bg-[#F5F2E9] shadow-inner"
    >
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#1A3D32 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />

      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide bg-white/95 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg shadow-sm">
          <Database className="w-3.5 h-3.5 text-emerald-700" />
          {engineLabel}
        </span>
        <button
          type="button"
          onClick={() => setShowLeaves((v) => !v)}
          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
            showLeaves ?
              'bg-amber-100 border-amber-300 text-amber-900'
            : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
          }`}
        >
          {showLeaves ?
            lang === 'en' ?
              'Hide BQ items'
            : lang === 'zh-HK' ?
              '隱藏 BQ 項'
            : '隐藏 BQ 项'
          : lang === 'en' ?
            'Show 2-hop BQ items'
          : lang === 'zh-HK' ?
            '顯示 2-hop BQ 項'
          : '显示 2-hop BQ 项'}
        </button>
      </div>

      <svg width={dims.w} height={dims.h} className="block select-none">
        {/* Orbit guides */}
        <circle
          cx={cx}
          cy={cy}
          r={orbit}
          fill="none"
          stroke="#1A3D32"
          strokeOpacity={0.12}
          strokeWidth={1}
          strokeDasharray="6 8"
        />
        <circle cx={cx} cy={cy} r={orbit * 0.45} fill="none" stroke="#3CB371" strokeOpacity={0.1} strokeWidth={1} />

        {/* Edges */}
        {links.map((link) => {
          const sid = typeof link.source === 'string' ? link.source : link.source;
          const tid = typeof link.target === 'string' ? link.target : link.target;
          const a = nodeMap.get(sid as string);
          const b = nodeMap.get(tid as string);
          if (!a || !b) return null;
          const { x1, y1, x2, y2 } = anchorEdge(a.x, a.y, a.r, b.x, b.y, b.r);
          const style = LINK_STROKE[link.type] ?? LINK_STROKE.direct;
          return (
            <line
              key={`${sid}-${tid}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={style.color}
              strokeWidth={style.width}
              strokeDasharray={style.dash}
              strokeLinecap="round"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const selected = node.id === selectedId;
          const fill =
            node.type === 'variation' ? '#142B23'
            : node.type === 'cluster' ? '#FFF2DE'
            : '#E2E8F0';
          const stroke =
            selected ? '#3CB371'
            : node.type === 'cluster' ? '#D97706'
            : node.type === 'variation' ? '#3CB371'
            : '#64748B';
          const strokeW = selected ? 3.5 : node.type === 'variation' ? 3 : 2.5;

          const title = node.label.split('\n');

          return (
            <g
              key={node.id}
              className="cursor-pointer"
              onClick={() => onSelectNode(node)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectNode(node)}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={node.r}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeW}
                className="transition-all duration-200"
                filter={selected ? 'url(#glow)' : undefined}
              />
              {node.type === 'variation' && (
                <>
                  <text
                    x={node.x}
                    y={node.y - 8}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={11}
                    fontWeight={700}
                  >
                    {title[0]}
                  </text>
                  {title[1] && (
                    <text x={node.x} y={node.y + 6} textAnchor="middle" fill="#a7f3d0" fontSize={10} fontWeight={600}>
                      {title[1]}
                    </text>
                  )}
                  <text x={node.x} y={node.y + 22} textAnchor="middle" fill="#6ee7b7" fontSize={9} fontFamily="monospace">
                    {node.count} items
                  </text>
                </>
              )}
              {node.type === 'cluster' && (
                <>
                  <text
                    x={node.x}
                    y={node.y - 4}
                    textAnchor="middle"
                    fill="#78350f"
                    fontSize={10}
                    fontWeight={700}
                  >
                    {title.join(' ').length > 16 ? `${title.join(' ').slice(0, 14)}…` : title.join(' ')}
                  </text>
                  <text x={node.x} y={node.y + 12} textAnchor="middle" fill="#92400e" fontSize={10} fontFamily="monospace">
                    ({node.count})
                  </text>
                </>
              )}
              {node.type === 'bq_item' && (
                <text x={node.x} y={node.y + 3} textAnchor="middle" fill="#334155" fontSize={7} fontWeight={600}>
                  {node.label.slice(0, 20)}
                </text>
              )}
            </g>
          );
        })}

        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#3CB371" floodOpacity="0.45" />
          </filter>
        </defs>
      </svg>

      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur px-3 py-2 rounded-xl border border-slate-200 text-[10px] flex flex-wrap gap-3 shadow-sm">
        <span className="flex items-center text-slate-700">
          <span className="w-5 h-0.5 bg-[#1A3D32] mr-1.5 rounded" />
          {lang === 'en' ? 'AFFECTS (1-hop)' : lang === 'zh-HK' ? 'AFFECTS (1-hop)' : 'AFFECTS (1-hop)'}
        </span>
        <span className="flex items-center text-slate-700">
          <span className="w-5 h-0.5 border-b-2 border-dashed border-amber-600 mr-1.5" />
          IMPLIES (2-hop)
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10 text-[10px] text-slate-500 hidden md:flex items-center gap-1">
        <GitBranch className="w-3.5 h-3.5 text-emerald-700" />
        {lang === 'en' ? 'Click a cluster for BQ detail' : lang === 'zh-HK' ? '點擊分類查看 BQ 明細' : '点击分类查看 BQ 明细'}
      </div>
    </div>
  );
}
