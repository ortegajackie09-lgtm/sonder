import { NextRequest, NextResponse } from 'next/server'

const MOOD_PARAMS: Record<string, any> = {
  'late night': { seed_genres: 'ambient,sleep', target_energy: 0.2, target_valence: 0.3, target_acousticness: 0.8 },
  'pre-run': { seed_genres: 'hip-hop,electronic', target_energy: 0.9, target_valence: 0.8, target_tempo: 140 },
  'sunday slow': { seed_genres: 'indie,folk', target_energy: 0.3, target_valence: 0.5, target_acousticness: 0.7 },
  'rainy commute': { seed_genres: 'indie,alternative', target_energy: 0.4, target_valence: 0.3, target_acousticness: 0.6 },
  'ethereal': { seed_genres: 'ambient,indie', target_energy: 0.3, target_valence: 0.5, target_instrumentalness: 0.5 },
  'post-workout': { seed_genres: 'pop,indie', target_energy: 0.6, target_valence: 0.7 },
  'focus': { seed_genres: 'classical,ambient', target_energy: 0.3, target_instrumentalness: 0.8, target_speechiness: 0.0 },
  'heartbreak': { seed_genres: 'indie,singer-songwriter', target_energy: 0.3, target_valence: 0.2, target_acousticness: 0.7 },
  'moody': { seed_genres: 'alternative,indie', target_energy: 0.4, target_valence: 0.25 },
}

const DEFAULT_PARAMS = { seed_genres: 'indie,pop,alternative', target_energy: 0.5, target_valence: 0.5 }

async function getClientToken() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')
    },
    body: 'grant_type=client_credentials'
  })
  const data = await res.json()
  return data.access_token
}

export async function GET(request: NextRequest) {
  const mood = request.nextUrl.searchParams.get('mood')?.toLowerCase() || ''
  const params = MOOD_PARAMS[mood] || DEFAULT_PARAMS

  const token = await getClientToken()

  const queryParams = new URLSearchParams({
    limit: '6',
    market: 'US',
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  })

  const res = await fetch(`https://api.spotify.com/v1/recommendations?${queryParams}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })

  const data = await res.json()

  const tracks = (data.tracks || []).map((track: any) => ({
    id: track.id,
    title: track.name,
    artist: track.artists[0]?.name,
    album: track.album?.name,
    album_art_url: track.album?.images[0]?.url,
    spotify_url: track.external_urls?.spotify,
    preview_url: track.preview_url
  }))

  return NextResponse.json({ tracks })
}