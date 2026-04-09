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
    <div style={{ padding: '2rem', fontFamily: 'Georgia', fontStyle: 'italic', fontSize: '1.5rem' }}>sonder</div>
  )

  const isOwnProfile = currentUser?.id === profile?.id

  return (
    <main style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <a href="/" style={{ fontSize: '13px', color: '#888', textDecoration: 'none' }}>← back</a>
        <h1 style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: '1.75rem', margin: 0 }}>sonder</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.5rem' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#d8dce8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 500, color: '#3a3e54', flexShrink: 0 }}>
          {profile?.avatar_initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: 500, color: '#1e1c18' }}>{profile?.display_name}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>@{profile?.username}</div>
        </div>
        {!isOwnProfile && (
          <button
            onClick={toggleFollow}
            style={{
              padding: '7px 16px',
              borderRadius: '20px',
              border: '0.5px solid',
              borderColor: isFollowing ? '#e8e4de' : '#3a3e54',
              background: isFollowing ? 'transparent' : '#1e1c18',
              color: isFollowing ? '#888' : '#f0ebe4',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {isFollowing ? 'following' : 'follow'}
          </button>
        )}
      </div>

      <div style={{ borderTop: '0.5px solid #e8e4de', paddingTop: '1rem' }}>
        <div style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#aaa', marginBottom: '12px' }}>
          {shares.length} shares
        </div>

        {shares.length === 0 ? (
          <div style={{ color: '#aaa', fontSize: '13px', textAlign: 'center', padding: '2rem 0' }}>
            no shares yet
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
                  <div style={{ fontSize: '11px', color: '#888' }}>{share.songs?.artist}</div>
                </div>
                {share.songs?.spotify_url && (
                  <a href={share.songs.spotify_url} target="_blank" style={{ fontSize: '10px', color: '#3a3e54', textDecoration: 'none', flexShrink: 0 }}>▶</a>
                )}
              </div>
              {share.mood_note && (
                <div style={{ fontSize: '11px', color: '#bbb', fontStyle: 'italic' }}>{share.mood_note}</div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  )
}