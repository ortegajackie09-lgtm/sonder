'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function Home() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div style={{ padding: '2rem', fontFamily: 'Georgia', fontStyle: 'italic', fontSize: '1.5rem' }}>sonder</div>

  return (
    <main style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: '1.75rem', margin: 0 }}>sonder</h1>
        <span style={{ fontSize: '13px', color: '#888' }}>hi, {profile?.display_name}</span>
      </div>

      <div style={{ background: '#f0ebe4', borderRadius: '20px', padding: '12px 16px', marginBottom: '12px', color: '#7a7872', fontSize: '13px' }}>
        how are you feeling right now?
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {['late night', 'pre-run', 'Sunday slow', 'rainy commute'].map(mood => (
          <div key={mood} style={{ background: '#d8dce8', borderRadius: '12px', padding: '4px 12px', fontSize: '12px', color: '#3a3e54' }}>{mood}</div>
        ))}
      </div>

      <div style={{ borderTop: '0.5px solid #e8e4de', paddingTop: '1rem' }}>
        <div style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#aaa', marginBottom: '12px' }}>from your people</div>
        <div style={{ color: '#aaa', fontSize: '13px', textAlign: 'center', padding: '2rem 0' }}>
          follow people to see their shares here
        </div>
      </div>
    </main>
  )
}