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

    const { error: shareError } = await supabase
      .from('shares')
      .insert({ user_id: user.id, song_id: songId, mood_note: mood })

    if (shareError) { setError(shareError.message); setLoading(false); return }

    setSuccess(true)
    setLoading(false)
  }

  if (success) return (
    <main style={{ maxWidth: '480px', margin: '4rem auto', padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: '1.75rem', marginBottom: '1rem' }}>sonder</h1>
      <p style={{ color: '#3a3e54', marginBottom: '1.5rem' }}>shared.</p>
      <a href="/" style={{ fontSize: '13px', color: '#888' }}>back home</a>
    </main>
  )

  return (
    <main style={{ maxWidth: '480px', margin: '4rem auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: '1.75rem', marginBottom: '0.5rem' }}>sonder</h1>
      <p style={{ fontSize: '13px', color: '#888', marginBottom: '2rem' }}>share a song</p>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#aaa', marginBottom: '6px' }}>spotify link</div>
        <input
          placeholder="paste a spotify track URL"
          value={url}
          onChange={e => setUrl(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e8e4de', fontSize: '13px' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#aaa', marginBottom: '6px' }}>what's the mood?</div>
        <input
          placeholder="describe the moment..."
          value={mood}
          onChange={e => setMood(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e8e4de', fontSize: '13px' }}
        />
      </div>

      {error && <p style={{ color: 'red', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

      <button
        onClick={handleShare}
        disabled={loading}
        style={{ width: '100%', padding: '10px', background: '#1e1c18', color: '#f0ebe4', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px' }}
      >
        {loading ? 'sharing...' : 'share it'}
      </button>

      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <a href="/" style={{ fontSize: '13px', color: '#888' }}>back home</a>
      </div>
    </main>
  )
}