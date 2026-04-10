'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function Home() {
  const [profile, setProfile] = useState<any>(null)
  const [shares, setShares] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [feedType, setFeedType] = useState<'graph' | 'trending' | 'recommended'>('graph')
  const supabase = createClient()

  const pf = "'Playfair Display', serif"
  const sans = "'DM Sans', sans-serif"
  const dark = '#1e2235'

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }

      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      const { data: followData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      const followingIds = followData?.map(f => f.following_id) || []

      if (followingIds.length > 0) {
        const { data: sharesData } = await supabase
          .from('shares')
          .select(`
            id, mood_note, created_at, user_id,
            songs ( title, artist, album, album_art_url, spotify_url ),
            users ( display_name, avatar_initials, username )
          `)
          .in('user_id', followingIds)
          .order('created_at', { ascending: false })
          .limit(20)

        if (sharesData && sharesData.length > 0) {
          setShares(sharesData)
          setFeedType('graph')
          setLoading(false)
          return
        }
      }

      const { data: trendingData } = await supabase
        .from('shares')
        .select(`
          id, mood_note, created_at, user_id,
          songs ( title, artist, album, album_art_url, spotify_url ),
          users ( display_name, avatar_initials, username )
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (trendingData && trendingData.length > 0) {
        setShares(trendingData)
        setFeedType('trending')
        setLoading(false)
        return
      }

      const recRes = await fetch('/api/spotify/recommendations?mood=indie')
      const recData = await recRes.json()
      setRecommendations(recData.tracks || [])
      setFeedType('recommended')
      setLoading(false)
    }
    load()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  if (loading) return (
    <div style={{ background: dark, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: pf, fontStyle: 'italic', fontSize: '3rem', color: '#f0ebe4' }}>sonder</span>
    </div>
  )

  const feedLabel = feedType === 'graph' ? 'from your people' : feedType === 'trending' ? 'trending on sonder' : 'you might like'

  return (
    <main style={{ fontFamily: sans, background: '#f0f0ee', minHeight: '100vh' }}>

      <div style={{ background: dark, padding: '1.25rem 5vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontFamily: pf, fontStyle: 'italic', fontSize: '2.4rem', margin: 0, color: '#f0ebe4' }}>sonder</h1>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="/users" style={{ fontSize: '15px', color: '#888890', textDecoration: 'none' }}>find people</a>
          <a href="/share" style={{ fontSize: '15px', color: '#f0ebe4', textDecoration: 'none', fontWeight: 600 }}>+ share</a>
          <a href={`/profile?u=${profile?.username}`} style={{ fontSize: '15px', color: '#888890', textDecoration: 'none' }}>hi, {profile?.display_name}</a>
          <button onClick={handleSignOut} style={{ fontSize: '13px', color: '#555550', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>sign out</button>
        </div>
      </div>

      <div style={{ padding: '2.5rem 5vw 0' }}>
        <a href="/mood" style={{ display: 'block', background: dark, borderRadius: '16px', padding: '28px 32px', marginBottom: '16px', textDecoration: 'none' }}>
          <div style={{ fontFamily: pf, fontStyle: 'italic', fontSize: '26px', color: '#e8eaf2', marginBottom: '8px' }}>how are you feeling right now?</div>
          <div style={{ fontFamily: sans, fontSize: '15px', color: '#8a8fa8', fontWeight: 500 }}>tap to search by mood →</div>
        </a>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '3rem' }}>
          {['late night', 'pre-run', 'Sunday slow', 'rainy commute'].map(mood => (
            <a key={mood} href={`/mood?q=${mood}`} style={{ background: dark, borderRadius: '100px', padding: '12px 24px', fontSize: '16px', color: '#e8eaf2', textDecoration: 'none', fontWeight: 600 }}>{mood}</a>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 5vw 4rem' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', marginBottom: '1.25rem' }}>
          {feedLabel}
        </div>

        {feedType === 'recommended' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {recommendations.map((track: any) => (
              <div key={track.id} style={{ border: '0.5px solid #dddbd8', borderRadius: '14px', padding: '18px', background: '#ffffff' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '14px' }}>
                  {track.album_art_url ? (
                    <img src={track.album_art_url} style={{ width: '68px', height: '68px', borderRadius: '10px', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '68px', height: '68px', borderRadius: '10px', background: '#e8eaf2', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a18', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: pf }}>{track.title}</div>
                    <div style={{ fontSize: '14px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '3px', fontFamily: pf, fontStyle: 'italic' }}>{track.artist}</div>
                  </div>
                  {track.spotify_url && (
                    <a href={track.spotify_url} target="_blank" style={{ width: '38px', height: '38px', borderRadius: '50%', background: dark, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e8eaf2', textDecoration: 'none', fontSize: '13px', flexShrink: 0 }}>▶</a>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#aaa', fontFamily: pf, fontStyle: 'italic' }}>recommended for you</div>
              </div>
            ))}
          </div>
        ) : shares.length === 0 ? (
          <div style={{ background: dark, borderRadius: '16px', padding: '4rem 2rem', textAlign: 'center' }}>
            <p style={{ fontFamily: pf, fontStyle: 'italic', fontSize: '22px', color: '#e8eaf2', marginBottom: '16px' }}>nothing yet</p>
            <a href="/users" style={{ color: '#8a8fa8', fontSize: '15px' }}>find people to follow →</a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {shares.map(share => (
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
        )}
      </div>
    </main>
  )
}