import React, { useState } from 'react';
import { Eye, Layers, CheckCircle2, ShieldCheck, ZoomIn, ZoomOut, RotateCcw, Sliders, Play, Cpu } from 'lucide-react';

interface Annotation {
  id: string;
  name: string;
  category: 'completed' | 'in_progress' | 'not_started';
  confidence: number;
  area_sqm: number;
  color: string;
  points: string; // SVG polygon coordinates (in percent)
}

const SAMPLE_ANNOTATIONS: Annotation[] = [
  {
    id: 'seg-1',
    name: 'Floor Screed & Concrete Sub-base',
    category: 'completed',
    confidence: 0.96,
    area_sqm: 72,
    color: '#10B981', // Emerald green
    points: '14,64 86,64 96,94 4,94'
  },
  {
    id: 'seg-2',
    name: 'Polymer Tile Adhesive (Active Laying)',
    category: 'in_progress',
    confidence: 0.91,
    area_sqm: 36,
    color: '#F59E0B', // Amber
    points: '24,54 76,54 84,64 16,64'
  },
  {
    id: 'seg-3',
    name: 'Perimeter Skirting Zone & Edge Stop-ends',
    category: 'not_started',
    confidence: 0.88,
    area_sqm: 12,
    color: '#94A3B8', // Slate grey
    points: '4,46 96,46 96,52 4,52'
  }
];

const SITE_CAMERAS = [
  { id: 'cam-1', label: 'Cam 1: East Entrance Lobby', src: '/raw_construction_lobby.jpg', timestamp: '28 Jul 2026 10:15 AM' },
  { id: 'cam-2', label: 'Cam 2: Floor Screed Inspection', src: '/construction_screed.jpg', timestamp: '28 Jul 2026 10:18 AM' },
  { id: 'cam-3', label: 'Cam 3: Tiling Progress Milestone', src: '/construction_tiling.jpg', timestamp: '28 Jul 2026 10:22 AM' }
];

