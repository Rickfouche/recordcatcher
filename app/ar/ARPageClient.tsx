'use client';

import { useEffect, useState } from 'react';

type Track = { id: string; title: string; lat: number; lng: number };

export default function ARPageClient({ initialTracks }: { initialTracks: Track[] }) {
  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">AR Page (Client)</h1>
      <div>Status: {ready ? '✅ Client ready' : '⏳'}</div>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Nearby tracks</h2>
        <ul className="list-disc pl-6">
          {tracks.map((t) => (
            <li key={t.id}>
              <span className="font-medium">{t.title}</span>{' '}
              <span className="opacity-70">
                ({t.lat.toFixed(3)}, {t.lng.toFixed(3)})
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
