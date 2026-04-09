'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleLogin() {
    setError('')
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) { setError(loginError.message); return }
    window.location.replace('/')
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '400px', margin: '4rem auto' }}>
      <h1 style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: '2rem', marginBottom: '2rem' }}>sonder</h1>
      <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
      <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
      {error && <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>}
      <button onClick={handleLogin} style={{ width: '100%', padding: '10px', background: '#1e1c18', color: '#f0ebe4', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px' }}>log in</button>
      <p style={{ marginTop: '1rem', fontSize: '13px', color: '#888' }}>no account? <a href="/auth/signup">sign up</a></p>
    </main>
  )
}