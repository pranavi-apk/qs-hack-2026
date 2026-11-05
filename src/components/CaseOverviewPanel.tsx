import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  FileStack,
  GitBranch,
  Scale,
  Shield,
} from 'lucide-react';
import type { ViewId } from '../agent/chatEngine';

type NavItem = { id: ViewId; label: string; icon: React.ReactNode };

type Props = {
  detail: Record<string, any> | null;
  cv: Record<string, any> | null;
  docCount: number;
  navItems: NavItem[];
  onNavigate: (view: ViewId) => void;
};

function fmt(n: number) {
  return n.toLocaleString('en-HK', { maximumFractionDigits: 0 });
}

function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export default function CaseOverviewPanel({ detail, cv, docCount, navItems, onNavigate }: Props) {
  const fairValue = detail?.fair_value_calculation?.total_fair_value ?? 18750;
  const claim = detail?.contractor_claim_adjudication;
  const inflation = claim?.total_variance ?? 5920;
  const totalClaim = claim?.total_claim ?? 22510;
  const inflatedPct = claim?.inflated_percentage ?? 26.3;
  const payable = cv?.certification?.payable_milestone_hkd ?? 7500;
  const withheld = cv?.certification?.withheld_pending_hkd ?? 11250;
  const completeness = cv?.certification?.weighted_completeness_pct ?? cv?.completeness ?? 60;
  const impact = detail?.impact_summary;
  const totalAffected = impact?.total_affected_items ?? 263;
  const direct = impact?.direct_items ?? 48;
  const hop2 = impact?.indirect_2hop ?? 126;
  const hop3 = impact?.indirect_3hop ?? 89;
  const tileSqm = cv?.reference_area_sqm ?? cv?.drawing_takeoff?.tile_scope_sqm ?? 120;
  const drawingRef = cv?.drawing_ref ?? 'A-201';
  const gridLabel = cv?.drawing_takeoff?.lobby_grid_m ?? '12.0 × 10.0';
  const milestones = cv?.milestones ?? [];
  const certifierNote = cv?.certification?.certifier_note;

  const findings = [
    {
      icon: CheckCircle2,
      tone: 'neutral' as const,
      text: (
        <>
          Tile scope <strong>{tileSqm} m²</strong> from Drawing {drawingRef} ({gridLabel} grid). Quantities are
          drawing takeoff — not inferred from site photos.
        </>
      ),
    },
    {
      icon: AlertTriangle,
      tone: 'warn' as const,
      text: (
        <>
          Contractor claim <strong>HK$ {fmt(totalClaim)}</strong> vs fair build-up;{' '}
          <strong>HK$ {fmt(inflation)}</strong> flagged ({inflatedPct}%) under GCC Clause 62.
        </>
      ),
    },
    {
      icon: Shield,
      tone: 'neutral' as const,
      text: (
        <>
          Milestone certification at <strong>{completeness}%</strong> weighted complete. Payable this period{' '}
          <strong>HK$ {fmt(payable)}</strong>; HK$ {fmt(withheld)} withheld pending skirting and grout sign-off.
        </>
      ),
    },
    {
      icon: FileStack,
      tone: 'accent' as const,
      text: (
        <>
          Cap. 652 evidence pack assembled — provability score, payment clock, claim annex, and SHA digest ready to
          export.
        </>
      ),
    },
  ];

  const workflow = navItems.filter((n) => n.id !== 'overview');

  return (
    <div className="case-overview">
      <header className="case-hero">
        <div className="case-hero-top">
          <div className="case-id-badge">{detail?.id ?? 'V-2026-017'}</div>
          <span className="case-status-pill">
            <span className="case-status-dot" />
            {(detail?.status ?? 'In progress') + ' · Cap. 652 response'}
          </span>
        </div>
        <h1 className="case-hero-title">{detail?.title ?? 'Lobby size increase 20%'}</h1>
        <p className="case-hero-project">{detail?.project ?? 'HA Public Housing Development — Block 4'}</p>
        <p className="case-hero-instruction">
          {detail?.description ??
            'Architectural Instruction AI-2026-084 — lobby footprint extended 20% east toward Gridline E.'}
        </p>
        <div className="case-hero-meta">
          <span>{detail?.category ?? 'Finishes & structural'}</span>
          <span className="case-meta-sep">·</span>
          <span>Updated {detail?.date ?? '28 Jul 2026'}</span>
          <span className="case-meta-sep">·</span>
          <span>{docCount} documents indexed</span>
        </div>
      </header>

      <div className="case-kpi-grid">
        <div className="case-kpi-card">
          <div className="case-kpi-label">
            <Banknote size={16} />
            Fair value
          </div>
          <div className="case-kpi-value">HK$ {fmt(fairValue)}</div>
          <div className="case-kpi-hint">HKSMM4 build-up incl. prelim & OH&P</div>
        </div>
        <div className="case-kpi-card case-kpi-card--warn">
          <div className="case-kpi-label">
            <Scale size={16} />
            Inflation flagged
          </div>
          <div className="case-kpi-value case-kpi-value--warn">HK$ {fmt(inflation)}</div>
          <div className="case-kpi-hint">{inflatedPct}% above Cascade fair rates</div>
        </div>
        <div className="case-kpi-card case-kpi-card--pay">
          <div className="case-kpi-label">
            <Shield size={16} />
            Payable now
          </div>
          <div className="case-kpi-value">HK$ {fmt(payable)}</div>
          <div className="case-kpi-hint">Cap. 652 milestone alignment</div>
        </div>
        <div className="case-kpi-card">
          <div className="case-kpi-label">
            <GitBranch size={16} />
            Completeness
          </div>
          <div className="case-kpi-value">{completeness}%</div>
          <div className="case-kpi-progress">
            <div className="case-kpi-progress-fill" style={{ width: `${completeness}%` }} />
          </div>
        </div>
      </div>

      <div className="case-detail-grid">
        <section className="case-panel">
          <div className="case-panel-head">
            <h2>Contract knock-on</h2>
            <button type="button" className="case-link-btn" onClick={() => onNavigate('pack')}>
              Open pack &amp; impact <ArrowRight size={14} />
            </button>
          </div>
          <p className="case-panel-lead">
            <strong>{totalAffected}</strong> BQ lines touched by lobby +20% — direct finishes/structure plus MEP and
            indirect knock-ons.
          </p>
          <div className="case-impact-bars">
            <div className="case-impact-row">
              <span>Direct</span>
              <div className="case-impact-track">
                <div
                  className="case-impact-fill case-impact-fill--direct"
                  style={{ width: `${pct(direct, totalAffected)}%` }}
                />
              </div>
              <span className="case-impact-num">{direct}</span>
            </div>
            <div className="case-impact-row">
              <span>2-hop</span>
              <div className="case-impact-track">
                <div
                  className="case-impact-fill case-impact-fill--hop2"
                  style={{ width: `${pct(hop2, totalAffected)}%` }}
                />
              </div>
              <span className="case-impact-num">{hop2}</span>
            </div>
            <div className="case-impact-row">
              <span>3-hop</span>
              <div className="case-impact-track">
                <div
                  className="case-impact-fill case-impact-fill--hop3"
                  style={{ width: `${pct(hop3, totalAffected)}%` }}
                />
              </div>
              <span className="case-impact-num">{hop3}</span>
            </div>
          </div>
        </section>

        <section className="case-panel">
          <div className="case-panel-head">
            <h2>Payment snapshot</h2>
            <button type="button" className="case-link-btn" onClick={() => onNavigate('claim')}>
              Claim check <ArrowRight size={14} />
            </button>
          </div>
          <dl className="case-payment-dl">
            <div>
              <dt>Contractor claim</dt>
              <dd>HK$ {fmt(totalClaim)}</dd>
            </div>
            <div>
              <dt>Cascade fair (excl. OH&P in claim view)</dt>
              <dd>HK$ {fmt(claim?.total_cascade_fair ?? 16590)}</dd>
            </div>
            <div className="case-payment-highlight">
              <dt>Recommended deduction</dt>
              <dd className="case-payment-deduct">− HK$ {fmt(inflation)}</dd>
            </div>
            <div className="case-payment-highlight case-payment-highlight--pay">
              <dt>Payable this certificate</dt>
              <dd>HK$ {fmt(payable)}</dd>
            </div>
            <div>
              <dt>Withheld (milestones pending)</dt>
              <dd>HK$ {fmt(withheld)}</dd>
            </div>
          </dl>
        </section>

        <section className="case-panel case-panel--wide" id="case-milestones">
          <div className="case-panel-head">
            <h2>Milestone certification</h2>
            <span className="case-panel-tag">Cap. 652 · no photo gallery</span>
          </div>
          <p className="case-panel-lead">
            Site photos support walk-down sign-off only — m² from Drawing {drawingRef}. Weighted completeness{' '}
            <strong>{completeness}%</strong> drives payable HK$ {fmt(payable)} this period.
          </p>
          <div className="case-milestone-metrics">
            <div>
              <span className="case-milestone-metric-label">Completeness</span>
              <span className="case-milestone-metric-value">{completeness}%</span>
            </div>
            <div className="case-milestone-metric--pay">
              <span className="case-milestone-metric-label">Payable now</span>
              <span className="case-milestone-metric-value">HK$ {fmt(payable)}</span>
            </div>
            <div className="case-milestone-metric--hold">
              <span className="case-milestone-metric-label">Withheld</span>
              <span className="case-milestone-metric-value">HK$ {fmt(withheld)}</span>
            </div>
          </div>
          <div className="case-milestone-table-wrap">
            <table className="case-milestone-table">
              <thead>
                <tr>
                  <th>Element</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Weight</th>
                  <th>Citation</th>
                </tr>
              </thead>
              <tbody>
                {milestones.map((m: { id: string; element: string; status: string; progress_pct: number; weight_pct: number; citation: string }) => (
                  <tr key={m.id}>
                    <td>{m.element}</td>
                    <td className="mono">{m.status.replace(/_/g, ' ')}</td>
                    <td className="mono">{m.progress_pct}%</td>
                    <td className="mono">{m.weight_pct}%</td>
                    <td className="case-milestone-cite">{m.citation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {certifierNote && <p className="case-certifier-note">{certifierNote}</p>}
        </section>

        <section className="case-panel case-panel--wide">
          <div className="case-panel-head">
            <h2>Key findings</h2>
            <span className="case-panel-tag">Auditable · cited in evidence pack</span>
          </div>
          <ul className="case-findings-list">
            {findings.map((f, i) => {
              const Icon = f.icon;
              return (
                <li key={i} className={`case-finding case-finding--${f.tone}`}>
                  <Icon size={18} className="case-finding-icon" aria-hidden />
                  <span>{f.text}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="case-workflow">
        <h2 className="case-workflow-title">Continue investigation</h2>
        <div className="case-workflow-grid">
          {workflow.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`case-workflow-card ${n.id === 'report' ? 'case-workflow-card--primary' : ''}`}
              onClick={() => onNavigate(n.id)}
            >
              <div className="case-workflow-icon">{n.icon}</div>
              <div className="case-workflow-text">
                <strong>{n.label}</strong>
                <span>
                  {n.id === 'pack' && 'Documents + knock-on graph'}
                  {n.id === 'value' && 'HKSMM4 line build-up'}
                  {n.id === 'claim' && 'GCC 62 line flags'}
                  {n.id === 'report' && 'Print payment-response annex'}
                </span>
              </div>
              <ArrowRight size={18} className="case-workflow-arrow" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
