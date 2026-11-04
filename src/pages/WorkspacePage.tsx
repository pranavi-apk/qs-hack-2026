import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calculator,
  FileCheck,
  FileText,
  GitBranch,
  Scale,
  Shield,
} from 'lucide-react';
import DocumentsPanel, { PackDoc } from '../components/DocumentsPanel';
import ImpactKnowledgeGraph, { ImpactGraphPayload, GraphNode } from '../components/ImpactKnowledgeGraph';
import CitedReportPage from './CitedReportPage';
import { translations, Language } from '../i18n';

type Tab = 'documents' | 'impact' | 'value' | 'claim' | 'certify' | 'report';

type Props = {
  lang: Language;
  setLang: (l: Language) => void;
  docs: PackDoc[];
  onUpload: (files: FileList) => void;
  onBack: () => void;
  onExport: () => void;
};

function fmt(n: number) {
  return n.toLocaleString('en-HK', { maximumFractionDigits: 0 });
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'documents', label: 'Documents', icon: <FileText className="w-3.5 h-3.5" /> },
  { id: 'impact', label: 'Impact', icon: <GitBranch className="w-3.5 h-3.5" /> },
  { id: 'value', label: 'Fair value', icon: <Calculator className="w-3.5 h-3.5" /> },
  { id: 'claim', label: 'Claim check', icon: <Scale className="w-3.5 h-3.5" /> },
  { id: 'certify', label: 'Certify', icon: <Shield className="w-3.5 h-3.5" /> },
  { id: 'report', label: 'Evidence pack', icon: <FileCheck className="w-3.5 h-3.5" /> },
];

