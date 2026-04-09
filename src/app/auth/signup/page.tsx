'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => { setMounted(true) }, [])

  async function handleSignUp() {
    setError('')
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) { setError(signUpError.message); return }

    const { error: profileError } = await supabase.from('users').insert({
      id: data.user!.id,
      username,
      display_name: username,
      avatar_initials: username.slice(0, 2).toUpperCase()
    })
    if (profileError) { setError(profileError.message); return }

    window.location.replace('/')
  }

  if (!mounted) return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '400px', margin: '4rem auto' }}>
      <h1 style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: '2rem', marginBottom: '2rem' }}>sonder</h1>
    </main>
  )

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '400px', margin: '4rem auto' }}>
      <h1 style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: '2rem', marginBottom: '2rem' }}>sonder</h1>
      <input placeholder="username" value={username} onChange={e => setUsername(e.target.value)} style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
      <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
      <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
      {error && <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>}
      <button onClick={handleSignUp} style={{ width: '100%', padding: '10px', background: '#1e1c18', color: '#f0ebe4', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px' }}>create account</button>
      <p style={{ marginTop: '1rem', fontSize: '13px', color: '#888' }}>already have an account? <a href="/auth/login">log in</a></p>
    </main>
  )
}