import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Eye, Layers, Ruler, ShieldCheck } from 'lucide-react';
import {
  NormPoint,
  ObjectCoverLayout,
  areaSqmFromReference,
  getObjectCoverLayout,
  pointsToSvgString,
  polygonAreaNorm,
} from '../lib/floorMeasure';

export type CvSegment = {
  id: string;
  label: string;
  category: 'completed' | 'in_progress' | 'not_started';
  confidence: number;
  color: string;
  points_norm: NormPoint[];
  area_sqm?: number;
  share_of_footprint?: number;
};

export type CvModulePayload = {
  area_name: string;
  timestamp: string;
  completeness: number;
  breakdown: { completed: number; in_progress: number; not_started: number };
  ai_confidence: number;
  delta_valued: string;
  image_src: string;
  reference_area_sqm: number;
  drawing_ref: string;
  footprint_norm: NormPoint[];
  segments: CvSegment[];
  measurement_engine?: string;
  footprint_sqm_drawing?: number;
  world_width_m?: number;
  world_depth_m?: number;
};

const CATEGORY_STROKE: Record<CvSegment['category'], string | undefined> = {
  completed: undefined,
  in_progress: '6 4',
  not_started: '3 3',
};

type Props = {
  data: CvModulePayload;
  lang: string;
};

