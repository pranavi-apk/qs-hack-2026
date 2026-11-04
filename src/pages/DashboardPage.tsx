import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardCheck,
  FileText,
  GitBranch,
  Info,
  Scale,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { Language, Translations } from '../i18n';

type TabId =
  | 'dashboard'
  | 'impact_trace'
  | 'fair_value'
  | 'claim_check'
  | 'as_built'
  | 'report';

type DashboardPayload = {
  kpis: {
    active_variations: number;
    active_variations_trend: string;
    total_claim_amount: number;
    total_claim_trend: string;
    items_checked: number;
    items_checked_pct: string;
    flagged_items: number;
    flagged_items_label: string;
  };
  recent_variations: {
    id: string;
    title: string;
    status: string;
    impact: string;
    updated: string;
    affected_items?: number;
    cost?: number;
  }[];
  impact_summary: { total: number; direct: number; indirect_2hop: number; indirect_3hop: number };
};

type Props = {
  lang: Language;
  t: Translations;
  govData: {
    tender_price_index?: { bwtpi?: number; trend?: string };
    daily_wages?: { trade: string; rate_hkd: number }[];
  } | null;
  onNavigate: (tab: TabId) => void;
};

const DEMO_ID = 'V-2026-017';

function ImpactDonut({
  total,
  direct,
  hop2,
  hop3,
  labels,
}: {
  total: number;
  direct: number;
  hop2: number;
  hop3: number;
  labels: { direct: string; h2: string; h3: string; center: string };
}) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const parts = [
    { v: direct, color: '#1A3D32' },
    { v: hop2, color: '#D97706' },
    { v: hop3, color: '#94A3B8' },
  ];
  let offset = 0;
  return (
    <svg viewBox="0 0 140 140" className="w-40 h-40">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#E8E4D8" strokeWidth="14" />
      {parts.map((p, i) => {
        const dash = (p.v / total) * c;
        const el = (
          <circle
            key={i}
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke={p.color}
            strokeWidth="14"
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 70 70)"
            strokeLinecap="round"
          />
        );
        offset += dash;
        return el;
      })}
      <text x="70" y="66" textAnchor="middle" className="fill-slate-900 text-[22px] font-black" style={{ fontFamily: 'var(--font-mono)' }}>
        {total}
      </text>
      <text x="70" y="82" textAnchor="middle" className="fill-slate-500 text-[8px] font-bold uppercase">
        {labels.center}
      </text>
    </svg>
  );
}

