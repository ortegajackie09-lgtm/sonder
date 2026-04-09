'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function Home() {
  const [profile, setProfile] = useState<any>(null)
  const [shares, setShares] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

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

      const { data: sharesData } = followingIds.length > 0 ? await supabase
        .from('shares')
        .select(`
          id,
          mood_note,
          created_at,
          user_id,
          songs (
            title,
            artist,
            album,
            album_art_url,
            spotify_url
          ),
          users (
            display_name,
            avatar_initials,
            username
          )
        `)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(20)
        : { data: [] }

      setShares(sharesData || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ padding: '2rem', fontFamily: 'Georgia', fontStyle: 'italic', fontSize: '1.5rem' }}>sonder</div>
  )

  return (
    <main style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: '1.75rem', margin: 0 }}>sonder</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="/users" style={{ fontSize: '13px', color: '#888', textDecoration: 'none' }}>find people</a>
          <a href="/share" style={{ fontSize: '13px', color: '#3a3e54', textDecoration: 'none' }}>+ share</a>
          <a href={`/profile?u=${profile?.username}`} style={{ fontSize: '13px', color: '#888', textDecoration: 'none' }}>hi, {profile?.display_name}</a>
        </div>
      </div>

      <a href="/mood" style={{ display: 'block', background: '#f0ebe4', borderRadius: '20px', padding: '12px 16px', marginBottom: '12px', color: '#7a7872', fontSize: '13px', textDecoration: 'none' }}>
        how are you feeling right now?
      </a>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {['late night', 'pre-run', 'Sunday slow', 'rainy commute'].map(mood => (
          <a key={mood} href={`/mood?q=${mood}`} style={{ background: '#d8dce8', borderRadius: '12px', padding: '4px 12px', fontSize: '12px', color: '#3a3e54', textDecoration: 'none' }}>{mood}</a>
        ))}
      </div>

      <div style={{ borderTop: '0.5px solid #e8e4de', paddingTop: '1rem' }}>
        <div style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#aaa', marginBottom: '12px' }}>
          from your people
        </div>

        {shares.length === 0 ? (
          <div style={{ color: '#aaa', fontSize: '13px', textAlign: 'center', padding: '2rem 0' }}>
            <p style={{ marginBottom: '8px' }}>nothing yet</p>
            <a href="/users" style={{ color: '#3a3e54', fontSize: '13px' }}>find people to follow →</a>
          </div>
        ) : (
          shares.map(share => (
            <div key={share.id} style={{ border: '0.5px solid #e8e4de', borderRadius: '10px', padding: '12px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                {share.songs?.album_art_url ? (
                  <img src={share.songs.album_art_url} style={{ width: '40px', height: '40px', borderRadius: '6px', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#d8dce8', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#1e1c18', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{share.songs?.title}</div>
                  <div style={{ fontSize: '11px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{share.songs?.artist}</div>
                </div>
                {share.songs?.spotify_url && (
                  <a href={share.songs.spotify_url} target="_blank" style={{ fontSize: '10px', color: '#3a3e54', textDecoration: 'none', flexShrink: 0 }}>▶</a>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#d8dce8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 500, color: '#3a3e54', flexShrink: 0 }}>
                  {share.users?.avatar_initials}
                </div>
                <a href={`/profile?u=${share.users?.username}`} style={{ fontSize: '11px', color: '#888', textDecoration: 'none' }}>{share.users?.display_name}</a>
                {share.mood_note && <span style={{ fontSize: '10px', color: '#bbb', marginLeft: 'auto', fontStyle: 'italic' }}>{share.mood_note}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}