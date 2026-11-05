import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import AgentHome from './pages/AgentHome';
import AgentWorkspace from './pages/AgentWorkspace';

export type Session = {
  prompt: string;
  files: File[];
  variationId: string;
  sample: boolean;
  caseTitle?: string;
};

async function ingestPack(files: File[], existingVariationId?: string): Promise<{ variationId: string; title?: string }> {
  const fd = new FormData();
  files.forEach((f) => fd.append('files', f));
  if (existingVariationId && existingVariationId !== 'V-2026-017') {
    fd.append('variation_id', existingVariationId);
  }
  const res = await fetch('/api/pack/upload', { method: 'POST', body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Upload failed');
  }
  const data = await res.json();
  return { variationId: data.variation_id as string, title: data.title as string | undefined };
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [ingestVersion, setIngestVersion] = useState(0);

  const onExport = () => {
    confetti({ particleCount: 70, spread: 55, origin: { y: 0.7 }, colors: ['#0f766e', '#14b8a6', '#0b1f17'] });
    window.print();
  };

  if (!session) {
    return (
      <>
        {startError && (
          <div
            style={{
              position: 'fixed',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              padding: '0.5rem 1rem',
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            {startError}
          </div>
        )}
        <AgentHome
          starting={starting}
          onStart={async ({ prompt, files, sample }) => {
            setStartError(null);
            setStarting(true);
            try {
              let variationId = 'V-2026-017';
              let caseTitle: string | undefined;
              if (files.length > 0) {
                const ingested = await ingestPack(files);
                variationId = ingested.variationId;
                caseTitle = ingested.title;
              } else if (!sample) {
                variationId = 'V-2026-017';
              }
              setSession({ prompt, files, variationId, sample: sample && files.length === 0, caseTitle });
            } catch (e) {
              setStartError(e instanceof Error ? e.message : 'Could not ingest pack');
            } finally {
              setStarting(false);
            }
          }}
        />
      </>
    );
  }

  return (
    <AgentWorkspace
      initialPrompt={session.prompt}
      files={session.files}
      variationId={session.variationId}
      sample={session.sample}
      caseTitle={session.caseTitle}
      onHome={() => setSession(null)}
      onExport={onExport}
      onReingest={async (newFiles) => {
        const ingested = await ingestPack(newFiles, session.variationId);
        setSession((s) =>
          s ?
            {
              ...s,
              variationId: ingested.variationId,
              files: [...s.files, ...newFiles],
              caseTitle: ingested.title ?? s.caseTitle,
              sample: false,
            }
          : s
        );
        setIngestVersion((v) => v + 1);
      }}
      ingestVersion={ingestVersion}
    />
  );
}
