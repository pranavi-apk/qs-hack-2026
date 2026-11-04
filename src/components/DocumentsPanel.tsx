import React, { useRef } from 'react';
import { CheckCircle2, FileText, Upload } from 'lucide-react';

export type PackDoc = {
  id: string;
  name: string;
  category: string;
  status: 'ready' | 'missing' | 'uploaded';
  role: string;
};

type Props = {
  docs: PackDoc[];
  onUpload: (files: FileList) => void;
};

export default function DocumentsPanel({ docs, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const ready = docs.filter((d) => d.status !== 'missing').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Documents</p>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">Variation pack</h2>
          <p className="text-sm text-slate-500 mt-1">
            {ready}/{docs.length} files ready · quantities from drawings, not site photos
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl"
        >
          <Upload className="w-4 h-4" />
          Add files
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
        {[
          { label: 'In pack', value: String(ready) },
          { label: 'Missing', value: String(docs.length - ready) },
          { label: 'Variation', value: 'V-2026-017' },
          { label: 'Project', value: 'HA Block 4' },
        ].map((s) => (
          <div key={s.label} className="bg-white px-4 py-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{s.label}</div>
            <div className="text-lg font-bold text-slate-900 mono mt-1 truncate">{s.value}</div>
          </div>
        ))}
      </div>

      <ul className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        {docs.map((d) => (
          <li key={d.id} className="flex items-start gap-3 px-4 py-3.5">
            <FileText className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-900">{d.name}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {d.category} · {d.role}
              </div>
            </div>
            {d.status === 'missing' ?
              <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-md">
                Missing
              </span>
            : <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">
                <CheckCircle2 className="w-3 h-3" />
                Ready
              </span>
            }
          </li>
        ))}
      </ul>
    </div>
  );
}
