'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function Users() {
  const [users, setUsers] = useState<any[]>([])
  const [following, setFollowing] = useState<string[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

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
    <div style={{ padding: '2rem', fontFamily: 'Georgia', fontStyle: 'italic', fontSize: '1.5rem' }}>sonder</div>
  )

  return (
    <main style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <a href="/" style={{ fontSize: '13px', color: '#888', textDecoration: 'none' }}>← back</a>
        <h1 style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: '1.75rem', margin: 0 }}>find people</h1>
      </div>

      {users.length === 0 ? (
        <div style={{ color: '#aaa', fontSize: '13px', textAlign: 'center', padding: '2rem 0' }}>
          no other users yet — invite someone!
        </div>
      ) : (
        users.map(user => (
          <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '0.5px solid #e8e4de' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#d8dce8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 500, color: '#3a3e54', flexShrink: 0 }}>
              {user.avatar_initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#1e1c18' }}>{user.display_name}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>@{user.username}</div>
            </div>
            <button
              onClick={() => toggleFollow(user.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '0.5px solid',
                borderColor: following.includes(user.id) ? '#e8e4de' : '#3a3e54',
                background: following.includes(user.id) ? 'transparent' : '#1e1c18',
                color: following.includes(user.id) ? '#888' : '#f0ebe4',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {following.includes(user.id) ? 'following' : 'follow'}
            </button>
          </div>
        ))
      )}
    </main>
  )
}