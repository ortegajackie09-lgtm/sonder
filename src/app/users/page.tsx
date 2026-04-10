'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function Users() {
  const [users, setUsers] = useState<any[]>([])
  const [following, setFollowing] = useState<string[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
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

      const { data: allUsers } = await supabase
        .from('users')
        .select('*')
        .neq('id', user.id)

      const { data: followData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      setUsers(allUsers || [])
      setFollowing(followData?.map(f => f.following_id) || [])
      setLoading(false)
    }
    load()
  }, [])

  async function toggleFollow(userId: string) {
    if (!currentUser) return
    const isFollowing = following.includes(userId)

    if (isFollowing) {
      await supabase.from('follows').delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', userId)
      setFollowing(following.filter(id => id !== userId))
    } else {
      await supabase.from('follows').insert({
        follower_id: currentUser.id,
        following_id: userId
      })
      setFollowing([...following, userId])
    }
  }

  if (loading) return (
    <div style={{ background: dark, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: pf, fontStyle: 'italic', fontSize: '2rem', color: '#f0ebe4' }}>sonder</span>
    </div>
  )

  return (
    <main style={{ fontFamily: sans, background: '#f0f0ee', minHeight: '100vh' }}>
      <div style={{ background: dark, padding: '1.25rem 5vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: pf, fontStyle: 'italic', fontSize: '2.4rem', color: '#f0ebe4' }}>sonder</span>
        <a href="/" style={{ fontSize: '14px', color: '#888890', textDecoration: 'none' }}>← back</a>
      </div>

      <div style={{ padding: '2.5rem 5vw' }}>
        <h2 style={{ fontFamily: pf, fontStyle: 'italic', fontSize: '1.8rem', color: dark, marginBottom: '2rem', fontWeight: 400 }}>find people</h2>

        {users.length === 0 ? (
          <div style={{ background: dark, borderRadius: '16px', padding: '4rem 2rem', textAlign: 'center' }}>
            <p style={{ fontFamily: pf, fontStyle: 'italic', fontSize: '20px', color: '#e8eaf2' }}>no other users yet — invite someone!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {users.map(user => (
              <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', background: '#fff', borderRadius: '14px', border: '0.5px solid #dddbd8' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#e8eaf2', flexShrink: 0 }}>
                  {user.avatar_initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '17px', fontWeight: 600, color: dark, fontFamily: pf }}>{user.display_name}</div>
                  <div style={{ fontSize: '13px', color: '#888' }}>@{user.username}</div>
                </div>
                <button onClick={() => toggleFollow(user.id)} style={{
                  padding: '10px 22px',
                  borderRadius: '100px',
                  border: '0.5px solid',
                  borderColor: following.includes(user.id) ? '#dddbd8' : dark,
                  background: following.includes(user.id) ? 'transparent' : dark,
                  color: following.includes(user.id) ? '#888' : '#f0ebe4',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: sans
                }}>
                  {following.includes(user.id) ? 'following' : 'follow'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}