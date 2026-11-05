import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  FileCheck,
  GitBranch,
  LayoutGrid,
  Paperclip,
  Scale,
  Calculator,
} from 'lucide-react';
import PackImpactPanel from '../components/PackImpactPanel';
import CaseOverviewPanel from '../components/CaseOverviewPanel';
import CitedReportPage from './CitedReportPage';
import type { ImpactGraphPayload } from '../components/ImpactKnowledgeGraph';
import { translations } from '../i18n';
import {
  ChatMsg,
  PIPELINE_STEPS,
  ViewId,
  replyToPrompt,
} from '../agent/chatEngine';

type Props = {
  initialPrompt: string;
  files: File[];
  variationId: string;
  sample: boolean;
  caseTitle?: string;
  onHome: () => void;
  onExport: () => void;
  onReingest: (files: File[]) => Promise<void>;
  ingestVersion: number;
};

const NAV: { id: ViewId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Case overview', icon: <LayoutGrid size={18} /> },
  { id: 'pack', label: 'Pack & impact', icon: <GitBranch size={18} /> },
  { id: 'value', label: 'Fair value', icon: <Calculator size={18} /> },
  { id: 'claim', label: 'Claim check', icon: <Scale size={18} /> },
  { id: 'report', label: 'Evidence pack', icon: <FileCheck size={18} /> },
];

function fmt(n: number) {
  return n.toLocaleString('en-HK', { maximumFractionDigits: 0 });
}

