'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();
  const q = useSearchParams();

  useEffect(() => {
    (async () => {
      const code = q.get('code');
      if (!code) return;

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }
      router.replace('/vault'); // wherever you want to land after sign-in
    })();
  }, [q, router]);

  return <p>Signing you in…</p>;
}
