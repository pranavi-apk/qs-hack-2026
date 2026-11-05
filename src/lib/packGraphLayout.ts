import dagre from '@dagrejs/dagre';
import type { GraphLink, GraphNode } from '../components/ImpactKnowledgeGraph';

export type LayoutNode = GraphNode & { x: number; y: number; w: number; h: number };

const NODE_DIM: Record<string, { w: number; h: number }> = {
  document: { w: 118, h: 54 },
  variation: { w: 132, h: 64 },
  cluster: { w: 108, h: 50 },
  bq_item: { w: 96, h: 36 },
};

/** Left-to-right pack → variation → knock-on (Keystone / Neo4j-style layered graph). */
export function layoutPackImpactGraph(
  nodes: GraphNode[],
  links: GraphLink[],
  width: number,
  height: number,
  showBqLeaves: boolean
): { nodes: LayoutNode[]; links: GraphLink[]; graphW: number; graphH: number } {
  const visible = nodes.filter((n) => showBqLeaves || n.type !== 'bq_item');
  const ids = new Set(visible.map((n) => n.id));

  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'LR',
    nodesep: 28,
    ranksep: 72,
    marginx: 32,
    marginy: 28,
  });
  g.setDefaultEdgeLabel(() => ({}));

  visible.forEach((n) => {
    const dim = NODE_DIM[n.type] ?? { w: 100, h: 44 };
    g.setNode(n.id, { width: dim.w, height: dim.h });
  });

  links.forEach((l) => {
    const s = l.source as string;
    const t = l.target as string;
    if (!ids.has(s) || !ids.has(t)) return;
    // Lay out flow: documents → variation → clusters → BQ
    if (l.type === 'triggers' || l.type === 'cites') {
      g.setEdge(s, t);
      return;
    }
    if (l.type === 'direct' || l.type === 'supports') {
      g.setEdge(s, t);
      return;
    }
    if (l.type === 'indirect_2hop' || l.type === 'indirect_3hop') {
      g.setEdge(s, t);
    }
  });

  dagre.layout(g);

  const positioned: LayoutNode[] = visible.map((n) => {
    const dn = g.node(n.id);
    const dim = NODE_DIM[n.type] ?? { w: 100, h: 44 };
    if (!dn) {
      return { ...n, x: width / 2, y: height / 2, w: dim.w, h: dim.h };
    }
    return { ...n, x: dn.x, y: dn.y, w: dim.w, h: dim.h };
  });

  const gg = g.graph();
  const graphW = Math.max(width, (gg.width ?? width) + 48);
  const graphH = Math.max(420, (gg.height ?? height) + 48);

  const visibleLinks = links.filter((l) => {
    const s = l.source as string;
    const t = l.target as string;
    if (!showBqLeaves && (s.includes('__') || t.includes('__'))) return false;
    return ids.has(s) && ids.has(t);
  });

  return { nodes: positioned, links: visibleLinks, graphW, graphH };
}

export function blastRadiusFromDoc(
  docId: string,
  nodes: GraphNode[],
  links: GraphLink[]
): Set<string> {
  const active = new Set<string>([docId]);
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const doc = nodeById.get(docId);
  if (!doc || doc.type !== 'document') return active;

  const vid = nodes.find((n) => n.type === 'variation')?.id;
  if (vid) active.add(vid);

  for (const cid of doc.cluster_ids ?? []) {
    active.add(cid);
    links
      .filter((l) => l.source === cid && String(l.target).includes('__'))
      .forEach((l) => active.add(l.target as string));
  }

  return active;
}

export function anchorRectEdge(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number
): { x1: number; y1: number; x2: number; y2: number } {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const padA = Math.min(aw, ah) * 0.35;
  const padB = Math.min(bw, bh) * 0.35;
  return {
    x1: ax + ux * padA,
    y1: ay + uy * padA,
    x2: bx - ux * padB,
    y2: by - uy * padB,
  };
}
