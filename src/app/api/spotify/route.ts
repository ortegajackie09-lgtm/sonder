import { getSpotifyTrack } from '@/lib/spotify'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const spotifyId = request.nextUrl.searchParams.get('id')
  if (!spotifyId) return NextResponse.json({ error: 'no id' }, { status: 400 })
  
  console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? 'found' : 'MISSING')
  console.log('SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? 'found' : 'MISSING')
  
  try {
    const track = await getSpotifyTrack(spotifyId)
    return NextResponse.json(track)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}