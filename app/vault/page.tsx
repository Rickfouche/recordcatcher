// app/vault/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Item = {
  catch_id: string
  caught_at: string
  track_id: string
  title: string
  artist: string | null
  audio_url: string
  cover_url: string | null
}

export default function Vault() {
  const [items, setItems] = useState<Item[]>([])
  const [session, setSession] = useState<any>(null)

  // get current session + subscribe
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  // load data when logged in
  useEffect(() => {
    if (!session) return
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('users').upsert({ id: user.id, email: user.email ?? '' })

      const { data, error } = await supabase
        .from('vault')
        .select('*')
        .order('caught_at', { ascending: false })

      if (!error) setItems((data ?? []) as Item[])
    }
    load()
  }, [session])

  if (!session) {
    return (
      <main className="p-6">
        <a className="underline" href="/login">Sign in to view your Vault</a>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Vault</h1>
        <button className="text-sm underline" onClick={() => supabase.auth.signOut()}>
          Logout
        </button>
      </header>

      {items.length === 0 && <p>No catches yet. (Catch something to see it here!)</p>}

      <ul className="space-y-4">
        {items.map(i => (
          <li key={i.catch_id} className="border rounded p-3 flex gap-3">
            {i.cover_url && (
              <img src={i.cover_url} alt={i.title} className="w-16 h-16 object-cover rounded" />
            )}
            <div className="flex-1">
              <div className="font-semibold">{i.title}</div>
              <div className="text-sm opacity-70">{i.artist ?? ''}</div>
              <audio controls src={i.audio_url} className="w-full mt-2" />
              <div className="text-xs opacity-60 mt-1">
                Caught {new Date(i.caught_at).toLocaleString()}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
