/** Radial layout + edge anchoring for Impact Trace knowledge graph */
import type { GraphLink, GraphNode } from './ImpactKnowledgeGraph';

export type LayoutNode = GraphNode & { x: number; y: number; r: number };

export function layoutImpactGraph(
  nodes: GraphNode[],
  links: GraphLink[],
  width: number,
  height: number,
  includeLeaves: boolean
): { nodes: LayoutNode[]; links: GraphLink[] } {
  const cx = width / 2;
  const cy = height / 2;
  const pad = 56;
  const orbit = Math.min(width, height) / 2 - pad - 40;

  const center = nodes.find((n) => n.type === 'variation');
  const clusters = nodes.filter((n) => n.type === 'cluster');
  const leaves = includeLeaves ? nodes.filter((n) => n.type === 'bq_item') : [];

  const positioned = new Map<string, LayoutNode>();

  if (center) {
    positioned.set(center.id, {
      ...center,
      x: cx,
      y: cy,
      r: 52,
    });
  }

  clusters.forEach((c, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / clusters.length;
    positioned.set(c.id, {
      ...c,
      x: cx + Math.cos(angle) * orbit,
      y: cy + Math.sin(angle) * orbit,
      r: 38,
    });
  });

  if (includeLeaves && center) {
    leaves.forEach((leaf) => {
      const parentLink = links.find((l) => l.target === leaf.id);
      const parentId = parentLink?.source as string;
      const parent = parentId ? positioned.get(parentId) : undefined;
      if (!parent) return;
      const dx = parent.x - cx;
      const dy = parent.y - cy;
      const len = Math.hypot(dx, dy) || 1;
      const push = 72;
      positioned.set(leaf.id, {
        ...leaf,
        x: parent.x + (dx / len) * push,
        y: parent.y + (dy / len) * push,
        r: 14,
      });
    });
  }

  const visibleIds = new Set([...positioned.keys()]);
  const visibleLinks = links.filter((l) => {
    const s = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
    const t = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
    if (!includeLeaves && (s.includes('__') || t.includes('__'))) return false;
    return visibleIds.has(s) && visibleIds.has(t);
  });

  return {
    nodes: [...positioned.values()],
    links: visibleLinks,
  };
}

export function anchorEdge(
  ax: number,
  ay: number,
  ar: number,
  bx: number,
  by: number,
  br: number
): { x1: number; y1: number; x2: number; y2: number } {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: ax + ux * ar,
    y1: ay + uy * ar,
    x2: bx - ux * br,
    y2: by - uy * br,
  };
}
