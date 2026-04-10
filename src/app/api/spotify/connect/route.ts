import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const clientId = process.env.SPOTIFY_CLIENT_ID!
  const redirectUri = process.env.NODE_ENV === 'production'
    ? 'https://sonder-lake.vercel.app/api/spotify/callback'
    : 'http://127.0.0.1:3000/api/spotify/callback'

  const scopes = [
    'playlist-modify-public',
    'playlist-modify-private',
    'user-read-private'
  ].join(' ')

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: scopes
  })

  return NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  )
}