// app/ar/page.tsx  (SERVER)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import ARPageClient from './ARPageClient';

type Track = { id: string; title: string; lat: number; lng: number };

// For now: mock fetch so we prove the wiring works.
// Next phase: replace with a Supabase query.
async function getInitialTracks(): Promise<Track[]> {
  // Simulate I/O
  await new Promise((r) => setTimeout(r, 50));
  return [
    { id: 't1', title: 'Summer Rain', lat: 40.771, lng: -73.952 },
    { id: 't2', title: 'Chrome Steps', lat: 40.768, lng: -73.958 },
  ];
}

export default async function Page() {
  const tracks = await getInitialTracks();
  return <ARPageClient initialTracks={tracks} />;
}
