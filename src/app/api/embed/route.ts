import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: NextRequest) {
  const { text } = await request.json()
  if (!text) return NextResponse.json({ error: 'no text' }, { status: 400 })

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })

  return NextResponse.json({ embedding: response.data[0].embedding })
}