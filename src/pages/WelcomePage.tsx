import React, { useRef, useState } from 'react';
import { FileUp, FolderOpen, ShieldCheck } from 'lucide-react';

type Props = {
  onOpenSample: () => void;
  onUpload: (files: FileList) => void;
  busy?: boolean;
};

const EXPECTED = [
  { id: 'ai', label: 'Architectural Instruction / VO', hint: 'AI-*.pdf' },
  { id: 'bq', label: 'BQ extract (affected pages)', hint: 'BQ 08-12' },
  { id: 'dwg', label: 'Drawing takeoff sheet', hint: 'A-201 / A-105' },
  { id: 'claim', label: 'Contractor variation claim', hint: 'VO claim schedule' },
  { id: 'spec', label: 'Spec / HKSMM4 refs', hint: 'SPC 23 40 00' },
  { id: 'site', label: 'Site record (optional)', hint: 'photo log / checklist PDF' },
];

export default function WelcomePage({ onOpenSample, onUpload, busy }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-black">
              C
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-wide text-slate-900">CASCADE</div>
              <div className="text-[11px] text-slate-500">HK variation valuation · cited evidence</div>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            Cap. 652 · HKSMM4 · GCC
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 text-[12px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full mb-5">
            QS decision pack
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Upload the variation pack.
            <br />
            Get a cited payment response.
          </h1>
          <p className="mt-4 text-slate-500 text-[15px] leading-relaxed max-w-xl mx-auto">
            Drop BQ pages, drawings, the contractor claim, and site records. Cascade traces impact,
            values under HKSMM4, flags inflation, and builds a Cap. 652–ready evidence pack — no
            photo tracing, no clutter.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={onOpenSample}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-blue-600/25"
            >
              <FolderOpen className="w-4 h-4" />
              Open sample case V-2026-017
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-xl"
            >
              <FileUp className="w-4 h-4" />
              Upload documents
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.xlsx,.csv"
              className="hidden"
              onChange={(e) => e.target.files && onUpload(e.target.files)}
            />
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              if (e.dataTransfer.files?.length) onUpload(e.dataTransfer.files);
            }}
            className={`mt-10 rounded-2xl border-2 border-dashed p-8 transition-colors text-left ${
              drag ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
              Expected pack
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXPECTED.map((d) => (
                <li
                  key={d.id}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3"
                >
                  <span className="mt-0.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span>
                    <div className="text-sm font-semibold text-slate-800">{d.label}</div>
                    <div className="text-[11px] text-slate-500 mono mt-0.5">{d.hint}</div>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500 text-center">
              Drag files here, or use Upload. Demo also works with the sample case (no files needed).
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
