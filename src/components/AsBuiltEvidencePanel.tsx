import React, { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Clock,
  FileImage,
  Link2,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  Banknote,
} from 'lucide-react';
import type { CvModulePayload } from './AsBuiltAreaViewer';

type Milestone = {
  id: string;
  element: string;
  taxonomy: string;
  status: 'verified' | 'in_progress' | 'not_started';
  progress_pct: number;
  weight_pct: number;
  citation: string;
  observation: string;
};

type Certification = {
  weighted_completeness_pct: number;
  fair_value_total_hkd: number;
  payable_milestone_hkd: number;
  withheld_pending_hkd: number;
  cap652_window: string;
  certifier_note: string;
};

type EvidenceChain = {
  primary_photo: string;
  captured_at: string;
  captured_by: string;
  linked_drawings: string[];
  integrity: string;
};

export type AsBuiltEvidenceData = CvModulePayload & {
  milestones?: Milestone[];
  evidence_chain?: EvidenceChain;
  certification?: Certification;
  gallery?: { id: string; label: string; src: string }[];
};

type AsBuiltStrings = {
  title: string;
  generateReportBtn: string;
  photoFeed: string;
  classifierTitle: string;
  classifierSub: string;
  preComplete: string;
  confidence: string;
  deltaNote: string;
  evidenceCaption?: string;
  milestoneTitle?: string;
  payableTitle?: string;
  withheldTitle?: string;
  drawingLink?: string;
  statusVerified?: string;
  statusProgress?: string;
  statusNotStarted?: string;
};

const STATUS_STYLE = {
  verified: {
    pill: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    bar: 'bg-emerald-600',
    icon: CheckCircle2,
  },
  in_progress: {
    pill: 'bg-amber-100 text-amber-900 border-amber-200',
    bar: 'bg-amber-500',
    icon: Clock,
  },
  not_started: {
    pill: 'bg-slate-100 text-slate-600 border-slate-200',
    bar: 'bg-slate-300',
    icon: AlertCircle,
  },
};

function statusLabel(status: Milestone['status'], t: AsBuiltStrings) {
  if (status === 'verified') return t.statusVerified ?? 'Verified';
  if (status === 'in_progress') return t.statusProgress ?? 'In progress';
  return t.statusNotStarted ?? 'Not started';
}

type Props = {
  data: AsBuiltEvidenceData;
  drawingTakeoff: {
    drawing_ref: string;
    lobby_footprint_m: { width: number; depth: number };
    tile_area_sqm: number;
  } | null;
  lang: string;
  t: AsBuiltStrings;
  onGenerateReport: () => void;
};

