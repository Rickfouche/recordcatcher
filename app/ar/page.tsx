'use client';

import { useEffect, useState } from 'react';

// Route options (fine to keep in client page)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ARPage() {
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState('Booting…');
  const [clicks, setClicks] = useState(0);

  // Client-only setup (e.g., attach AR scripts, read localStorage, etc.)
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // TODO: init AR / Supabase client / anything browser-only
        // Example: await someInit();
        if (!cancelled) {
          setMsg('Client ready.');
          setReady(true);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setMsg('Init failed. Check console.');
      }
    }

    init();
    return () => {
      cancelled = true;
      // TODO: cleanup listeners/canvases if you add them later
    };
  }, []);

  return (
    <main className="p-6 space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">AR Page (Client)</h1>
        <p>{msg}</p>
      </header>

      <section className="space-y-2">
        <button
          className="rounded-2xl px-4 py-2 shadow border"
          onClick={() => setClicks((n) => n + 1)}
        >
          Test interactivity
        </button>
        <div>Clicks: {clicks}</div>
        <div>Status: {ready ? '✅ Ready' : '⏳ Waiting'}</div>
      </section>

      {/* TODO: Drop your AR canvas/iframe/component here */}
      {/* <ARCanvas /> or <iframe src="/ar/viewer.html" /> */}
    </main>
  );
}
