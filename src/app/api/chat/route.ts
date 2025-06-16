import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  const body = await req.json()
  const { question, user_id } = body

  const { data: bot, error } = await supabase
    .from('bots')
    .select('id, description, scraped_content')
    .eq('id', user_id)
    .single()

  if (error || !bot) {
    return NextResponse.json({ error: 'Bot not found' }, { status: 400 })
  }

  const { data: fileData } = await supabase
    .from('bot_knowledge_files')
    .select('file_text')
    .eq('bot_id', bot.id)

  const fileKnowledge = fileData?.map((f) => f.file_text).join('\n\n') || ''

  const fullKnowledge = `
Business Description:
${bot.description || ''}

Scraped Website Content:
${bot.scraped_content || ''}

Uploaded Files:
${fileKnowledge}
`

  const prompt = `
You are a helpful assistant for a business. Use the following info to answer questions from potential customers:

${fullKnowledge}

Q: ${question}
A:
`

  try {
    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    })

    return NextResponse.json({ answer: chat.choices[0].message.content })
  } catch {
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 })
  }
}
