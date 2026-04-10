'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const supabase = createClient()

  const pf = "'Playfair Display', serif"
  const sans = "'DM Sans', sans-serif"
  const dark = '#1e2235'

  async function handleLogin() {
    setError('')
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) { setError(loginError.message); return }
    window.location.replace('/')
  }

  return (
    <main style={{ fontFamily: sans, background: '#f0f0ee', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: dark, padding: '1.25rem 5vw' }}>
        <span style={{ fontFamily: pf, fontStyle: 'italic', fontSize: '2.4rem', color: '#f0ebe4' }}>sonder</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '420px', padding: '2rem' }}>
          <h2 style={{ fontFamily: pf, fontStyle: 'italic', fontSize: '1.8rem', color: dark, marginBottom: '2rem', fontWeight: 400 }}>welcome back</h2>
          <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} style={{ display: 'block', width: '100%', padding: '14px 16px', marginBottom: '12px', borderRadius: '10px', border: '0.5px solid #dddbd8', fontSize: '16px', fontFamily: sans, background: '#fff', outline: 'none' }} />
          <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ display: 'block', width: '100%', padding: '14px 16px', marginBottom: '16px', borderRadius: '10px', border: '0.5px solid #dddbd8', fontSize: '16px', fontFamily: sans, background: '#fff', outline: 'none' }} />
          {error && <p style={{ color: '#c0392b', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}
          <button onClick={handleLogin} style={{ width: '100%', padding: '14px', background: dark, color: '#f0ebe4', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '16px', fontFamily: sans, fontWeight: 600 }}>log in</button>
          <p style={{ marginTop: '1.25rem', fontSize: '14px', color: '#888', textAlign: 'center' }}>no account? <a href="/auth/signup" style={{ color: dark }}>sign up</a></p>
        </div>
      </div>
    </main>
  )
}