'use client'

import { useParams } from 'next/navigation'
import ChatLogic from '@/components/ChatLogic'

export default function BotPage() {
  const params = useParams()
  const botId = Array.isArray(params.id) ? params.id[0] : params.id

  if (!botId) return <div className="text-center p-4">Bot ID missing</div>

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <ChatLogic botId={botId} />
      </div>
    </div>
  )
}