export default function WorkspacePage({ lang, setLang, docs, onUpload, onBack, onExport }: Props) {
  const [tab, setTab] = useState<Tab>('documents');
  const [detail, setDetail] = useState<any>(null);
  const [cv, setCv] = useState<any>(null);
  const [graph, setGraph] = useState<ImpactGraphPayload | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const t = translations[lang];

  useEffect(() => {
    fetch('/api/variation/V-2026-017')
      .then((r) => r.json())
      .then(setDetail)
      .catch(() => setDetail(null));
    fetch('/api/cv/module/V-2026-017')
      .then((r) => r.json())
      .then(setCv)
      .catch(() => setCv(null));
    fetch('/api/graph/V-2026-017')
      .then((r) => r.json())
      .then(setGraph)
      .catch(() => setGraph(null));
  }, []);

  const fv = detail?.fair_value_calculation;
  const claim = detail?.contractor_claim_adjudication;
  const cert = cv?.certification;
  const milestones = cv?.milestones ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f4f6]">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="text-sm font-extrabold text-slate-900 tracking-wide">CASCADE</div>
              <div className="text-[11px] text-slate-500 mono">V-2026-017 · Lobby +20%</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 rounded-lg p-0.5 text-[11px] font-bold">
              {(['zh-HK', 'zh-CN', 'en'] as Language[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 rounded-md ${
                    lang === l ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'zh-HK' ? '繁' : '简'}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setTab('report')}
              className="hidden sm:inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg"
            >
              Open evidence pack
            </button>
          </div>
        </div>

        <nav className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto pb-2">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-bold px-3 py-2 rounded-lg ${
                tab === item.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {tab === 'documents' && <DocumentsPanel docs={docs} onUpload={onUpload} />}

          {tab === 'impact' && (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Impact</p>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">Contract knock-on graph</h2>
                <p className="text-sm text-slate-500 mt-1">
                  263 affected items from BQ / drawings / GCC ontology
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden min-h-[480px] p-2">
                {graph ?
                  <ImpactKnowledgeGraph
                    data={graph}
                    lang={lang}
                    selectedId={selectedNode?.id ?? null}
                    onSelectNode={setSelectedNode}
                  />
                : <div className="h-[480px] animate-pulse bg-slate-100 rounded-xl" />}
              </div>
              {selectedNode && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 text-sm">
                  <div className="font-bold text-slate-900">{selectedNode.label}</div>
                  <div className="text-xs text-slate-500 mono mt-1">{selectedNode.type}</div>
                </div>
              )}
            </div>
          )}

          {tab === 'value' && (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Fair value</p>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">HKSMM4 build-up</h2>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3">Qty</th>
                      <th className="px-4 py-3 text-right">Rate</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3">Basis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(fv?.items ?? []).map((row: any) => (
                      <tr key={row.item}>
                        <td className="px-4 py-3 font-semibold text-slate-900">{row.item}</td>
                        <td className="px-4 py-3 mono text-slate-600">
                          {row.qty} {row.unit}
                        </td>
                        <td className="px-4 py-3 mono text-right">{fmt(row.rate)}</td>
                        <td className="px-4 py-3 mono text-right font-bold">{fmt(row.amount)}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{row.basis}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold">
                    <tr>
                      <td className="px-4 py-3" colSpan={3}>
                        Sub-total
                      </td>
                      <td className="px-4 py-3 text-right mono">{fmt(fv?.subtotal ?? 0)}</td>
                      <td />
                    </tr>
                    <tr>
                      <td className="px-4 py-3" colSpan={3}>
                        {fv?.adjustments?.description ?? 'Prelim / OH&P'}
                      </td>
                      <td className="px-4 py-3 text-right mono">{fmt(fv?.adjustments?.amount ?? 0)}</td>
                      <td />
                    </tr>
                    <tr className="text-blue-800">
                      <td className="px-4 py-3" colSpan={3}>
                        Fair value
                      </td>
                      <td className="px-4 py-3 text-right mono text-lg">
                        HK$ {fmt(fv?.total_fair_value ?? 18750)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {tab === 'claim' && (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Claim check</p>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">Contractor vs Cascade</h2>
                <p className="text-sm text-red-600 font-semibold mt-1">
                  Inflation flagged HK$ {fmt(claim?.total_variance ?? 5920)} ({claim?.inflated_percentage ?? 26.3}%)
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[720px]">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3 text-right">Claim</th>
                      <th className="px-4 py-3 text-right">Fair</th>
                      <th className="px-4 py-3 text-right">Variance</th>
                      <th className="px-4 py-3">Flag</th>
                      <th className="px-4 py-3">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(claim?.items ?? []).map((row: any) => (
                      <tr key={row.item}>
                        <td className="px-4 py-3 font-semibold">{row.item}</td>
                        <td className="px-4 py-3 mono text-right">{fmt(row.claim_amount)}</td>
                        <td className="px-4 py-3 mono text-right">{fmt(row.cascade_fair)}</td>
                        <td className="px-4 py-3 mono text-right text-red-600">{fmt(row.variance)}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold uppercase bg-red-50 text-red-700 px-2 py-0.5 rounded">
                            {row.flag}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 max-w-xs">{row.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'certify' && (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Certify</p>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">Milestone certification</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Site photos support sign-off only — m² from Drawing A-201. No image gallery in this view.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className="text-[10px] uppercase text-slate-400 font-bold">Completeness</div>
                  <div className="text-2xl font-black mono mt-1">{cert?.weighted_completeness_pct ?? 60}%</div>
                </div>
                <div className="bg-white rounded-2xl border border-emerald-200 p-4">
                  <div className="text-[10px] uppercase text-slate-400 font-bold">Payable now</div>
                  <div className="text-2xl font-black mono text-emerald-700 mt-1">
                    HK$ {fmt(cert?.payable_milestone_hkd ?? 7500)}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-amber-200 p-4">
                  <div className="text-[10px] uppercase text-slate-400 font-bold">Withheld</div>
                  <div className="text-2xl font-black mono text-amber-700 mt-1">
                    HK$ {fmt(cert?.withheld_pending_hkd ?? 11250)}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Element</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Progress</th>
                      <th className="px-4 py-3">Weight</th>
                      <th className="px-4 py-3">Citation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {milestones.map((m: any) => (
                      <tr key={m.id}>
                        <td className="px-4 py-3 font-semibold">{m.element}</td>
                        <td className="px-4 py-3 mono text-xs">{m.status}</td>
                        <td className="px-4 py-3 mono">{m.progress_pct}%</td>
                        <td className="px-4 py-3 mono">{m.weight_pct}%</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{m.citation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {cert?.certifier_note && (
                <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  {cert.certifier_note}
                </p>
              )}
            </div>
          )}

          {tab === 'report' && (
            <CitedReportPage t={t} variationId="V-2026-017" onExport={onExport} />
          )}
        </div>
      </main>
    </div>
  );
}
