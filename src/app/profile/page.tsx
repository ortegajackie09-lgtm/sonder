'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function Profile() {
  const [profile, setProfile] = useState<any>(null)
  const [shares, setShares] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const pf = "'Playfair Display', serif"
  const sans = "'DM Sans', sans-serif"
  const dark = '#1e2235'

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      setCurrentUser(user)

      const params = new URLSearchParams(window.location.search)
      const username = params.get('u')
      if (!username) { window.location.href = '/'; return }

      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (!profileData) { window.location.href = '/'; return }
      setProfile(profileData)

      const { data: sharesData } = await supabase
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
          )
        `)
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false })
        .limit(20)

      setShares(sharesData || [])

      if (profileData.id !== user.id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('follower_id', user.id)
          .eq('following_id', profileData.id)
          .single()
        setIsFollowing(!!followData)
      }

      setLoading(false)
    }
    load()
  }, [])

  async function toggleFollow() {
    if (!currentUser || !profile) return
    if (isFollowing) {
      await supabase.from('follows').delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', profile.id)
      setIsFollowing(false)
    } else {
      await supabase.from('follows').insert({
        follower_id: currentUser.id,
        following_id: profile.id
      })
      setIsFollowing(true)
    }
  }

  if (loading) return (
    <div style={{ background: dark, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: pf, fontStyle: 'italic', fontSize: '2rem', color: '#f0ebe4' }}>sonder</span>
    </div>
  )

  const isOwnProfile = currentUser?.id === profile?.id

  return (
    <main style={{ fontFamily: sans, background: '#f0f0ee', minHeight: '100vh' }}>
      <div style={{ background: dark, padding: '1.25rem 5vw', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <a href="/" style={{ fontSize: '14px', color: '#888890', textDecoration: 'none' }}>← back</a>
        <span style={{ fontFamily: pf, fontStyle: 'italic', fontSize: '2.4rem', color: '#f0ebe4' }}>sonder</span>
      </div>

      <div style={{ padding: '2.5rem 5vw' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '2.5rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: '#e8eaf2', flexShrink: 0 }}>
            {profile?.avatar_initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: dark, fontFamily: pf }}>{profile?.display_name}</div>
            <div style={{ fontSize: '14px', color: '#888', marginTop: '2px' }}>@{profile?.username}</div>
          </div>
          {!isOwnProfile && (
            <button onClick={toggleFollow} style={{
              padding: '10px 24px',
              borderRadius: '100px',
              border: '0.5px solid',
              borderColor: isFollowing ? '#dddbd8' : dark,
              background: isFollowing ? 'transparent' : dark,
              color: isFollowing ? '#888' : '#f0ebe4',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: sans
            }}>
              {isFollowing ? 'following' : 'follow'}
            </button>
          )}
        </div>

        <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', marginBottom: '1.25rem' }}>
          {shares.length} shares
        </div>

        {shares.length === 0 ? (
          <div style={{ background: dark, borderRadius: '16px', padding: '4rem 2rem', textAlign: 'center' }}>
            <p style={{ fontFamily: pf, fontStyle: 'italic', fontSize: '20px', color: '#e8eaf2' }}>no shares yet</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {shares.map(share => (
              <div key={share.id} style={{ border: '0.5px solid #dddbd8', borderRadius: '14px', padding: '18px', background: '#ffffff' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
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
                {share.mood_note && (
                  <div style={{ fontSize: '14px', color: '#aaa', fontFamily: pf, fontStyle: 'italic', borderTop: '0.5px solid #f0f0ee', paddingTop: '10px' }}>{share.mood_note}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}