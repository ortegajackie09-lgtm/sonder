'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function Mood() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const supabase = createClient()

  const pf = "'Playfair Display', serif"
  const sans = "'DM Sans', sans-serif"
  const dark = '#1e2235'

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    if (q) { setQuery(q); handleSearchWithQuery(q) }
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

    if (followingIds.length === 0) {
      setResults([])
      setLoading(false)
      setSearched(true)
      return
    }

    const embedRes = await fetch('/api/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: q })
    })
    const { embedding } = await embedRes.json()

    const { data: matchedShares } = await supabase.rpc('match_shares', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 10,
      user_ids: followingIds
    })

    if (!matchedShares || matchedShares.length === 0) {
      const { data: fallback } = await supabase
        .from('shares')
        .select(`
          id, mood_note, created_at,
          songs ( title, artist, album_art_url, spotify_url ),
          users ( display_name, avatar_initials, username )
        `)
        .in('user_id', followingIds)
        .ilike('mood_note', `%${q}%`)
        .limit(10)
      setResults(fallback || [])
      setLoading(false)
      setSearched(true)
      return
    }

    const shareIds = matchedShares.map((s: any) => s.id)
    const { data: fullShares } = await supabase
      .from('shares')
      .select(`
        id, mood_note, created_at,
        songs ( title, artist, album_art_url, spotify_url ),
        users ( display_name, avatar_initials, username )
      `)
      .in('id', shareIds)

    const sorted = shareIds
      .map((id: string) => fullShares?.find((s: any) => s.id === id))
      .filter(Boolean)

    setResults(sorted)
    setLoading(false)
    setSearched(true)
  }

  async function handleSearch() {
    if (!query.trim()) return
    handleSearchWithQuery(query)
  }

  return (
    <main style={{ fontFamily: sans, background: '#f0f0ee', minHeight: '100vh' }}>
      <div style={{ background: dark, padding: '1.25rem 5vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: pf, fontStyle: 'italic', fontSize: '2.4rem', color: '#f0ebe4' }}>sonder</span>
        <a href="/" style={{ fontSize: '14px', color: '#888890', textDecoration: 'none' }}>← back</a>
      </div>

      <div style={{ padding: '2.5rem 5vw' }}>
        <input
          autoFocus
          placeholder="how are you feeling right now?"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          style={{ width: '100%', padding: '20px 24px', borderRadius: '14px', border: 'none', fontSize: '20px', fontFamily: pf, fontStyle: 'italic', background: dark, color: '#e8eaf2', outline: 'none', marginBottom: '16px' }}
        />

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {['late night', 'pre-run', 'Sunday slow', 'rainy commute', 'ethereal', 'moody'].map(mood => (
            <div key={mood} onClick={() => { setQuery(mood); handleSearchWithQuery(mood) }}
              style={{ background: dark, borderRadius: '100px', padding: '10px 20px', fontSize: '15px', color: '#e8eaf2', cursor: 'pointer', fontWeight: 600 }}>{mood}</div>
          ))}
        </div>

        <button onClick={handleSearch} disabled={loading}
          style={{ width: '100%', padding: '14px', background: dark, color: '#f0ebe4', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 600, marginBottom: '2rem' }}>
          {loading ? 'searching...' : 'find music'}
        </button>

        {searched && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <p style={{ fontFamily: pf, fontStyle: 'italic', fontSize: '20px', color: '#aaa' }}>no matches yet</p>
            <p style={{ fontSize: '14px', color: '#bbb', marginTop: '8px' }}>share more songs with mood notes</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
          {results.map((share: any) => (
            <div key={share.id} style={{ border: '0.5px solid #dddbd8', borderRadius: '14px', padding: '18px', background: '#ffffff' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '14px' }}>
                {share.songs?.album_art_url ? (
                  <img src={share.songs.album_art_url} style={{ width: '68px', height: '68px', borderRadius: '10px', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '68px', height: '68px', borderRadius: '10px', background: '#e8eaf2', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a18', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: pf }}>{share.songs?.title}</div>
                  <div style={{ fontSize: '14px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '3px', fontFamily: pf, fontStyle: 'italic' }}>{share.songs?.artist}</div>
                </div>
                {share.songs?.spotify_url && (
                  <a href={share.songs.spotify_url} target="_blank" style={{ width: '38px', height: '38px', borderRadius: '50%', background: dark, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e8eaf2', textDecoration: 'none', fontSize: '13px', flexShrink: 0 }}>▶</a>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '0.5px solid #f0f0ee', paddingTop: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#e8eaf2', flexShrink: 0 }}>
                  {share.users?.avatar_initials}
                </div>
                <a href={`/profile?u=${share.users?.username}`} style={{ fontSize: '14px', color: dark, textDecoration: 'none', fontWeight: 600 }}>{share.users?.display_name}</a>
                {share.mood_note && <span style={{ fontSize: '13px', color: '#aaa', marginLeft: 'auto', fontFamily: pf, fontStyle: 'italic' }}>{share.mood_note}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}