export async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    },
    body: 'grant_type=client_credentials'
  })
  const data = await res.json()
  console.log('Spotify token response:', JSON.stringify(data))
  return data.access_token
}

export async function getSpotifyTrack(spotifyId: string) {
  const token = await getSpotifyToken()
  console.log('Token:', token ? 'got token' : 'NO TOKEN')
  
  const res = await fetch(`https://api.spotify.com/v1/tracks/${spotifyId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const data = await res.json()
  console.log('Track response:', JSON.stringify(data).slice(0, 200))
  
  return {
    title: data.name,
    artist: data.artists?.[0]?.name,
    album: data.album?.name,
    album_art_url: data.album?.images?.[0]?.url,
    duration_ms: data.duration_ms,
    spotify_url: data.external_urls?.spotify
  }
}