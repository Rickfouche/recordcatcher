'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'sent'|'error'>('idle');
  const [msg, setMsg] = useState<string>('');

  const redirectTo = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/login`
    : undefined;

  async function handleOAuth(provider: 'google' | 'github' | 'apple') {
    setStatus('loading');
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo } // <-- MUST match your callback route
    });
    if (error) {
      setStatus('error');
      setMsg(error.message);
    } else {
      // The browser will be redirected to the provider;
      // upon return, Supabase will send you back to /auth/login
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo } // same callback
    });
    if (error) {
      setStatus('error');
      setMsg(error.message);
    } else {
      setStatus('sent');
      setMsg('Check your email for the login link.');
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '72px auto', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Sign in</h1>

      <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
        <button onClick={() => handleOAuth('google')}>Continue with Google</button>
        <button onClick={() => handleOAuth('github')}>Continue with GitHub</button>
        <button onClick={() => handleOAuth('apple')}>Continue with Apple</button>
      </div>

      <form onSubmit={handleMagicLink} style={{ display: 'grid', gap: 8 }}>
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Send magic link</button>
      </form>

      <p style={{ marginTop: 16 }}>
        {status === 'loading' && 'Working…'}
        {status === 'sent' && msg}
        {status === 'error' && <span style={{ color: 'crimson' }}>{msg}</span>}
      </p>
    </div>
  );
}
