import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('spotify_access_token')?.value
  if (!accessToken) {
    return NextResponse.json({ error: 'not_connected' }, { status: 401 })
  }

  const { trackIds, name } = await request.json()
  if (!trackIds?.length) return NextResponse.json({ error: 'no tracks' }, { status: 400 })

  try {
    const meRes = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    const me = await meRes.json()
    console.log('Spotify me:', JSON.stringify(me).slice(0, 200))
    if (!me.id) return NextResponse.json({ error: 'invalid token', me }, { status: 401 })

    const playlistRes = await fetch(`https://api.spotify.com/v1/users/${me.id}/playlists`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name || 'sonder mix', description: 'created with sonder', public: false })
    })
    const playlist = await playlistRes.json()
    console.log('Playlist created:', JSON.stringify(playlist).slice(0, 200))

    if (!playlist.id) return NextResponse.json({ error: 'playlist creation failed', playlist }, { status: 500 })

    const addRes = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ uris: trackIds.map((id: string) => `spotify:track:${id}`) })
    })
    const addData = await addRes.json()
    console.log('Tracks added:', JSON.stringify(addData).slice(0, 200))

    return NextResponse.json({ playlist_url: playlist.external_urls?.spotify, playlist_id: playlist.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
