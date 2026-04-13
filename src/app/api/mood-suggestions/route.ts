import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getSpotifyToken } from '@/lib/spotify'

export async function POST(request: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const { mood } = await request.json()
  if (!mood) return NextResponse.json({ error: 'no mood' }, { status: 400 })

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a music curator with deep, eclectic taste. Given a mood or feeling, suggest 6 songs that genuinely fit that vibe. Avoid obvious, overplayed choices. Favor deep cuts, lesser-known tracks, and artists across genres. Return ONLY a JSON array of objects with "title" and "artist" fields. No explanation, no markdown, just the raw JSON array.`
        },
        {
          role: 'user',
          content: `Mood: ${mood}`
        }
      ],
      max_tokens: 500,
      temperature: 0.9
    })

    const raw = completion.choices[0].message.content || '[]'
    const suggestions = JSON.parse(raw.replace(/```json|```/g, '').trim())

    const token = await getSpotifyToken()
    const results = []

    for (const song of suggestions) {
      try {
        const query = encodeURIComponent(`track:${song.title} artist:${song.artist}`)
        const res = await fetch(
          `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = await res.json()
        const track = data.tracks?.items?.[0]
        if (!track) continue

        results.push({
          id: track.id,
          title: track.name,
          artist: track.artists?.[0]?.name,
          album_art_url: track.album?.images?.[0]?.url,
          spotify_url: track.external_urls?.spotify,
          preview_url: track.preview_url,
          ai_suggested: true
        })
      } catch {
        continue
      }
    }

    return NextResponse.json({ suggestions: results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
