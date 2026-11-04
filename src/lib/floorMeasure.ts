/** Normalized point in image space (0–1), origin top-left. */
export type NormPoint = { x: number; y: number };

export type ObjectCoverLayout = {
  scale: number;
  offsetX: number;
  offsetY: number;
  drawWidth: number;
  drawHeight: number;
};

/** Map image object-cover layout (same math as CSS object-cover). */
export function getObjectCoverLayout(
  imgW: number,
  imgH: number,
  boxW: number,
  boxH: number
): ObjectCoverLayout {
  const scale = Math.max(boxW / imgW, boxH / imgH);
  const drawWidth = imgW * scale;
  const drawHeight = imgH * scale;
  return {
    scale,
    offsetX: (boxW - drawWidth) / 2,
    offsetY: (boxH - drawHeight) / 2,
    drawWidth,
    drawHeight,
  };
}

export function normToBox(p: NormPoint, layout: ObjectCoverLayout): { x: number; y: number } {
  return {
    x: layout.offsetX + p.x * layout.drawWidth,
    y: layout.offsetY + p.y * layout.drawHeight,
  };
}

/** Shoelace area in normalized coords (relative measure on the same plane). */
export function polygonAreaNorm(points: NormPoint[]): number {
  if (points.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

export function pointsToSvgString(points: NormPoint[], layout: ObjectCoverLayout): string {
  return points.map((p) => {
    const { x, y } = normToBox(p, layout);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
}

export function areaSqmFromReference(
  segment: NormPoint[],
  referenceFootprint: NormPoint[],
  referenceAreaSqm: number
): number {
  const ref = polygonAreaNorm(referenceFootprint);
  if (ref <= 0) return 0;
  return (polygonAreaNorm(segment) / ref) * referenceAreaSqm;
}
