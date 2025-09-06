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

// E 81st & York Ave (approx). Remember: meters.
const TARGET = { lat: 40.77295, lon: -73.9496, radiusMeters: 200 };

function distanceMeters(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371000; // Earth radius (m)
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const la1 = toRad(a.lat), la2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export default function Catch() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [busy, setBusy] = useState(false);

  // geofence state
  const [nearby, setNearby] = useState<boolean>(false);
  const [metersAway, setMetersAway] = useState<number | null>(null);
  const [locating, setLocating] = useState<boolean>(true);

  // auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    supabase.auth.onAuthStateChange((_e, s) => setSession(s));
  }, []);

  // load a track (MVP: first)
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

  // geolocate
  const refreshLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocating(false);
      setMetersAway(null);
      setNearby(false);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const me = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        const d = distanceMeters(me, TARGET);
        setMetersAway(d);
        setNearby(d <= TARGET.radiusMeters);
        setLocating(false);
      },
      (_err) => {
        // If denied, allow demo flow
        setMetersAway(null);
        setNearby(false);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  const handleCatch = async () => {
    if (!track) return;
    setBusy(true);

    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) {
      setBusy(false);
      router.push('/login');
      return;
    }

    // If out of range, confirm demo catch
    if (!nearby) {
      const pretty =
        metersAway !== null ? `${Math.round(metersAway)}m away` : 'out of range';
      const ok = window.confirm(
        `You are ${pretty}. Catch in demo mode anyway?`
      );
      if (!ok) {
        setBusy(false);
        return;
      }
    }

    // Minimal insert: user_id + track_id (RLS policy allows self-insert)
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Catch a Record</h1>
        <button
          onClick={refreshLocation}
          className="text-sm underline disabled:opacity-60"
          disabled={locating}
        >
          {locating ? 'Locating…' : 'Refresh location'}
        </button>
      </div>

      <div className="text-sm">
        {locating && <span>Checking your distance…</span>}
        {!locating && metersAway !== null && (
          <span>
            {nearby ? 'In range' : 'Out of range'} • ~{Math.round(metersAway)}m away
            {' '}• radius {TARGET.radiusMeters}m
          </span>
        )}
        {!locating && metersAway === null && (
          <span>Location unavailable (demo mode enabled)</span>
        )}
      </div>

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
              {busy ? 'Catching…' : nearby ? 'Catch this record' : 'Catch (Demo)'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
