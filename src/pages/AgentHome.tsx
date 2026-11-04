import React, { useRef, useState } from 'react';
import { ArrowRight, FileText, GitBranch, Paperclip, Scale, Search } from 'lucide-react';

type Props = {
  onStart: (opts: { prompt: string; files: File[]; sample: boolean }) => void;
};

const CARDS = [
  {
    id: 'analyse',
    title: 'Analyse a\nvariation pack',
    icon: FileText,
    prompt: 'Analyse uploaded variation document pack',
  },
  {
    id: 'impact',
    title: 'Trace contract\nknock-on impact',
    icon: GitBranch,
    prompt: 'Show global impact graph for lobby variation',
  },
  {
    id: 'claim',
    title: 'Find inflated\nclaim lines',
    icon: Search,
    prompt: 'Identify all inflated contractor claim lines',
  },
  {
    id: 'response',
    title: 'Draft Cap. 652\npayment response',
    icon: Scale,
    prompt: 'Open Cap. 652 evidence pack and payment response',
  },
];

const PILLS = [
  'Analyse uploaded variation document pack',
  'Show HKSMM4 fair value for V-2026-017',
  'Identify all inflated claim lines under GCC 62',
];

export default function AgentHome({ onStart }: Props) {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = (text?: string, sample = false) => {
    const p = (text ?? prompt).trim() || 'Analyse uploaded variation document pack';
    onStart({ prompt: p, files, sample: sample || files.length === 0 });
  };

  return (
    <div className="agent agent-home-layout">
      <header className="tracy-home-nav">
        <div className="tracy-nav-right">
          <button type="button" className="nav-btn" onClick={() => submit(undefined, true)}>
            Open sample
          </button>
          <div className="nav-avatar">QS</div>
        </div>
      </header>

      <div className="agent-home-container">
        <h1 className="home-title">
          Hi, I’m <span style={{ color: '#0f766e' }}>Cascade</span>
        </h1>
        <div className="home-subtitle-main">Your QS variation investigation agent.</div>
        <p className="home-description">
          I read the pack, trace knock-on impacts, value under HKSMM4,
          <br />
          flag inflated claims, and assemble a Cap. 652 evidence pack.
        </p>

        <form
          className="agent-composer-box"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          {files.length > 0 && (
            <div className="file-chips-row">
              {files.map((f) => (
                <div key={f.name + f.size} className="uploaded-file-chip">
                  <div className="chip-file-info">
                    <span className="chip-filename">{f.name}</span>
                    <span className="chip-filesize">{(f.size / 1024).toFixed(0)} KB</span>
                  </div>
                  <button
                    type="button"
                    className="chip-remove"
                    onClick={() => setFiles((prev) => prev.filter((x) => x !== f))}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="composer-input-row">
            <label className="composer-paperclip" title="Attach pack">
              <Paperclip className="w-5 h-5" />
              <input
                ref={fileRef}
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.xlsx,.csv"
                hidden
                onChange={(e) => {
                  const chosen = Array.from(e.target.files || []);
                  e.target.value = '';
                  if (chosen.length) setFiles((prev) => [...prev, ...chosen]);
                }}
              />
            </label>
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What would you like me to investigate?"
              autoComplete="off"
            />
            <button className="composer-submit" type="submit" aria-label="Start">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="agent-card-actions">
          {CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                type="button"
                className="action-card"
                onClick={() => {
                  setPrompt(c.prompt);
                  submit(c.prompt, c.id !== 'analyse');
                }}
              >
                <div className="card-icon">
                  <Icon className="w-[22px] h-[22px]" stroke="#0f766e" />
                </div>
                <div className="card-text" style={{ whiteSpace: 'pre-line' }}>
                  {c.title}
                </div>
                <div className="card-arrow">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="try-asking-divider">
          <span>Or try asking</span>
        </div>
        <div className="try-asking-pills">
          {PILLS.map((pill) => (
            <button
              key={pill}
              type="button"
              className="asking-pill"
              onClick={() => {
                setPrompt(pill);
                submit(pill, true);
              }}
            >
              “{pill}”
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
