import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { createClient } from '@supabase/supabase-js'
import pdfParse from 'pdf-parse'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File
  const botId = formData.get('bot_id') as string

  if (!file || !botId) {
    return NextResponse.json({ error: 'Missing file or bot_id' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  let fileText = ''

  if (file.name.endsWith('.pdf')) {
    const parsed = await pdfParse(buffer)
    fileText = parsed.text
  } else {
    fileText = buffer.toString('utf-8')
  }

  await supabase.from('bot_knowledge_files').insert([
    {
      bot_id: botId,
      file_text: fileText
    }
  ])

  return NextResponse.json({ success: true })
}
