'use client';

import { useEffect, useState } from 'react';

export default function ARPageClient() {
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState('Booting…');
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // TODO: init AR / browser-only setup here
        if (!cancelled) {
          setMsg('Client ready.');
          setReady(true);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setMsg('Init failed. Check console.');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">AR Page (Client)</h1>
      <p>{msg}</p>

      <button
        className="rounded-2xl px-4 py-2 shadow border"
        onClick={() => setClicks(c => c + 1)}
      >
        Test interactivity
      </button>
      <div>Clicks: {clicks}</div>
      <div>Status: {ready ? '✅ Ready' : '⏳ Waiting'}</div>

      {/* Drop AR canvas/iframe/component here */}
      {/* <iframe src="/ar/viewer.html" className="w-full h-[60vh]" /> */}
    </main>
  );
}