export default function AsBuiltRoboflowViewer({ lang = 'zh-HK' }: { lang?: string }) {
  const [selectedCam, setSelectedCam] = useState(SITE_CAMERAS[0]);
  const [activeSegment, setActiveSegment] = useState<Annotation | null>(SAMPLE_ANNOTATIONS[0]);
  const [showMasks, setShowMasks] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [opacity, setOpacity] = useState(0.45);
  const [isInferring, setIsInferring] = useState(false);

  const triggerReInference = () => {
    setIsInferring(true);
    setTimeout(() => {
      setIsInferring(false);
    }, 600);
  };

  return (
    <div className="space-y-4">
      {/* Top Inspection Control Bar */}
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-md border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-emerald-300 font-bold">YOLOv8-Seg + SAM Engine</span>
          </div>
          <span className="text-slate-400">Model: <strong className="text-white">Roboflow-Construction-Progress-v2</strong></span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMasks(!showMasks)}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              showMasks ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showMasks ? 'Masks ON' : 'Masks OFF'}</span>
          </button>

          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              showLabels ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showLabels ? 'Labels ON' : 'Labels OFF'}</span>
          </button>

          <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
            <Sliders className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400 text-[10px]">Alpha:</span>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-16 h-1 accent-emerald-500 cursor-pointer"
            />
          </div>

          <button
            onClick={triggerReInference}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${isInferring ? 'animate-spin' : ''}`} />
            <span>{isInferring ? 'Running...' : 'Re-Run Inference'}</span>
          </button>
        </div>
      </div>

      {/* Main High-Res Viewer Canvas with Dynamic Segmentation Overlay */}
      <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-950 border border-slate-800 shadow-2xl select-none group">
        {/* Real High-Resolution Construction Site Photo */}
        <img
          src={selectedCam.src}
          alt={selectedCam.label}
          className="w-full h-full object-cover transition-transform duration-500"
        />

        {/* Dynamic SVG Instance Segmentation Polygons (Supervision/Roboflow Styled) */}
        {showMasks && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {SAMPLE_ANNOTATIONS.map((ann) => {
              const isSelected = activeSegment?.id === ann.id;
              return (
                <polygon
                  key={ann.id}
                  points={ann.points}
                  fill={ann.color}
                  fillOpacity={isSelected ? opacity + 0.15 : opacity}
                  stroke={ann.color}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  strokeDasharray={ann.category === 'in_progress' ? '3,2' : undefined}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
        )}

        {/* Interactive Segment Bounding Callouts */}
        {showLabels && (
          <div className="absolute inset-0 pointer-events-none p-4">
            {/* Callout 1: Completed Sub-base */}
            <div
              onClick={() => setActiveSegment(SAMPLE_ANNOTATIONS[0])}
              className="absolute bottom-6 left-6 pointer-events-auto cursor-pointer bg-slate-950/85 backdrop-blur-md border border-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-mono shadow-2xl flex items-center space-x-2.5 transition-transform hover:scale-105"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <div>
                <div className="font-bold text-emerald-300 flex items-center space-x-1">
                  <span>Floor Screed: 60% Verified (72m²)</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-[10px] text-slate-400">Confidence: 96.2% • Milestone: Payable</div>
              </div>
            </div>

            {/* Callout 2: In-Progress Adhesive */}
            <div
              onClick={() => setActiveSegment(SAMPLE_ANNOTATIONS[1])}
              className="absolute top-20 right-6 pointer-events-auto cursor-pointer bg-slate-950/85 backdrop-blur-md border border-amber-500/80 text-white px-3 py-1.5 rounded-xl text-xs font-mono shadow-2xl flex items-center space-x-2 transition-transform hover:scale-105"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <div>
                <div className="font-bold text-amber-300">Tile Adhesive: In Progress (30%)</div>
                <div className="text-[10px] text-slate-400">Coverage: 36m² • Conf: 91.4%</div>
              </div>
            </div>

            {/* Top Camera Label Badge */}
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-lg text-white text-xs font-mono border border-slate-700 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>LIVE FEED: {selectedCam.label}</span>
              <span className="text-slate-400 text-[10px]">• {selectedCam.timestamp}</span>
            </div>
          </div>
        )}
      </div>

      {/* Camera Switcher & Segment Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Multi-Angle Camera Feeds */}
        <div className="md:col-span-2 bg-white p-4 rounded-2xl border border-[#E5E0D0] shadow-sm">
          <div className="text-xs font-bold text-slate-900 mb-2 flex justify-between">
            <span>{lang === 'en' ? 'Inspection Viewpoints' : lang === 'zh-HK' ? '工地實時監理視角 (多機位聯動)' : '工地实时监理视角 (多机位联动)'}</span>
            <span className="text-slate-400 font-mono">3 Streams Active</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {SITE_CAMERAS.map((cam) => (
              <div
                key={cam.id}
                onClick={() => setSelectedCam(cam)}
                className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                  selectedCam.id === cam.id ? 'border-emerald-600 shadow-md ring-2 ring-emerald-400/30' : 'border-slate-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={cam.src} alt={cam.label} className="w-full h-16 object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                  <span className="text-[10px] font-bold text-white truncate">{cam.label.split(':')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Polygon Properties */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5E0D0] shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-900 mb-1">
              {lang === 'en' ? 'Selected Element Mask' : lang === 'zh-HK' ? '已選取語義分割區域' : '已选取语义分割区域'}
            </div>
            {activeSegment ? (
              <div className="space-y-1.5 text-xs mt-2">
                <div className="font-bold text-emerald-950 flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeSegment.color }}></span>
                  <span>{activeSegment.name}</span>
                </div>
                <div className="text-slate-500 flex justify-between">
                  <span>Verified Area:</span>
                  <strong className="text-slate-800 font-mono">{activeSegment.area_sqm} m² (60.0%)</strong>
                </div>
                <div className="text-slate-500 flex justify-between">
                  <span>Confidence:</span>
                  <strong className="text-emerald-700 font-mono">{(activeSegment.confidence * 100).toFixed(1)}%</strong>
                </div>
                <div className="text-slate-500 flex justify-between">
                  <span>Cap. 652 Status:</span>
                  <strong className="text-emerald-700 font-bold">Approved for Payment</strong>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Click a polygon in the viewer to inspect.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

