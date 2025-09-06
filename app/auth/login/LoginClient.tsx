'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginClient() {
  const router = useRouter();
  const q = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const errDesc = q.get('error_description');
      if (errDesc) alert(errDesc);

      // Newer flow: ?code=...
      const code = q.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code); // string
        if (error && !cancelled) alert(error.message);
        if (!error && !cancelled) {
          router.replace('/vault');
          return;
        }
      }

      // Fallback: ?token_hash=...&type=magiclink
      const token_hash = q.get('token_hash');
      const type = q.get('type');
      if (token_hash && type === 'magiclink') {
        const storedEmail = localStorage.getItem('lastSignInEmail') || '';
        if (storedEmail) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'magiclink',
            email: storedEmail,
          });
          if (error && !cancelled) alert(error.message);
          if (!error && !cancelled) {
            router.replace('/vault');
            return;
          }
        }
      }

      // Already signed in?
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !cancelled) {
        router.replace('/vault');
        return;
      }

      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [q, router]);

  const sendMagicLink = async (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem('lastSignInEmail', email.toLowerCase());

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/login`,
      },
    });

    if (error) alert(error.message);
    else alert('Check your email for the magic link.');
  };

  if (loading) return <main className="p-6">Signing you in…</main>;

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
