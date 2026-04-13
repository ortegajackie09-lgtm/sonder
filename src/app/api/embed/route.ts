import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY)
  
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const { text } = await request.json()
  if (!text) return NextResponse.json({ error: 'no text' }, { status: 400 })

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })
    return NextResponse.json({ embedding: response.data[0].embedding })
  } catch (err: any) {
    console.error('OpenAI error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}