export default function DashboardPage({ lang, t, govData, onNavigate }: Props) {
  const [data, setData] = useState<DashboardPayload | null>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const kpis = data?.kpis;
  const impact = data?.impact_summary ?? { total: 263, direct: 48, indirect_2hop: 126, indirect_3hop: 89 };

  const pipeline = useMemo(
    () => [
      { tab: 'impact_trace' as TabId, icon: GitBranch, label: t.nav.impactTrace, done: true },
      { tab: 'fair_value' as TabId, icon: ClipboardCheck, label: t.nav.fairValue, done: true },
      { tab: 'claim_check' as TabId, icon: Scale, label: t.nav.claimCheck, done: true, alert: true },
      { tab: 'as_built' as TabId, icon: ShieldCheck, label: t.nav.asBuilt, done: false, active: true },
      { tab: 'report' as TabId, icon: FileText, label: t.nav.report, done: false },
    ],
    [t.nav]
  );

  const statusLabel = (status: string) => {
    const map: Record<string, Record<Language, string>> = {
      'In Progress': { en: 'In Progress', 'zh-HK': '進行中', 'zh-CN': '进行中' },
      Reviewed: { en: 'Reviewed', 'zh-HK': '已審查', 'zh-CN': '已审查' },
      Completed: { en: 'Completed', 'zh-HK': '已完成', 'zh-CN': '已完成' },
    };
    return map[status]?.[lang] ?? status;
  };

  const impactLabel = (impact: string) => {
    const map: Record<string, Record<Language, string>> = {
      High: { en: 'High', 'zh-HK': '重大', 'zh-CN': '高' },
      Medium: { en: 'Medium', 'zh-HK': '中等', 'zh-CN': '中' },
      Low: { en: 'Low', 'zh-HK': '輕微', 'zh-CN': '低' },
    };
    return map[impact]?.[lang] ?? impact;
  };

  const titleForRow = (v: { id: string; title: string }) => {
    if (v.id !== DEMO_ID) return v.title;
    return lang === 'en' ? 'Lobby size increase 20%' : lang === 'zh-HK' ? '地下大堂面積擴展 20%' : '首层门厅面积扩建 20%';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-800/80 mb-1">
            {t.pills.cap652Status} · {t.pills.cap652Active}
          </p>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{t.dashboard.welcomeTitle}</h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">{t.dashboard.welcomeSub}</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('impact_trace')}
          className="inline-flex items-center justify-center gap-2 bg-[#1A3D32] hover:bg-[#132E26] text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-lg transition-all cursor-pointer shrink-0"
        >
          {t.dashboard.inspectBtn}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Demo variation — workflow */}
      <section className="rounded-3xl border border-[#DFDAC8] bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[#FAF8F3] to-white flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">{t.dashboard.demoFocus}</span>
            <h2 className="text-lg font-black text-slate-900 mt-0.5 font-mono">{DEMO_ID}</h2>
            <p className="text-sm text-slate-600 mt-1">{titleForRow({ id: DEMO_ID, title: '' })}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="text-right">
              <div className="text-[10px] uppercase text-slate-400 font-bold">{t.dashboard.metricFairValue}</div>
              <div className="font-mono font-black text-emerald-900">HK$ 18,750</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase text-red-400 font-bold">{t.dashboard.metricInflation}</div>
              <div className="font-mono font-black text-red-600">HK$ 5,920</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase text-slate-400 font-bold">{t.dashboard.metricPayable}</div>
              <div className="font-mono font-black text-slate-900">HK$ 7,500</div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-xs font-bold text-slate-500 mb-4">{t.dashboard.pipelineTitle}</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {pipeline.map((step, idx) => {
              const Icon = step.icon;
              return (
                <button
                  key={step.tab}
                  type="button"
                  onClick={() => onNavigate(step.tab)}
                  className={`relative text-left p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                    step.active ?
                      'border-emerald-500 bg-emerald-50/80 shadow-md'
                    : step.alert ?
                      'border-red-200 bg-red-50/40 hover:border-red-300'
                    : step.done ?
                      'border-slate-200 bg-slate-50/50 hover:border-emerald-300'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-mono text-slate-400">{idx + 1}</span>
                  <div className="flex items-center gap-2 mt-2">
                    <Icon className={`w-4 h-4 ${step.active ? 'text-emerald-700' : 'text-slate-600'}`} />
                    {step.done ?
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto" />
                    : step.active ?
                      <Circle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-100 ml-auto" />
                    : null}
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 mt-2 leading-snug">{step.label}</div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: t.dashboard.kpiActive,
            value: kpis?.active_variations ?? 12,
            sub: kpis?.active_variations_trend ?? t.dashboard.kpiActiveTrend,
            icon: GitBranch,
            tone: 'emerald' as const,
            up: true,
          },
          {
            label: t.dashboard.kpiClaims,
            value: `$${(kpis?.total_claim_amount ?? 168590).toLocaleString()}`,
            sub: kpis?.total_claim_trend ?? t.dashboard.kpiClaimsTrend,
            icon: Scale,
            tone: 'slate' as const,
          },
          {
            label: t.dashboard.kpiChecked,
            value: kpis?.items_checked ?? 328,
            sub: kpis?.items_checked_pct ?? t.dashboard.kpiCheckedSub,
            icon: ClipboardCheck,
            tone: 'emerald' as const,
            progress: 76,
          },
          {
            label: t.dashboard.kpiFlagged,
            value: kpis?.flagged_items ?? 23,
            sub: kpis?.flagged_items_label ?? t.dashboard.kpiFlaggedSub,
            icon: AlertTriangle,
            tone: 'red' as const,
            alert: true,
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-2xl border p-5 shadow-sm ${
                card.alert ? 'border-red-200 bg-gradient-to-br from-red-50/80 to-white' : 'border-[#E5E0D0] bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{card.label}</span>
                <div
                  className={`p-2 rounded-xl ${card.tone === 'red' ? 'bg-red-100 text-red-700' : card.tone === 'emerald' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-black font-mono text-slate-900">{card.value}</div>
              <div className="mt-2 flex items-center text-xs font-semibold text-slate-600 gap-1">
                {card.up && <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
                {card.label === t.dashboard.kpiClaims && <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />}
                {card.sub}
              </div>
              {card.progress != null && (
                <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${card.progress}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Variations table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E5E0D0] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900">{t.dashboard.recentTitle}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{t.dashboard.recentSub}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100 bg-[#FAFAF8]">
                  <th className="py-3 px-6 font-semibold">{t.dashboard.colId}</th>
                  <th className="py-3 px-2 font-semibold">{t.dashboard.colTitle}</th>
                  <th className="py-3 px-2 font-semibold">{t.dashboard.colStatus}</th>
                  <th className="py-3 px-2 font-semibold">{t.dashboard.colImpact}</th>
                  <th className="py-3 px-2 font-semibold text-right">{t.dashboard.colFairValue}</th>
                  <th className="py-3 px-6 font-semibold text-right">{t.dashboard.colAction}</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recent_variations ?? []).map((row) => {
                  const isDemo = row.id === DEMO_ID;
                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-slate-50 transition-colors ${
                        isDemo ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-4 px-6 font-mono font-bold text-slate-900">{row.id}</td>
                      <td className="py-4 px-2 font-medium text-slate-800 max-w-[200px]">{titleForRow(row)}</td>
                      <td className="py-4 px-2">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            row.status === 'Completed' ? 'bg-emerald-100 text-emerald-800'
                            : row.status === 'Reviewed' ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {statusLabel(row.status)}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            row.impact === 'High' ? 'bg-red-100 text-red-800'
                            : row.impact === 'Medium' ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {impactLabel(row.impact)}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right font-mono font-semibold text-slate-800">
                        {row.cost != null ? `$${row.cost.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isDemo ?
                          <button
                            type="button"
                            onClick={() => onNavigate('impact_trace')}
                            className="text-emerald-800 font-bold text-xs inline-flex items-center gap-0.5 hover:underline cursor-pointer"
                          >
                            {lang === 'en' ? 'Open' : lang === 'zh-HK' ? '開啟' : '打开'}
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Impact summary */}
        <div className="bg-white rounded-3xl border border-[#E5E0D0] p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900">{t.dashboard.impactSummaryTitle}</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">{t.dashboard.impactSummarySub}</p>
          <div className="flex justify-center py-2">
            <ImpactDonut
              total={impact.total}
              direct={impact.direct}
              hop2={impact.indirect_2hop}
              hop3={impact.indirect_3hop}
              labels={{
                direct: t.dashboard.directItems,
                h2: t.dashboard.indirect1hop,
                h3: t.dashboard.indirect2hop,
                center: t.dashboard.totalAffected.replace('\n', ' '),
              }}
            />
          </div>
          <ul className="space-y-3 text-sm mt-auto pt-4 border-t border-slate-100">
            {[
              { c: '#1A3D32', label: t.dashboard.directItems, n: impact.direct },
              { c: '#D97706', label: t.dashboard.indirect1hop, n: impact.indirect_2hop },
              { c: '#94A3B8', label: t.dashboard.indirect2hop, n: impact.indirect_3hop },
            ].map((row) => (
              <li key={row.label} className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: row.c }} />
                  {row.label}
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {row.n}{' '}
                  <span className="text-slate-400 font-normal text-xs">
                    ({((row.n / impact.total) * 100).toFixed(1)}%)
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => onNavigate('impact_trace')}
            className="mt-4 w-full py-2.5 rounded-xl border border-emerald-200 text-emerald-900 text-xs font-bold hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            {t.dashboard.viewGraphBtn}
          </button>
        </div>
      </div>

      {govData && (
        <div className="rounded-2xl bg-[#1C3A30] text-white p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/80">{t.dashboard.dataGovHkTitle}</div>
              <div className="text-sm font-semibold mt-1">
                {t.dashboard.dataGovHkDesc}:{' '}
                <span className="font-mono text-emerald-300">{govData.tender_price_index?.bwtpi ?? 2180}</span>{' '}
                <span className="text-emerald-200/90">({govData.tender_price_index?.trend ?? '+1.8%'})</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-emerald-100/90">
            {(govData.daily_wages ?? []).slice(0, 3).map((w) => (
              <span key={w.trade}>
                {w.trade}: <strong className="text-white font-mono">${w.rate_hkd}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
