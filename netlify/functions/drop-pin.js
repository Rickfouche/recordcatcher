// netlify/functions/drop-pin.js
const { createClient } = require('@supabase/supabase-js');

const json = (status, body = '') => ({
  statusCode: status,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ALLOW_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
  },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(204);
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });

  const auth = event.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return json(401, { error: 'Unauthorized' });
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(500, { error: 'Server missing Supabase env vars' });
  }

  let payload;
  try { payload = JSON.parse(event.body || '{}'); }
  catch { return json(400, { error: 'Invalid JSON' }); }

  const { lat, lng, track_id, note } = payload;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return json(400, { error: 'lat and lng (numbers) are required' });
  }

  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    // adjust table/columns to your schema
    const { data, error } = await sb.from('pins').insert({
      lat, lng, track_id: track_id || null, note: note || null,
      created_at: new Date().toISOString(),
    }).select().single();

    if (error) return json(400, { error: error.message });
    return json(200, { ok: true, pin: data });
  } catch (e) {
    return json(500, { error: e?.message || String(e) });
  }
};
