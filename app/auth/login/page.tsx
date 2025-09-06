// app/auth/login/page.tsx
'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const isValid = /\S+@\S+\.\S+/.test(email)

  const send = async () => {
    if (!isValid || loading) return
    setLoading(true)
    setErrorMsg(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/vault`,
          shouldCreateUser: true,
        },
      })
      if (error) setErrorMsg(error.message)
      else setSent(true)
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-sm mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Sign in</h1>

      <input
        className="w-full border p-2 rounded"
        placeholder="you@mail.com"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') send() }}
      />

      <button
        className="w-full bg-black text-white p-2 rounded disabled:opacity-50"
        onClick={send}
        disabled={!isValid || loading}
      >
        {loading ? 'Sending…' : 'Send magic link'}
      </button>

      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
      {sent && <p>Check your email and click the link.</p>}
    </main>
  )
}
