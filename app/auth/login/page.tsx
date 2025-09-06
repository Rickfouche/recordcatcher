'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const q = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true); // block UI while we try to finish login

  useEffect(() => {
    (async () => {
      // 1) If we were redirected from the magic link, finish the exchange.
      const code = q.get('code');
      const errorDescription = q.get('error_description');
      if (errorDescription) {
        alert(errorDescription);
      }
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession({ code });
        if (!error) {
          // clean URL (remove ?code=...) and go in
          router.replace('/vault');
          return;
        }
      }

      // 2) Already signed in? go straight in
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/vault');
        return;
      }

      // 3) Otherwise, show the form
      setLoading(false);
    })();
  }, [q, router]);

  const sendMagicLink = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // make the email link come back to this page (or '/vault' if you prefer)
        emailRedirectTo: `${window.location.origin}/auth/login`,
      },
    });
    if (error) alert(error.message);
    else alert('Check your email for the magic link.');
  };

  if (loading) {
    return <main className="p-6">Signing you in…</main>;
  }

  return (
    <main className="max-w-sm mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <form onSubmit={sendMagicLink} className="space-y-3">
        <input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <button className="w-full bg-black text-white rounded px-3 py-2">
          Send magic link
        </button>
      </form>
    </main>
  );
}
