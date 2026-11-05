import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  FileCheck,
  FileText,
  GitBranch,
  LayoutGrid,
  Paperclip,
  Scale,
  Shield,
  Calculator,
} from 'lucide-react';
import ImpactTracePanel from '../components/ImpactTracePanel';
import type { ImpactGraphPayload } from '../components/ImpactKnowledgeGraph';
import CitedReportPage from './CitedReportPage';
import FairValuePanel from '../components/FairValuePanel';
import ClaimCheckPanel from '../components/ClaimCheckPanel';
import type { VariationDetail } from '../lib/valuation';
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
  onHome: () => void;
  onExport: () => void;
};

const NAV: { id: ViewId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Case overview', icon: <LayoutGrid size={18} /> },
  { id: 'documents', label: 'Documents', icon: <FileText size={18} /> },
  { id: 'impact', label: 'Impact graph', icon: <GitBranch size={18} /> },
  { id: 'value', label: 'Fair value', icon: <Calculator size={18} /> },
  { id: 'claim', label: 'Claim check', icon: <Scale size={18} /> },
  { id: 'certify', label: 'Certify', icon: <Shield size={18} /> },
  { id: 'report', label: 'Evidence pack', icon: <FileCheck size={18} /> },
];

function fmt(n: number) {
  return n.toLocaleString('en-HK', { maximumFractionDigits: 0 });
}

