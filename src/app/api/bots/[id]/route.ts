import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: Request, context: { params: { id: string } }) {
  const botId = context.params.id

  const { data, error } = await supabase
    .from('bots')
    .select('*')
    .eq('id', botId)
    .single()

  if (error) {
    return NextResponse.json({ error: 'Bot not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  const botId = context.params.id
  const body = await request.json()

  const { data, error } = await supabase
    .from('bots')
    .update(body)
    .eq('id', botId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json(data)
}