export default function AsBuiltAreaViewer({ data, lang }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boxSize, setBoxSize] = useState({ w: 800, h: 500 });
  const [imgSize, setImgSize] = useState({ w: 1200, h: 1099 });
  const [showMasks, setShowMasks] = useState(true);
  const [showFootprint, setShowFootprint] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(data.segments[0]?.id ?? null);
  const [maskOpacity, setMaskOpacity] = useState(0.38);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setBoxSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout: ObjectCoverLayout = useMemo(
    () => getObjectCoverLayout(imgSize.w, imgSize.h, boxSize.w, boxSize.h),
    [imgSize, boxSize]
  );

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
  }, []);

  const segmentsWithArea = useMemo(() => {
    return data.segments.map((seg) => ({
      ...seg,
      area_sqm:
        seg.area_sqm ??
        areaSqmFromReference(seg.points_norm, data.footprint_norm, data.reference_area_sqm),
    }));
  }, [data]);

  const active = segmentsWithArea.find((s) => s.id === activeId) ?? segmentsWithArea[0];
  const footprintAreaNorm = polygonAreaNorm(data.footprint_norm);

  const labels = {
    masks: lang === 'en' ? 'Progress masks' : lang === 'zh-HK' ? '進度分割' : '进度分割',
    footprint: lang === 'en' ? 'Drawing footprint' : lang === 'zh-HK' ? '圖紙大堂輪廓' : '图纸大堂轮廓',
    drawingCalibrated:
      lang === 'en'
        ? `Drawing ${data.drawing_ref}: ${data.world_width_m ?? 12}×${data.world_depth_m ?? 10} m → ${data.reference_area_sqm} m² (OpenCV homography)`
        : lang === 'zh-HK'
        ? `圖紙 ${data.drawing_ref}：${data.world_width_m ?? 12}×${data.world_depth_m ?? 10} m → ${data.reference_area_sqm} m²（OpenCV 透視校正）`
        : `图纸 ${data.drawing_ref}：${data.world_width_m ?? 12}×${data.world_depth_m ?? 10} m → ${data.reference_area_sqm} m²（OpenCV 透视校正）`,
    selected: lang === 'en' ? 'Selected zone' : lang === 'zh-HK' ? '選取區域' : '选取区域',
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <Ruler className="w-4 h-4 text-emerald-700" />
          <span>{labels.drawingCalibrated}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMasks((v) => !v)}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              showMasks
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-white border-slate-200 text-slate-500'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {labels.masks}
          </button>
          <button
            type="button"
            onClick={() => setShowFootprint((v) => !v)}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              showFootprint
                ? 'bg-slate-100 border-slate-300 text-slate-800'
                : 'bg-white border-slate-200 text-slate-500'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {labels.footprint}
          </button>
          <label className="flex items-center gap-2 bg-white border border-slate-200 px-2 py-1 rounded-lg">
            <span className="text-slate-400 text-[10px]">α</span>
            <input
              type="range"
              min={0.15}
              max={0.65}
              step={0.05}
              value={maskOpacity}
              onChange={(e) => setMaskOpacity(parseFloat(e.target.value))}
              className="w-20 h-1 accent-emerald-600 cursor-pointer"
            />
          </label>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-slate-300 bg-slate-900 shadow-lg"
      >
        <img
          src={data.image_src}
          alt={data.area_name}
          className="absolute inset-0 w-full h-full object-cover"
          onLoad={onImageLoad}
        />

        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
          {showFootprint && (
            <polygon
              points={pointsToSvgString(data.footprint_norm, layout)}
              fill="none"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth={2}
              strokeDasharray="8 4"
              vectorEffect="non-scaling-stroke"
            />
          )}
          {showMasks &&
            segmentsWithArea.map((seg) => {
              const isActive = seg.id === active?.id;
              return (
                <polygon
                  key={seg.id}
                  points={pointsToSvgString(seg.points_norm, layout)}
                  fill={seg.color}
                  fillOpacity={isActive ? maskOpacity + 0.12 : maskOpacity}
                  stroke={seg.color}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  strokeDasharray={CATEGORY_STROKE[seg.category]}
                  vectorEffect="non-scaling-stroke"
                  style={{ filter: isActive ? 'drop-shadow(0 0 6px rgba(255,255,255,0.35))' : undefined }}
                />
              );
            })}
        </svg>

        <div className="absolute inset-0 pointer-events-none">
          {segmentsWithArea.map((seg) => {
            const cx =
              seg.points_norm.reduce((s, p) => s + p.x, 0) / seg.points_norm.length;
            const cy =
              seg.points_norm.reduce((s, p) => s + p.y, 0) / seg.points_norm.length;
            const pos = {
              x: layout.offsetX + cx * layout.drawWidth,
              y: layout.offsetY + cy * layout.drawHeight,
            };
            const leftPct = (pos.x / boxSize.w) * 100;
            const topPct = (pos.y / boxSize.h) * 100;
            if (!showMasks) return null;
            return (
              <button
                key={`label-${seg.id}`}
                type="button"
                style={{ left: `${leftPct}%`, top: `${topPct}%`, transform: 'translate(-50%, -50%)' }}
                className="pointer-events-auto absolute max-w-[220px] text-left bg-slate-950/88 backdrop-blur-md border border-white/15 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-mono shadow-xl hover:scale-[1.02] transition-transform cursor-pointer"
                onClick={() => setActiveId(seg.id)}
              >
                <div className="font-bold truncate" style={{ color: seg.color }}>
                  {seg.area_sqm.toFixed(0)} m²
                </div>
                <div className="text-slate-400 truncate">{seg.label}</div>
              </button>
            );
          })}
        </div>

        <div className="absolute top-3 left-3 bg-slate-950/75 backdrop-blur px-3 py-1.5 rounded-lg text-white text-[10px] font-mono border border-white/10">
          {data.area_name} • {data.timestamp}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {segmentsWithArea.map((seg) => (
          <button
            key={seg.id}
            type="button"
            onClick={() => setActiveId(seg.id)}
            className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
              active?.id === seg.id
                ? 'border-emerald-500 bg-emerald-50/80 shadow-sm'
                : 'border-[#E5E0D0] bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="truncate">{seg.label}</span>
            </div>
            <div className="mt-1 flex justify-between text-slate-500">
              <span>Area</span>
              <span className="font-mono font-bold text-slate-800">{seg.area_sqm.toFixed(1)} m²</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Share of footprint</span>
              <span className="font-mono">
                {footprintAreaNorm > 0
                  ? ((polygonAreaNorm(seg.points_norm) / footprintAreaNorm) * 100).toFixed(0)
                  : 0}
                %
              </span>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div className="flex items-start gap-2 p-3 bg-[#FAF8F3] border border-[#E5E0D0] rounded-xl text-xs text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-slate-900">{labels.selected}: {active.label}</div>
            <div className="mt-1 font-mono">
              {(active.confidence * 100).toFixed(0)}% confidence • {active.area_sqm.toFixed(1)} m² on floor plane
              {data.measurement_engine ? ` • ${data.measurement_engine}` : ''}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