export default function AgentWorkspace({ initialPrompt, files, onHome, onExport }: Props) {
  const [view, setView] = useState<ViewId>('overview');
  const [phase, setPhase] = useState<'running' | 'ready'>('running');
  const [stepIdx, setStepIdx] = useState(0);
  const [detail, setDetail] = useState<VariationDetail | null>(null);
  const [detailStatus, setDetailStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [detailAttempt, setDetailAttempt] = useState(0);
  const [cv, setCv] = useState<any>(null);
  const [graph, setGraph] = useState<ImpactGraphPayload | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState('');
  const [sidecarOpen, setSidecarOpen] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
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
    fetch('/api/cv/module/V-2026-017').then((r) => r.json()).then(setCv).catch(() => null);
    fetch('/api/graph/V-2026-017').then((r) => r.json()).then(setGraph).catch(() => null);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setDetailStatus('loading');
    fetch('/api/variation/V-2026-017', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load variation');
        return response.json();
      })
      .then((data: VariationDetail) => {
        if (!Array.isArray(data.fair_value_calculation?.items)
          || !Array.isArray(data.contractor_claim_adjudication?.items)) {
          throw new Error('Incomplete variation data');
        }
        if (controller.signal.aborted) return;
        setDetail(data);
        setDetailStatus('ready');
      })
      .catch(() => {
        if (!controller.signal.aborted) setDetailStatus('error');
      });
    return () => controller.abort();
  }, [detailAttempt]);

  useEffect(() => {
    if (phase !== 'ready') return;
    const first = replyToPrompt(initialPrompt, {
      fairValue,
      inflation,
      payable,
      completeness,
      docCount,
    });
    setMessages([
      { id: 'u0', role: 'user', text: initialPrompt },
      {
        id: 'a0',
        role: 'agent',
        text:
          (files.length
            ? `Received ${files.length} file(s): ${files.map((f) => f.name).join(', ')}.\n\n`
            : 'Opened sample case V-2026-017 (HA Block 4 lobby +20%).\n\n') + first.text,
        viewHint: first.view,
      },
    ]);
    setView(first.view);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, phase]);

  useEffect(() => {
    if (panelRef.current) panelRef.current.scrollTop = 0;
  }, [view, phase]);

  const ask = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const reply = replyToPrompt(trimmed, {
      fairValue,
      inflation,
      payable,
      completeness,
      docCount,
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
    setDraft('');
    setSidecarOpen(true);
  };

  const fv = detail?.fair_value_calculation;
  const claim = detail?.contractor_claim_adjudication;
  const milestones = cv?.milestones ?? [];
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
    <div className={`agent agent-chat-layout ${view === 'value' || view === 'claim' ? 'agent-finance-workspace' : ''}`} style={{ height: '100vh' }}>
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
                        aria-current={view === item.id ? 'page' : undefined}
                        onClick={() => setView(item.id)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </aside>

              <div className={`agent-work-split-container ${sidecarOpen ? '' : 'sidecar-collapsed'}`}>
              <div className="agent-main-content-panel">
                <div className="panel-subnav-bar no-print">
                  <div className="panel-case-title">V-2026-017 · Lobby size +20%</div>
                  <button
                    type="button"
                    className={`btn-toggle-copilot ${sidecarOpen ? 'active' : ''}`}
                    aria-pressed={sidecarOpen}
                    onClick={() => setSidecarOpen((v) => !v)}
                  >
                    Copilot
                  </button>
                </div>
                <div className="agent-panel-body" ref={panelRef}>
                  {view === 'overview' && (
                    <div>
                      <h2 style={{ fontFamily: 'Outfit, Plus Jakarta Sans, sans-serif', marginBottom: 8 }}>
                        Case overview
                      </h2>
                      <p style={{ color: '#6b645b', marginBottom: 16 }}>
                        HA Public Housing · Block 4 · Cap. 652 payment response in progress
                      </p>
                      <div className="metric-row">
                        <div className="metric">
                          <b>HK$ {fmt(fairValue)}</b>
                          <span>Fair value</span>
                        </div>
                        <div className="metric">
                          <b style={{ color: '#dc2626' }}>HK$ {fmt(inflation)}</b>
                          <span>Inflation flagged</span>
                        </div>
                        <div className="metric">
                          <b>HK$ {fmt(payable)}</b>
                          <span>Payable now</span>
                        </div>
                        <div className="metric">
                          <b>{completeness}%</b>
                          <span>Completeness</span>
                        </div>
                      </div>
                      <div className="result-action-cards-grid" style={{ marginTop: 20 }}>
                        {NAV.filter((n) => n.id !== 'overview').map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            className={`action-card ${n.id === 'report' ? 'highlight-gold-card' : ''}`}
                            onClick={() => setView(n.id)}
                          >
                            <div className="card-icon">{n.icon}</div>
                            <div className="card-text">{n.label}</div>
                            <div className="card-arrow">
                              <ArrowRight size={16} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {view === 'documents' && (
                    <div className="doc-directory-container">
                      <div className="doc-directory-header">
                        <h2 style={{ margin: 0 }}>Knowledge base</h2>
                        <span className="kg-badge">{docNames.length} files</span>
                      </div>
                      <div className="doc-list-grid">
                        {docNames.map((name) => (
                          <div key={name} className="doc-file-card">
                            <div className="doc-file-icon">
                              <FileText size={18} color="#0f766e" />
                            </div>
                            <div className="doc-file-details">
                              <strong>{name}</strong>
                              <span style={{ fontSize: 12, color: '#787062' }}>Ready · cited in evidence pack</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {view === 'impact' && (
                    graph ?
                      <ImpactTracePanel data={graph} />
                    : <div className="metric">Loading graph…</div>
                  )}

                  {(view === 'value' || view === 'claim') && detailStatus !== 'ready' && (
                    <section className="valuation-data-state" aria-live="polite" aria-busy={detailStatus === 'loading'}>
                      {detailStatus === 'loading' ? <>
                        <div className="valuation-loading-mark" aria-hidden="true" />
                        <h2>Loading {view === 'value' ? 'fair value' : 'claim assessment'}…</h2>
                        <p>Retrieving the variation’s line items and references.</p>
                      </> : <div role="alert">
                        <FileText size={28} aria-hidden="true" />
                        <h2>Unable to load the variation</h2>
                        <p>Check that the backend is running, then try again.</p>
                        <button type="button" className="valuation-primary-button" onClick={() => setDetailAttempt((attempt) => attempt + 1)}>Try again</button>
                      </div>}
                    </section>
                  )}
                  {view === 'value' && detailStatus === 'ready' && detail && fv && (
                    <FairValuePanel data={fv} variationId={detail.id} onClaimCheck={() => setView('claim')} />
                  )}
                  {view === 'claim' && detailStatus === 'ready' && detail && fv && claim && (
                    <ClaimCheckPanel data={claim} fairValue={fv} variationId={detail.id} onFairValue={() => setView('value')} onEvidencePack={() => setView('report')} />
                  )}

                  {view === 'certify' && (
                    <div>
                      <h2 style={{ marginTop: 0 }}>Milestone certification</h2>
                      <div className="metric-row">
                        <div className="metric">
                          <b>{completeness}%</b>
                          <span>Weighted complete</span>
                        </div>
                        <div className="metric">
                          <b>HK$ {fmt(payable)}</b>
                          <span>Payable</span>
                        </div>
                        <div className="metric">
                          <b>HK$ {fmt(cv?.certification?.withheld_pending_hkd ?? 11250)}</b>
                          <span>Withheld</span>
                        </div>
                      </div>
                      <div style={{ marginTop: 16 }}>
                        {milestones.map((m: any) => (
                          <div key={m.id} className="finding">
                            <strong>{m.element}</strong> — {m.status} · {m.progress_pct}% · {m.citation}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {view === 'report' && (
                    <CitedReportPage t={t} variationId="V-2026-017" onExport={onExport} />
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
