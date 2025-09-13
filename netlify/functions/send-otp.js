// netlify/functions/send-otp.js
// ESM function (works if your repo is ESM or Netlify auto-detects ESM in functions)
// If you prefer CommonJS, I can give you that version too.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Helper: unified JSON response + CORS
const json = (status, body) => ({
  statusCode: status,
  headers: {
    'Content-Type': 'application/json',
    // If you want to restrict, set CORS_ALLOW_ORIGIN in Netlify env to your site origin
    'Access-Control-Allow-Origin': process.env.CORS_ALLOW_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
  },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});

export async function handler(event) {
  // Handle preflight for safety (especially if you ever call this cross-origin)
  if (event.httpMethod === 'OPTIONS') {
    return json(204, '');
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method Not Allowed' });
  }

  try {
    const { email, redirectTo } = JSON.parse(event.body || '{}');
    if (!email || !redirectTo) {
      return json(400, { error: 'Missing email or redirectTo' });
    }

    // Server-side secrets from Netlify → Site settings → Environment variables
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // NEVER expose to client

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json(500, { error: 'Server not configured (missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)' });
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Send the magic link from the server (bypasses device/carrier issues)
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    });

    if (error) {
      return json(400, { error: error.message });
    }

    return json(200, { ok: true });
  } catch (e) {
    return json(500, { error: e?.message || String(e) });
  }
}
