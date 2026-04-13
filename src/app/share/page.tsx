'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function Share() {
  const [url, setUrl] = useState('')
  const [mood, setMood] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const pf = "'Playfair Display', serif"
  const sans = "'DM Sans', sans-serif"
  const dark = '#1e2235'

  async function handleShare() {
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth/login'; return }

    const spotifyId = url.split('/track/')[1]?.split('?')[0]
    if (!spotifyId) { setError('paste a spotify track link'); setLoading(false); return }

    const { data: existingSong } = await supabase
      .from('songs')
      .select('id')
      .eq('spotify_id', spotifyId)
      .single()

    let songId = existingSong?.id

    if (!songId) {
      const trackRes = await fetch(`/api/spotify?id=${spotifyId}`)
      const track = await trackRes.json()

      const { data: newSong, error: songError } = await supabase
        .from('songs')
        .insert({
          spotify_id: spotifyId,
          title: track.title || 'Unknown',
          artist: track.artist || 'Unknown',
          album: track.album,
          album_art_url: track.album_art_url,
          duration_ms: track.duration_ms,
          spotify_url: track.spotify_url || url
        })
        .select('id')
        .single()
      if (songError) { setError(songError.message); setLoading(false); return }
      songId = newSong.id
    }

    const { data: share, error: shareError } = await supabase
      .from('shares')
      .insert({ user_id: user.id, song_id: songId, mood_note: mood })
      .select('id')
      .single()

    if (shareError) { setError(shareError.message); setLoading(false); return }

    if (mood && share?.id) {
      try {
        const embedRes = await fetch('/api/embed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: mood })
        })
        const { embedding } = await embedRes.json()
        if (embedding) {
          await supabase.from('shares').update({ embedding }).eq('id', share.id)
        }
      } catch {}
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) return (
    <main style={{ fontFamily: sans, background: '#f0f0ee', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: dark, padding: '1.25rem 5vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: pf, fontStyle: 'italic', fontSize: '2.4rem', color: '#f0ebe4' }}>sonder</span>
        <a href="/" style={{ fontSize: '14px', color: '#888890', textDecoration: 'none' }}>← back</a>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <p style={{ fontFamily: pf, fontStyle: 'italic', fontSize: '2rem', color: dark }}>shared.</p>
        <a href="/" style={{ fontSize: '15px', color: '#888' }}>back home</a>
      </div>
    </main>
  )

  return (
    <main style={{ fontFamily: sans, background: '#f0f0ee', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: dark, padding: '1.25rem 5vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: pf, fontStyle: 'italic', fontSize: '2.4rem', color: '#f0ebe4' }}>sonder</span>
        <a href="/" style={{ fontSize: '14px', color: '#888890', textDecoration: 'none' }}>← back</a>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '520px', padding: '2rem' }}>
          <h2 style={{ fontFamily: pf, fontStyle: 'italic', fontSize: '1.8rem', color: dark, marginBottom: '2rem', fontWeight: 400 }}>share a song</h2>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999', marginBottom: '8px' }}>spotify link</div>
            <input placeholder="paste a spotify track URL" value={url} onChange={e => setUrl(e.target.value)} style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '0.5px solid #dddbd8', fontSize: '16px', fontFamily: sans, background: '#fff', outline: 'none' }} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999', marginBottom: '8px' }}>what's the mood?</div>
            <input placeholder="describe the moment..." value={mood} onChange={e => setMood(e.target.value)} style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '0.5px solid #dddbd8', fontSize: '16px', fontFamily: pf, fontStyle: 'italic', background: '#fff', outline: 'none' }} />
          </div>

          {error && <p style={{ color: '#c0392b', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}

          <button onClick={handleShare} disabled={loading} style={{ width: '100%', padding: '14px', background: dark, color: '#f0ebe4', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '16px', fontFamily: sans, fontWeight: 600 }}>
            {loading ? 'sharing...' : 'share it'}
          </button>
        </div>
      </div>
    </main>
  )
}
