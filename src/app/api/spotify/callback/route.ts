import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const error = request.nextUrl.searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID!
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!
  const redirectUri = process.env.NODE_ENV === 'production'
    ? 'https://sonder-lake.vercel.app/api/spotify/callback'
    : 'http://127.0.0.1:3000/api/spotify/callback'

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    })
  })

  const tokens = await tokenRes.json()

  const response = NextResponse.redirect(new URL('/', request.url))
  response.cookies.set('spotify_access_token', tokens.access_token, { maxAge: 3600, httpOnly: true })
  response.cookies.set('spotify_refresh_token', tokens.refresh_token, { httpOnly: true })

  return response
}