import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  Gavel,
  Link2,
  Scale,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import type { Translations } from '../i18n';

type EvidenceRecord = {
  seq: number;
  type: string;
  title: string;
  source: string;
  date: string;
  summary: string;
  citation_ids?: string[];
  excerpts?: { id: string; reference: string; excerpt: string }[];
};

type Provability = {
  score: number;
  band: string;
  summary: string;
  signals: { id: string; label: string; weight: number; met: boolean; note: string }[];
  cure_list: string[];
};

type PaymentClock = {
  ordinance: string;
  claim_received: string;
  response_deadline: string;
  payment_deadline_admitted: string;
  days_to_response: number;
  status: string;
  admitted_payable_hkd: number;
  disputed_hkd: number;
  withheld_pending_milestones_hkd: number;
  response_basis: string;
};

type ClaimAnnexItem = {
  item: string;
  claim_amount: number;
  cascade_fair: number;
  variance: number;
  variance_pct: number;
  flag: string;
  reason: string;
};

export type CitedReportPayload = {
  variation_id: string;
  variation_title: string;
  executive_summary: {
    total_fair_value: number;
    inflated_amount_detected: number;
    inflated_percentage: number;
    payable_delta: number;
    completeness_cv: string;
    certification_impact: string;
  };
  references: { label: string; ref: string }[];
  conclusion: string;
  metadata?: {
    report_id: string;
    issued_date: string;
    prepared_by: string;
    reviewer_role: string;
    document_hash: string;
    cap652_reference: string;
  };
  methodology?: {
    step: number;
    module: string;
    engine: string;
    citation: string;
    outcome: string;
  }[];
  citations?: {
    id: string;
    category: string;
    source: string;
    reference: string;
    excerpt: string;
    supports: string;
  }[];
  valuation_lines?: { item: string; qty: string; rate?: number; amount: number; citation_id: string }[];
  valuation_subtotal?: number;
  valuation_adjustments?: { description: string; amount: number };
  deductions?: { item: string; amount: number; citation_id: string }[];
  fair_value_total?: number;
  contractor_claim_total?: number;
  variance_total?: number;
  evidence_pack?: {
    pack_id: string;
    document_hash: string;
    assembled_at: string;
    inspired_by?: string[];
    records: EvidenceRecord[];
    variation_workflow: {
      step: number;
      stage: string;
      status: string;
      ref: string;
      detail: string;
      date: string;
    }[];
    payment_clock: PaymentClock;
    provability: Provability;
    certification_math: {
      fair_value_hkd: number;
      weighted_completeness_pct: number;
      formula: string;
      payable_this_period_hkd: number;
      withheld_hkd: number;
      milestones: {
        element: string;
        status: string;
        progress_pct: number;
        weight_pct: number;
        citation: string;
      }[];
    };
    claim_annex: {
      title: string;
      items: ClaimAnnexItem[];
      total_claim: number;
      total_cascade_fair: number;
      total_variance: number;
      inflated_percentage: number;
      recommendation: string;
    };
  };
};

type Props = {
  t: Translations;
  variationId: string;
  onExport: () => void;
};

