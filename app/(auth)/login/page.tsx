'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const send = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    if (!error) setSent(true);
    else alert(error.message);
  };

  return (
    <main className="max-w-sm mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <input
        className="w-full border p-2 rounded"
        placeholder="you@mail.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="w-full bg-black text-white p-2 rounded" onClick={send}>
        Send Magic Link
      </button>
      {sent && <p>Check your email.</p>}
    </main>
  );
}
