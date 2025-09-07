'use client';

// Tell Next.js not to prerender this page at build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const q = useSearchParams();

  useEffect(() => {
    // Only run this in the browser
    if (typeof window === 'undefined') return;

    (async () => {
      // Lazy import avoids SSR/localStorage issues at build time
      const { supabase } = await import('@/lib/supabaseClient');

      const code = q.get('code');
      if (!code) return;

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('exchangeCodeForSession error', error);
        alert(error.message);
        return;
      }

      // Redirect once the session is exchanged
      router.replace('/vault');
    })();
  }, [q, router]);

  return <p className="p-6">Signing you in…</p>;
}