export default function AsBuiltEvidencePanel({
  data,
  drawingTakeoff,
  lang,
  t,
  onGenerateReport,
}: Props) {
  const [activePhoto, setActivePhoto] = useState(0);
  const gallery =
    data.gallery?.length ?
      data.gallery
    : [{ id: 'primary', label: data.area_name, src: data.image_src }];

  const milestones = data.milestones ?? [];
  const cert = data.certification;
  const chain = data.evidence_chain;

  const fmtHkd = (n: number) =>
    n.toLocaleString(lang === 'en' ? 'en-HK' : 'zh-HK', { maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      {/* Payable milestone hero */}
      {cert && (
        <div className="relative overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-[#0E201A] via-[#1A3D32] to-[#132E26] text-white shadow-xl">
          <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_80%_20%,#fff,transparent_50%)]" />
          <div className="relative p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-2">
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-300/90">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t.payableTitle ?? 'Cap. 652 — Milestone certification'}
              </div>
              <p className="text-sm text-emerald-100/90 max-w-xl leading-relaxed">{cert.certifier_note}</p>
              <p className="text-[11px] font-mono text-emerald-200/70">{cert.cap652_window}</p>
            </div>
            <div className="text-center md:text-right space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-emerald-300/80 font-bold">
                {lang === 'en' ? 'Payable this claim' : lang === 'zh-HK' ? '本期可付' : '本期可付'}
              </div>
              <div className="text-4xl md:text-5xl font-black font-mono tracking-tight flex items-center justify-center md:justify-end gap-2">
                <Banknote className="w-8 h-8 text-emerald-400 opacity-90 hidden sm:block" />
                HK$ {fmtHkd(cert.payable_milestone_hkd)}
              </div>
              <div className="text-xs text-emerald-200/80 font-mono">
                {t.withheldTitle ?? 'Withheld pending completion'}: HK$ {fmtHkd(cert.withheld_pending_hkd)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Evidence gallery — no masks */}
        <div className="xl:col-span-3 bg-white rounded-3xl border border-[#E5E0D0] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#1A3D32]" />
                {t.photoFeed}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {t.evidenceCaption ??
                  'Site evidence only — quantities from Drawing takeoff; progress from QS milestone review.'}
              </p>
            </div>
            {chain && (
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">
                {chain.primary_photo}
              </span>
            )}
          </div>

          <div className="relative aspect-[16/10] bg-slate-950">
            <img
              src={gallery[activePhoto]?.src ?? data.image_src}
              alt={gallery[activePhoto]?.label ?? data.area_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 pt-16">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="text-white font-bold text-sm">{gallery[activePhoto]?.label}</div>
                  <div className="text-emerald-300/90 text-[11px] font-mono mt-1">
                    {chain?.captured_at ?? data.timestamp} • {chain?.captured_by ?? 'Site QS inspection'}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-white/90 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full border border-white/20">
                  <FileImage className="w-3 h-3" />
                  {lang === 'en' ? 'Evidence — not used for m² takeoff' : lang === 'zh-HK' ? '證據用途 — 不作面積算量' : '证据用途 — 不作面积算量'}
                </div>
              </div>
            </div>
          </div>

          {gallery.length > 1 && (
            <div className="px-4 py-3 flex gap-2 border-t border-slate-100 bg-[#FAF8F3]">
              {gallery.map((g, i) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setActivePhoto(i)}
                  className={`relative h-14 w-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    activePhoto === i ? 'border-emerald-600 ring-2 ring-emerald-400/30' : 'border-slate-200 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={g.src} alt={g.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {chain && (
            <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] border-t border-slate-100 bg-slate-50/50">
              <div>
                <span className="text-slate-400 block mb-0.5">Integrity</span>
                <span className="font-mono text-slate-700 truncate block">{chain.integrity}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Drawings</span>
                <span className="font-mono font-bold text-slate-800">{chain.linked_drawings.join(', ')}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block mb-0.5">{t.drawingLink ?? 'Quantity source'}</span>
                <span className="text-slate-700">
                  {drawingTakeoff ?
                    `${drawingTakeoff.drawing_ref}: ${drawingTakeoff.lobby_footprint_m.width}×${drawingTakeoff.lobby_footprint_m.depth} m = ${drawingTakeoff.tile_area_sqm} m² (HKSMM4)`
                  : `Drawing ${data.drawing_ref} — ${data.reference_area_sqm} m²`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Milestone taxonomy + donut summary */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-3xl border border-[#E5E0D0] p-6 shadow-sm flex-1">
            <h3 className="font-bold text-slate-900">{t.classifierTitle}</h3>
            <p className="text-[11px] text-slate-500 mt-1 mb-5">{t.classifierSub}</p>

            <div className="flex items-center gap-5 mb-6">
              <div className="relative w-28 h-28 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" stroke="#E8E4D8" strokeWidth="9" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#2D6A4F"
                    strokeWidth="9"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(data.completeness / 100) * 238.76} 238.76`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black font-mono text-slate-900">{data.completeness}%</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">{t.preComplete}</span>
                </div>
              </div>
              <div className="flex-1 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">{t.confidence}</span>
                  <span className="font-mono font-bold text-emerald-800">{data.ai_confidence}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1A3D32] rounded-full" style={{ width: `${data.ai_confidence}%` }} />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
                  {data.delta_valued}
                </p>
              </div>
            </div>

            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              {t.milestoneTitle ?? 'Element taxonomy (bounded CV scope)'}
            </h4>
            <ul className="space-y-3">
              {milestones.map((m) => {
                const st = STATUS_STYLE[m.status];
                const Icon = st.icon;
                return (
                  <li
                    key={m.id}
                    className="rounded-2xl border border-slate-100 p-3.5 hover:border-emerald-200/80 transition-colors bg-[#FAFAF8]"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{m.element}</div>
                        <div className="text-[10px] text-slate-500">{m.taxonomy}</div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${st.pill}`}
                      >
                        <Icon className="w-3 h-3" />
                        {statusLabel(m.status, t)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${st.bar}`} style={{ width: `${m.progress_pct}%` }} />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-800 w-10 text-right">
                        {m.progress_pct}%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-relaxed">{m.observation}</p>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-800 font-mono">
                      <Link2 className="w-3 h-3 shrink-0" />
                      {m.citation}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <button
            type="button"
            onClick={onGenerateReport}
            className="w-full py-3.5 bg-[#1A3D32] hover:bg-[#132E26] text-white rounded-2xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {t.generateReportBtn}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
