'use client';

// Make this route dynamic (no prerender at build)
export const dynamic = 'force-dynamic';
// ⛔ Remove any `export const revalidate = ...` lines

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  // Don’t run in SSR/prerender
  if (typeof window === 'undefined') return null;

  const router = useRouter();
  const q = useSearchParams();

  useEffect(() => {
    (async () => {
      // Lazy import avoids SSR/localStorage issues during build
      const { supabase } = await import('@/lib/supabaseClient');

      const code = q.get('code');
      if (!code) return;

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('exchangeCodeForSession error', error);
        alert(error.message);
        return;
      }
      router.replace('/vault');
    })();
  }, [q, router]);

  return <p className="p-6">Signing you in…</p>;
}
