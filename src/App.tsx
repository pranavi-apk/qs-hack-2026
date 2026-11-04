import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import AgentHome from './pages/AgentHome';
import AgentWorkspace from './pages/AgentWorkspace';

type Session = {
  prompt: string;
  files: File[];
} | null;

export default function App() {
  const [session, setSession] = useState<Session>(null);

  const onExport = () => {
    confetti({ particleCount: 70, spread: 55, origin: { y: 0.7 }, colors: ['#0f766e', '#14b8a6', '#0b1f17'] });
    window.print();
  };

  if (!session) {
    return (
      <AgentHome
        onStart={({ prompt, files, sample }) => {
          // sample with no files still opens workspace (demo pack)
          void sample;
          setSession({ prompt, files });
          // best-effort upload for real files
          if (files.length) {
            const fd = new FormData();
            files.forEach((f) => fd.append('files', f));
            fetch('/api/pack/upload', { method: 'POST', body: fd }).catch(() => null);
          }
        }}
      />
    );
  }

  return (
    <AgentWorkspace
      initialPrompt={session.prompt}
      files={session.files}
      onHome={() => setSession(null)}
      onExport={onExport}
    />
  );
}
