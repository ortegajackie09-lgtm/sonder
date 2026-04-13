import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: shares } = await supabase
    .from('shares')
    .select('id, mood_note')
    .is('embedding', null)

  if (!shares || shares.length === 0) {
    return NextResponse.json({ message: 'nothing to backfill' })
  }

  let updated = 0
  for (const share of shares) {
    if (!share.mood_note) continue
    const res = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: share.mood_note,
    })
    const embedding = res.data[0].embedding
    await supabase.from('shares').update({ embedding }).eq('id', share.id)
    updated++
  }

  return NextResponse.json({ message: `backfilled ${updated} shares` })
}