function fmt(n: number) {
  return n.toLocaleString('en-HK', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function statusTone(status: string) {
  if (status === 'complete' || status === 'on_track' || status === 'strong') return 'emerald';
  if (status === 'disputed' || status === 'overdue' || status === 'weak') return 'red';
  if (status === 'active' || status === 'due_soon' || status === 'adequate') return 'amber';
  return 'slate';
}

export default function CitedReportPage({ t, variationId, onExport }: Props) {
  const [report, setReport] = useState<CitedReportPayload | null>(null);
  const [exportLang, setExportLang] = useState<'en' | 'zh-HK'>('en');
  const [exporting, setExporting] = useState<'pdf' | 'html' | null>(null);

  useEffect(() => {
    fetch(`/api/report/${variationId}`)
      .then((r) => r.json())
      .then(setReport)
      .catch(() => setReport(null));
  }, [variationId]);

  const downloadDocument = async (format: 'pdf' | 'html') => {
    setExporting(format);
    try {
      const url = `/api/evidence-pack/${encodeURIComponent(variationId)}/export.${format}?lang=${exportLang}&_=${Date.now()}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Export failed');
      }
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `Cascade-EP-${variationId}.${format}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setExporting(null);
    }
  };

  const r = t.report;
  const es = report?.executive_summary;
  const pack = report?.evidence_pack;
  const clock = pack?.payment_clock;
  const prov = pack?.provability;
  const cert = pack?.certification_math;
  const annex = pack?.claim_annex;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">{r.title}</p>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            {pack?.pack_id ?? report?.metadata?.report_id ?? `RPT-${variationId}`}
          </h1>
          <p className="text-sm text-slate-600 mt-2">{r.reportSub}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">{r.packLabel}</p>
        </div>
        <div className="flex flex-col items-end gap-2 print:hidden no-print">
          <select
            value={exportLang}
            onChange={(e) => setExportLang(e.target.value as 'en' | 'zh-HK')}
            className="text-xs font-semibold border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
          >
            <option value="en">English</option>
            <option value="zh-HK">繁體中文（粵語書面語）</option>
          </select>
          <div className="flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              disabled={!!exporting}
              onClick={() => downloadDocument('pdf')}
              className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-teal-700/20 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {exporting === 'pdf' ? 'Generating…' : 'Download PDF'}
            </button>
            <button
              type="button"
              disabled={!!exporting}
              onClick={() => downloadDocument('html')}
              className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-teal-600 text-slate-800 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {exporting === 'html' ? 'Generating…' : 'Download HTML'}
            </button>
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
            >
              Print
            </button>
          </div>
        </div>
      </div>

      {!report ?
        <div className="h-96 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
      : <article className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden print:shadow-none">
          <header className="px-8 py-6 border-b border-slate-200 bg-slate-50/80 relative">
            <div className="absolute top-6 right-6 rotate-6 border-[3px] border-blue-700 text-blue-800 px-4 py-2 rounded-xl text-center font-black uppercase tracking-widest text-xs opacity-90 pointer-events-none hidden sm:block">
              <div>{r.evidenceStampTop}</div>
              <div className="text-[10px] mt-0.5">{r.evidenceStampBottom}</div>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.brandSub}</div>
            <h2 className="text-lg font-black text-slate-900 mt-1">
              {report.variation_id} — {report.variation_title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">{r.projectInfo}</p>
            {report.metadata && (
              <dl className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                <div>
                  <dt className="text-slate-400 font-semibold">{r.issuedLabel}</dt>
                  <dd className="font-mono font-bold text-slate-800">{report.metadata.issued_date}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-semibold">{r.preparedLabel}</dt>
                  <dd className="text-slate-700">{report.metadata.prepared_by}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-slate-400 font-semibold">{r.integrityLabel}</dt>
                  <dd className="font-mono text-slate-600 truncate">
                    {pack?.document_hash ?? report.metadata.document_hash}
                  </dd>
                </div>
              </dl>
            )}
          </header>

          {/* Cap 652 payment clock + payable */}
          <div className="px-8 py-5 bg-slate-900 text-white grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 lg:col-span-2">
              <Gavel className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-200/90">{r.cap652Title}</div>
                <p className="text-sm text-slate-100/90 mt-1">
                  {clock?.ordinance ?? report.metadata?.cap652_reference}
                </p>
                {clock && (
                  <div className="mt-3 flex flex-wrap gap-3 text-[11px] font-mono text-slate-300">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {r.responseDue}: {clock.response_deadline}
                    </span>
                    <span>
                      {r.daysLeft}: {clock.days_to_response}d · {clock.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase text-slate-400 font-bold">{r.payableRow}</div>
              <div className="text-3xl font-black font-mono text-white">
                HK$ {fmt(clock?.admitted_payable_hkd ?? es?.payable_delta ?? 7500)}
              </div>
              {clock && (
                <div className="text-[10px] text-slate-400 mt-1">
                  {r.disputedLabel} HK$ {fmt(clock.disputed_hkd)} · {r.withheldLabel} HK${' '}
                  {fmt(clock.withheld_pending_milestones_hkd)}
                </div>
              )}
            </div>
          </div>

          <div className="p-8 space-y-10">
            {/* Provability + exec KPIs */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {prov && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 lg:col-span-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">{r.provabilityTitle}</div>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-4xl font-black font-mono text-emerald-900">{prov.score}</span>
                    <span className="text-sm text-emerald-700 mb-1">/100 · {prov.band}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{prov.summary}</p>
                  <ul className="mt-3 space-y-1.5">
                    {prov.signals.map((s) => (
                      <li key={s.id} className="flex items-start gap-2 text-[11px]">
                        {s.met ?
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        : <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />}
                        <span className="text-slate-700">
                          <span className="font-semibold">{s.label}</span>
                          <span className="text-slate-500"> — {s.note}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: r.fairValueRow, value: `HK$ ${fmt(es?.total_fair_value ?? 0)}`, tone: 'slate' },
                  {
                    label: r.inflatedRow,
                    value: `HK$ ${fmt(es?.inflated_amount_detected ?? 0)} (${es?.inflated_percentage ?? 0}%)`,
                    tone: 'red',
                  },
                  { label: r.payableRow, value: `HK$ ${fmt(es?.payable_delta ?? 0)}`, tone: 'emerald' },
                  { label: r.completenessRow, value: es?.completeness_cv ?? '—', tone: 'slate' },
                ].map((row) => (
                  <div
                    key={row.label}
                    className={`rounded-2xl border p-4 ${
                      row.tone === 'red' ? 'border-red-200 bg-red-50/50'
                      : row.tone === 'emerald' ? 'border-emerald-200 bg-emerald-50/60'
                      : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="text-[11px] text-slate-500 font-medium">{row.label}</div>
                    <div
                      className={`text-lg font-black font-mono mt-1 ${
                        row.tone === 'red' ? 'text-red-700'
                        : row.tone === 'emerald' ? 'text-emerald-900'
                        : 'text-slate-900'
                      }`}
                    >
                      {row.value}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Variation workflow */}
            {pack?.variation_workflow && (
              <section>
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  <Workflow className="w-4 h-4" />
                  {r.workflowTitle}
                </h3>
                <ol className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {pack.variation_workflow.map((w) => {
                    const tone = statusTone(w.status);
                    return (
                      <li
                        key={w.step}
                        className={`rounded-2xl border p-4 text-xs ${
                          tone === 'emerald' ? 'border-emerald-200 bg-emerald-50/40'
                          : tone === 'red' ? 'border-red-200 bg-red-50/40'
                          : tone === 'amber' ? 'border-amber-200 bg-amber-50/40'
                          : 'border-slate-200 bg-slate-50/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-slate-900">
                            {w.step}. {w.stage}
                          </span>
                          <span className="font-mono text-[10px] uppercase text-slate-500">{w.status}</span>
                        </div>
                        <div className="font-mono text-[10px] text-emerald-800 mt-1">{w.ref}</div>
                        <p className="text-slate-600 mt-2 leading-relaxed">{w.detail}</p>
                        <div className="text-slate-400 mt-2">{w.date}</div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}

            {/* Certification math */}
            {cert && (
              <section className="rounded-2xl border border-[#E5E0D0] bg-[#FAFAF8] p-6">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  <Scale className="w-4 h-4" />
                  {r.certMathTitle}
                </h3>
                <p className="text-sm text-slate-800 font-medium">{cert.formula}</p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl bg-white border border-slate-200 p-3">
                    <div className="text-slate-400">{r.fairValueRow}</div>
                    <div className="font-mono font-black text-lg">HK$ {fmt(cert.fair_value_hkd)}</div>
                  </div>
                  <div className="rounded-xl bg-white border border-emerald-200 p-3">
                    <div className="text-slate-400">{r.payableRow}</div>
                    <div className="font-mono font-black text-lg text-emerald-800">
                      HK$ {fmt(cert.payable_this_period_hkd)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-white border border-amber-200 p-3">
                    <div className="text-slate-400">{r.withheldLabel}</div>
                    <div className="font-mono font-black text-lg text-amber-800">HK$ {fmt(cert.withheld_hkd)}</div>
                  </div>
                </div>
                {cert.milestones?.length > 0 && (
                  <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-500 uppercase text-[10px]">
                          <th className="py-2 px-3">{r.colElement}</th>
                          <th className="py-2 px-2">{r.colStatus}</th>
                          <th className="py-2 px-2">{r.colProgress}</th>
                          <th className="py-2 px-2">{r.colWeight}</th>
                          <th className="py-2 px-3">{r.colCitation}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {cert.milestones.map((m) => (
                          <tr key={m.element}>
                            <td className="py-2 px-3 font-semibold text-slate-800">{m.element}</td>
                            <td className="py-2 px-2 font-mono">{m.status}</td>
                            <td className="py-2 px-2 font-mono">{m.progress_pct}%</td>
                            <td className="py-2 px-2 font-mono">{m.weight_pct}%</td>
                            <td className="py-2 px-3 text-slate-500">{m.citation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {/* Ordered evidence records */}
            {pack?.records && (
              <section>
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  <FileCheck className="w-4 h-4" />
                  {r.evidenceThreadTitle}
                </h3>
                <ol className="space-y-3">
                  {pack.records.map((rec) => (
                    <li key={rec.seq} className="flex gap-4 p-4 rounded-2xl border border-[#E5E0D0] bg-[#FAFAF8] text-sm">
                      <span className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {rec.seq}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <div className="font-bold text-slate-900">{rec.title}</div>
                          <div className="text-[10px] font-mono text-slate-400">{rec.date}</div>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {rec.type} · {rec.source}
                        </div>
                        <p className="text-xs text-slate-700 mt-2 leading-relaxed">{rec.summary}</p>
                        {rec.citation_ids && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {rec.citation_ids.map((cid) => (
                              <span
                                key={cid}
                                className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200"
                              >
                                [{cid}]
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Methodology */}
            {report.methodology && report.methodology.length > 0 && (
              <section>
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  <FileCheck className="w-4 h-4" />
                  {r.methodologyTitle}
                </h3>
                <ol className="space-y-3">
                  {report.methodology.map((m) => (
                    <li
                      key={m.step}
                      className="flex gap-4 p-4 rounded-2xl border border-[#E5E0D0] bg-white text-sm"
                    >
                      <span className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {m.step}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900">{m.module}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{m.engine}</div>
                        <div className="text-xs text-emerald-900 font-mono mt-2 flex items-start gap-1">
                          <Link2 className="w-3 h-3 shrink-0 mt-0.5" />
                          {m.citation}
                        </div>
                        <div className="text-xs text-slate-700 mt-1">{m.outcome}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Citation register */}
            {report.citations && report.citations.length > 0 && (
              <section>
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  <BookOpen className="w-4 h-4" />
                  {r.citationRegisterTitle}
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-500 uppercase tracking-wide text-[10px]">
                        <th className="py-3 px-4 font-semibold">{r.colCitationId}</th>
                        <th className="py-3 px-2 font-semibold">{r.colCategory}</th>
                        <th className="py-3 px-2 font-semibold">{r.colSource}</th>
                        <th className="py-3 px-2 font-semibold">{r.colReference}</th>
                        <th className="py-3 px-4 font-semibold">{r.colSupports}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.citations.map((c) => (
                        <tr key={c.id} className="hover:bg-emerald-50/30 align-top">
                          <td className="py-3 px-4 font-mono font-bold text-emerald-800">{c.id}</td>
                          <td className="py-3 px-2 font-semibold text-slate-800">{c.category}</td>
                          <td className="py-3 px-2 text-slate-600">{c.source}</td>
                          <td className="py-3 px-2">
                            <div className="font-mono text-slate-800">{c.reference}</div>
                            <p className="text-slate-500 mt-1 leading-relaxed max-w-md">{c.excerpt}</p>
                          </td>
                          <td className="py-3 px-4 text-slate-700">{c.supports}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Valuation build-up (reconciles to 18,750) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {report.valuation_lines && (
                <section>
                  <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">{r.valuationLinesTitle}</h4>
                  <ul className="space-y-2 text-xs">
                    {report.valuation_lines.map((line) => (
                      <li
                        key={line.item}
                        className="flex justify-between items-start gap-2 py-2 border-b border-slate-100"
                      >
                        <span>
                          <span className="font-semibold text-slate-900">{line.item}</span>
                          <span className="text-slate-500 ml-1">
                            ({line.qty}
                            {line.rate != null ? ` × ${fmt(line.rate)}` : ''})
                          </span>
                          <span className="ml-2 font-mono text-emerald-700 text-[10px]">[{line.citation_id}]</span>
                        </span>
                        <span className="font-mono font-bold shrink-0">{fmt(line.amount)}</span>
                      </li>
                    ))}
                    {report.valuation_subtotal != null && (
                      <li className="flex justify-between py-1 text-slate-500">
                        <span>{r.subtotalLabel}</span>
                        <span className="font-mono">{fmt(report.valuation_subtotal)}</span>
                      </li>
                    )}
                    {report.valuation_adjustments && (
                      <li className="flex justify-between py-1 text-slate-600">
                        <span>{report.valuation_adjustments.description}</span>
                        <span className="font-mono">{fmt(report.valuation_adjustments.amount)}</span>
                      </li>
                    )}
                    <li className="flex justify-between py-2 font-black text-slate-900 border-t border-slate-200">
                      <span>{r.fairValueRow}</span>
                      <span className="font-mono">HK$ {fmt(report.fair_value_total ?? es?.total_fair_value ?? 0)}</span>
                    </li>
                  </ul>
                </section>
              )}
              {report.deductions && (
                <section>
                  <h4 className="text-xs font-bold uppercase text-red-500 mb-3">{r.deductionsTitle}</h4>
                  <ul className="space-y-2 text-xs">
                    {report.deductions.map((d) => (
                      <li key={d.item} className="flex justify-between py-2 border-b border-red-100">
                        <span className="text-slate-700">
                          {d.item}{' '}
                          <span className="font-mono text-red-600 text-[10px]">[{d.citation_id}]</span>
                        </span>
                        <span className="font-mono font-bold text-red-600">{fmt(d.amount)}</span>
                      </li>
                    ))}
                    <li className="flex justify-between py-2 font-black text-red-700 border-t border-red-200">
                      <span>{r.inflatedRow}</span>
                      <span className="font-mono">HK$ {fmt(report.variance_total ?? es?.inflated_amount_detected ?? 0)}</span>
                    </li>
                  </ul>
                </section>
              )}
            </div>

            {/* Claim annex — OCE-style dispute schedule */}
            {annex && annex.items?.length > 0 && (
              <section>
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  {r.claimAnnexTitle}
                </h3>
                <p className="text-xs text-slate-600 mb-3">{annex.title}</p>
                <div className="overflow-x-auto rounded-2xl border border-red-100">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="bg-red-50 text-red-700/80 uppercase text-[10px]">
                        <th className="py-2 px-3">{r.colItem}</th>
                        <th className="py-2 px-2 text-right">{r.colClaim}</th>
                        <th className="py-2 px-2 text-right">{r.colFair}</th>
                        <th className="py-2 px-2 text-right">{r.colVariance}</th>
                        <th className="py-2 px-2">{r.colFlag}</th>
                        <th className="py-2 px-3">{r.colReason}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-50">
                      {annex.items.map((row) => (
                        <tr key={row.item} className="align-top">
                          <td className="py-2 px-3 font-semibold text-slate-800">{row.item}</td>
                          <td className="py-2 px-2 text-right font-mono">{fmt(row.claim_amount)}</td>
                          <td className="py-2 px-2 text-right font-mono">{fmt(row.cascade_fair)}</td>
                          <td className="py-2 px-2 text-right font-mono text-red-600">{fmt(row.variance)}</td>
                          <td className="py-2 px-2">
                            <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                              {row.flag}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600 max-w-xs">{row.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-bold">
                        <td className="py-2 px-3">{r.totalLabel}</td>
                        <td className="py-2 px-2 text-right font-mono">{fmt(annex.total_claim)}</td>
                        <td className="py-2 px-2 text-right font-mono">{fmt(annex.total_cascade_fair)}</td>
                        <td className="py-2 px-2 text-right font-mono text-red-700">{fmt(annex.total_variance)}</td>
                        <td colSpan={2} className="py-2 px-3 text-red-700">
                          {annex.inflated_percentage}% {r.inflationLabel}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <p className="text-xs text-slate-600 mt-3">{annex.recommendation}</p>
              </section>
            )}

            {report.references && report.references.length > 0 && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">{r.auditTrailTitle}</h3>
                <div className="flex flex-wrap gap-2">
                  {report.references.map((ref) => (
                    <span
                      key={`${ref.label}-${ref.ref}`}
                      className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full bg-[#FAF8F3] border border-[#E5E0D0] font-mono"
                    >
                      <span className="font-bold text-slate-700">{ref.label}:</span>
                      <span className="text-slate-600">{ref.ref}</span>
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Conclusion + sign-off */}
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-900 mb-2">
                <ShieldCheck className="w-4 h-4" />
                {r.conclusionTitle}
              </h4>
              <p className="text-sm text-slate-800 leading-relaxed">{report.conclusion}</p>
              {clock && (
                <p className="text-xs text-emerald-900 mt-3 font-medium border-t border-emerald-200/80 pt-3">
                  {r.paymentResponseLabel}: {clock.response_basis}
                </p>
              )}
              <div className="mt-6 pt-6 border-t border-emerald-200/80 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div>
                  <div className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">{r.signoffPrepared}</div>
                  <div className="mt-8 border-b border-slate-400 w-48" />
                  <div className="mt-2 text-slate-600">{report.metadata?.prepared_by}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">{r.signoffReviewer}</div>
                  <div className="mt-8 border-b border-slate-400 w-48" />
                  <div className="mt-2 text-slate-600">{report.metadata?.reviewer_role}</div>
                </div>
              </div>
              {pack?.inspired_by && (
                <p className="mt-6 text-[10px] text-slate-400 leading-relaxed print:hidden">
                  {r.builtOnLabel}: {pack.inspired_by.join(' · ')}
                </p>
              )}
            </section>
          </div>
        </article>
      }
    </div>
  );
}
