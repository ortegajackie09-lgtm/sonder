'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function Mood() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    if (q) {
      setQuery(q)
      handleSearchWithQuery(q)
    }
  }, [])

  async function handleSearchWithQuery(q: string) {
    setLoading(true)
    setSearched(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth/login'; return }

    const { data: followData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    const followingIds = followData?.map(f => f.following_id) || []

    const { data: sharesData } = followingIds.length > 0
      ? await supabase
          .from('shares')
          .select(`
            id,
            mood_note,
            created_at,
            songs (
              title,
              artist,
              album_art_url,
              spotify_url
            ),
            users (
              display_name,
              avatar_initials
            )
          `)
          .in('user_id', followingIds)
          .ilike('mood_note', `%${q}%`)
          .limit(10)
      : { data: [] }

    setResults(sharesData || [])
    setLoading(false)
    setSearched(true)
  }

  async function handleSearch() {
    if (!query.trim()) return
    handleSearchWithQuery(query)
  }

  return (
    <main style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <a href="/" style={{ fontSize: '13px', color: '#888', textDecoration: 'none' }}>← back</a>
        <h1 style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: '1.75rem', margin: 0 }}>sonder</h1>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <input
          autoFocus
          placeholder="how are you feeling right now?"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          style={{ width: '100%', padding: '14px 16px', borderRadius: '20px', border: '0.5px solid #e8e4de', fontSize: '14px', background: '#f0ebe4', color: '#1e1c18', outline: 'none' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {['late night', 'pre-run', 'Sunday slow', 'rainy commute', 'ethereal', 'moody'].map(mood => (
          <div
            key={mood}
            onClick={() => { setQuery(mood); handleSearchWithQuery(mood) }}
            style={{ background: '#d8dce8', borderRadius: '12px', padding: '4px 12px', fontSize: '12px', color: '#3a3e54', cursor: 'pointer' }}
          >{mood}</div>
        ))}
      </div>

      <button
        onClick={handleSearch}
        disabled={loading}
        style={{ width: '100%', padding: '10px', background: '#1e1c18', color: '#f0ebe4', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', marginBottom: '1.5rem' }}
      >
        {loading ? 'searching...' : 'find music'}
      </button>

      {searched && results.length === 0 && (
        <div style={{ color: '#aaa', fontSize: '13px', textAlign: 'center', padding: '2rem 0' }}>
          no matches yet — share more songs with mood notes
        </div>
      )}

      {results.map(share => (
        <div key={share.id} style={{ border: '0.5px solid #e8e4de', borderRadius: '10px', padding: '12px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
            {share.songs?.album_art_url ? (
              <img src={share.songs.album_art_url} style={{ width: '40px', height: '40px', borderRadius: '6px', flexShrink: 0 }} />
            ) : (
              <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#d8dce8', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#1e1c18', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{share.songs?.title}</div>
              <div style={{ fontSize: '11px', color: '#888' }}>{share.songs?.artist}</div>
            </div>
            {share.songs?.spotify_url && (
              <a href={share.songs.spotify_url} target="_blank" style={{ fontSize: '10px', color: '#3a3e54', textDecoration: 'none', flexShrink: 0 }}>▶</a>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#d8dce8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 500, color: '#3a3e54', flexShrink: 0 }}>
              {share.users?.avatar_initials}
            </div>
            <span style={{ fontSize: '11px', color: '#888' }}>{share.users?.display_name}</span>
            {share.mood_note && <span style={{ fontSize: '10px', color: '#bbb', marginLeft: 'auto', fontStyle: 'italic' }}>{share.mood_note}</span>}
          </div>
        </div>
      ))}
    </main>
  )
}