export default function AgentWorkspace({
  initialPrompt,
  files,
  variationId,
  sample,
  caseTitle,
  onHome,
  onExport,
  onReingest,
  ingestVersion,
}: Props) {
  const [view, setView] = useState<ViewId>('overview');
  const [phase, setPhase] = useState<'running' | 'ready'>('running');
  const [stepIdx, setStepIdx] = useState(0);
  const [detail, setDetail] = useState<any>(null);
  const [cv, setCv] = useState<any>(null);
  const [graph, setGraph] = useState<ImpactGraphPayload | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState('');
  const [sidecarOpen, setSidecarOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const t = translations.en;

  const fairValue = detail?.fair_value_calculation?.total_fair_value ?? 18750;
  const inflation = detail?.contractor_claim_adjudication?.total_variance ?? 5920;
  const payable = cv?.certification?.payable_milestone_hkd ?? 7500;
  const completeness = cv?.certification?.weighted_completeness_pct ?? 60;
  const docCount = Math.max(files.length, 6);

  useEffect(() => {
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setStepIdx(i);
      if (i >= PIPELINE_STEPS.length) {
        window.clearInterval(timer);
        setPhase('ready');
      }
    }, 450);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setDetail(null);
    setCv(null);
    setGraph(null);
    fetch(`/api/variation/${encodeURIComponent(variationId)}`)
      .then((r) => {
        if (!r.ok) throw new Error('Case not found');
        return r.json();
      })
      .then(setDetail)
      .catch(() => null);
    fetch(`/api/cv/module/${encodeURIComponent(variationId)}`)
      .then((r) => r.json())
      .then(setCv)
      .catch(() => null);
    fetch(`/api/graph/${encodeURIComponent(variationId)}`)
      .then((r) => r.json())
      .then(setGraph)
      .catch(() => null);
  }, [variationId, ingestVersion]);

  useEffect(() => {
    if (phase !== 'ready') return;
    const first = replyToPrompt(initialPrompt, {
      fairValue,
      inflation,
      payable,
      completeness,
      docCount,
      variationId,
    });
    setMessages([
      { id: 'u0', role: 'user', text: initialPrompt },
      {
        id: 'a0',
        role: 'agent',
        text:
          (files.length
            ? `Ingested ${files.length} file(s) into case ${variationId}${caseTitle ? ` — ${caseTitle}` : ''}.\n\n`
            : sample ?
              `Opened sample case V-2026-017 (HA Block 4 lobby +20%).\n\n`
            : `Working on case ${variationId}.\n\n`) + first.text,
        viewHint: 'overview',
      },
    ]);
    setView('overview');
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, phase]);

  const ask = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const reply = replyToPrompt(trimmed, {
      fairValue,
      inflation,
      payable,
      completeness,
      docCount,
      variationId,
    });
    setMessages((m) => [
      ...m,
      { id: `u-${Date.now()}`, role: 'user', text: trimmed },
      {
        id: `a-${Date.now()}`,
        role: 'agent',
        text: reply.text,
        viewHint: reply.view,
      },
    ]);
    setView(reply.view);
    if (reply.view === 'overview' && /milestone certification/i.test(reply.text)) {
      window.setTimeout(() => {
        document.getElementById('case-milestones')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
    setDraft('');
    setSidecarOpen(false);
  };

  const fv = detail?.fair_value_calculation;
  const claim = detail?.contractor_claim_adjudication;
  const sampleDocs = [
    'AI-2026-084.pdf',
    'BQ_08-12_finishes.pdf',
    'A-201_lobby_plan.pdf',
    'VO_CLAIM_017.xlsx',
    'SPC_23_40_00.pdf',
    'Site_checklist_28Jul.pdf',
  ];
  const docNames = files.length ? files.map((f) => f.name) : sampleDocs;

  return (
    <div className="agent agent-chat-layout" style={{ height: '100vh' }}>
      <div className="agent-stage-wrapper">
        <div className="agent-stage" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {phase === 'running' ?
            <div className="agent-home-container" style={{ paddingTop: '18vh' }}>
              <h1 className="home-title" style={{ fontSize: '2rem' }}>
                Working on it…
              </h1>
              <p className="home-description">Cascade is running the variation pipeline.</p>
              <ul className="step-list" style={{ maxWidth: 420, margin: '1.5rem auto', textAlign: 'left' }}>
                {PIPELINE_STEPS.map((s, idx) => (
                  <li key={s} className={idx < stepIdx ? 'done' : ''}>
                    {idx < stepIdx ? '✓' : '·'} {s}
                  </li>
                ))}
              </ul>
            </div>
          : <div className="agent-layout-with-sidebar">
              <aside className="tracy-dark-sidebar no-print">
                <div>
                  <div className="sidebar-brand" style={{ cursor: 'pointer' }} onClick={onHome}>
                    <div style={{ color: '#5eead4', fontWeight: 800, letterSpacing: '0.2em', fontSize: 13 }}>
                      CASCADE
                    </div>
                    <div style={{ color: '#7a958a', fontSize: 11, marginTop: 4 }}>QS agent</div>
                  </div>
                  <nav className="sidebar-nav-list">
                    {NAV.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`sidebar-nav-item ${view === item.id ? 'active' : ''}`}
                        onClick={() => setView(item.id)}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </aside>

              <div className={`agent-work-split-container ${sidecarOpen ? '' : 'sidecar-collapsed'}`}>
              <div className="agent-main-content-panel">
                <div className="panel-subnav-bar no-print">
                  <div className="panel-case-title">
                    {variationId}
                    {detail?.title ? ` · ${detail.title}` : caseTitle ? ` · ${caseTitle}` : ''}
                  </div>
                  <button
                    type="button"
                    className={`btn-toggle-copilot ${sidecarOpen ? 'active' : ''}`}
                    onClick={() => setSidecarOpen((v) => !v)}
                  >
                    Copilot
                  </button>
                </div>
                <div className="agent-panel-body">
                  {view === 'overview' && (
                    <CaseOverviewPanel
                      detail={detail}
                      cv={cv}
                      docCount={docCount}
                      navItems={NAV}
                      onNavigate={setView}
                    />
                  )}

                  {view === 'pack' &&
                    (graph ?
                      <PackImpactPanel
                        data={graph}
                        uploadedNames={files.length ? files.map((f) => f.name) : docNames}
                        onUpload={(list) => {
                          void onReingest(Array.from(list));
                        }}
                      />
                    : <div className="metric">Loading pack &amp; impact graph…</div>)}

                  {view === 'value' && (
                    <div>
                      <h2 style={{ marginTop: 0 }}>HKSMM4 fair value</h2>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                          <tr style={{ textAlign: 'left', color: '#6b645b', fontSize: 11 }}>
                            <th style={{ padding: 8 }}>Item</th>
                            <th style={{ padding: 8 }}>Qty</th>
                            <th style={{ padding: 8, textAlign: 'right' }}>Rate</th>
                            <th style={{ padding: 8, textAlign: 'right' }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(fv?.items ?? []).map((row: any) => (
                            <tr key={row.item} style={{ borderTop: '1px solid #efe8da' }}>
                              <td style={{ padding: 8, fontWeight: 600 }}>{row.item}</td>
                              <td style={{ padding: 8 }}>
                                {row.qty} {row.unit}
                              </td>
                              <td style={{ padding: 8, textAlign: 'right' }}>{fmt(row.rate)}</td>
                              <td style={{ padding: 8, textAlign: 'right' }}>{fmt(row.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p style={{ marginTop: 16, fontWeight: 700 }}>
                        Fair value HK$ {fmt(fairValue)}
                      </p>
                    </div>
                  )}

                  {view === 'claim' && (
                    <div>
                      <h2 style={{ marginTop: 0 }}>Claim check</h2>
                      <p style={{ color: '#dc2626', fontWeight: 600 }}>
                        Inflation HK$ {fmt(inflation)} ({claim?.inflated_percentage ?? 26.3}%)
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                        {(claim?.items ?? []).map((row: any) => (
                          <div key={row.item} className="doc-file-card" style={{ alignItems: 'flex-start' }}>
                            <div className="doc-file-details">
                              <strong>
                                {row.item} · {row.flag}
                              </strong>
                              <span style={{ fontSize: 12, color: '#787062' }}>
                                Claim {fmt(row.claim_amount)} vs fair {fmt(row.cascade_fair)} · Δ {fmt(row.variance)}
                              </span>
                              <span style={{ fontSize: 12, marginTop: 4 }}>{row.reason}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {view === 'report' && (
                    <CitedReportPage t={t} variationId={variationId} onExport={onExport} />
                  )}
                </div>
              </div>

              {sidecarOpen && (
                <aside className="agent-sidecar-chat-panel no-print">
                  <div className="sidecar-header">
                    <div className="copilot-header-avatar">✦</div>
                    <div className="sidecar-title-group">
                      <strong>Cascade</strong>
                      <span className="sidecar-status">
                        <span className="dot-active" /> Online
                      </span>
                    </div>
                  </div>
                  <div className="sidecar-messages">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={m.role === 'agent' ? 'sidecar-msg agent' : 'bubble user'}
                        style={
                          m.role === 'user'
                            ? {
                                alignSelf: 'flex-end',
                                background: '#1c1915',
                                color: '#f8f1e4',
                                borderRadius: 16,
                                padding: '0.75rem 1rem',
                                maxWidth: '85%',
                                fontSize: 14,
                              }
                            : undefined
                        }
                      >
                        {m.text.split('\n').map((line, i) => (
                          <p key={i} style={{ margin: i ? '0.35rem 0 0' : 0 }}>
                            {line}
                          </p>
                        ))}
                        {m.viewHint && m.role === 'agent' && (
                          <button
                            type="button"
                            className="btn-return-chat"
                            style={{ marginTop: 8 }}
                            onClick={() => setView(m.viewHint!)}
                          >
                            Open {m.viewHint}
                          </button>
                        )}
                      </div>
                    ))}
                    <div className="sidecar-suggested-section">
                      <div className="suggested-lbl">Suggested</div>
                      {[
                        'Show fair value build-up',
                        'Flag inflated claim lines',
                        'Open Cap. 652 evidence pack',
                      ].map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="sidecar-prompt-pill"
                          onClick={() => ask(s)}
                        >
                          <span className="pill-left">{s}</span>
                          <ArrowRight size={14} className="arrow-right" />
                        </button>
                      ))}
                    </div>
                    <div ref={endRef} />
                  </div>
                  <form
                    className="sidecar-composer-bar"
                    onSubmit={(e) => {
                      e.preventDefault();
                      ask(draft);
                    }}
                  >
                    <div className="composer-pill-input">
                      <button type="button" className="sidecar-attach-btn" title="Attach">
                        <Paperclip size={18} />
                      </button>
                      <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Ask Cascade about this variation…"
                        autoComplete="off"
                      />
                    </div>
                    <button type="submit" className="sidecar-send-btn-round" aria-label="Send">
                      <ArrowRight size={16} color="#fef08a" />
                    </button>
                  </form>
                </aside>
              )}
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
}
