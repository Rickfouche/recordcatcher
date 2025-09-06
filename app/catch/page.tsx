'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Track = {
  id: string;
  title: string;
  artist: string | null;
  audio_url: string;
  cover_url: string | null;
};

export default function Catch() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    supabase.auth.onAuthStateChange((_e, s) => setSession(s));
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('id,title,artist,audio_url,cover_url')
        .limit(1);
      if (!error && data && data.length > 0) setTrack(data[0] as Track);
    };
    load();
  }, []);

  const handleCatch = async () => {
    if (!track) return;
    setBusy(true);

    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) {
      router.push('/login');
      return;
    }

    // Minimal insert: user_id + track_id (adjust only if your schema needs more)
    const { error } = await supabase.from('catches').insert({
      user_id: user.id,
      track_id: track.id
    });

    setBusy(false);
    if (error) {
      alert(error.message);
    } else {
      router.push('/vault');
    }
  };

  if (!session) {
    return (
      <main className="p-6">
        <p>You need to sign in to catch a record.</p>
        <a className="underline" href="/login">Go to login</a>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Catch a Record</h1>

      {!track && <p>No tracks available yet. Seed one in the <em>tracks</em> table.</p>}

      {track && (
        <div className="border rounded p-4 flex gap-4 items-start">
          {track.cover_url && (
            <img src={track.cover_url} alt={track.title} className="w-20 h-20 object-cover rounded" />
          )}
          <div className="flex-1">
            <div className="font-semibold">{track.title}</div>
            <div className="text-sm opacity-70">{track.artist ?? ''}</div>
            <audio controls src={track.audio_url} className="w-full mt-2" />
            <button
              onClick={handleCatch}
              disabled={busy}
              className="mt-3 bg-black text-white px-4 py-2 rounded"
            >
              {busy ? 'Catching…' : 'Catch this record'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
