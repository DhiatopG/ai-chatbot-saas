/// <reference lib="dom" />
'use client'

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'

interface ChatLogicProps {
  botId: string
}

export default function ChatLogic({ botId }: ChatLogicProps) {
  const [messages, setMessages] = useState<{ sender: string; text: string; buttons?: string[] }[]>([])
  const [input, setInput] = useState('')
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [visible, setVisible] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    setMessages([{ sender: 'bot', text: 'Hi! How can I help you today?' }])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (optionalInput?: string) => {
    const userMessage = optionalInput || input
    if (!userMessage.trim()) return

    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }])
    setInput('')

    if (step === 0) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Can I ask for your name?',
          buttons: ['Yes', 'No'],
        },
      ])
      setStep(1)
      return
    }

    if (step === 1) {
      if (userMessage.toLowerCase() === 'yes') {
        setMessages((prev) => [...prev, { sender: 'bot', text: 'What is your name?' }])
        setStep(2)
      } else {
        setMessages((prev) => [...prev, { sender: 'bot', text: 'No problem! Feel free to ask anything.' }])
        setStep(99)
      }
      return
    }

    if (step === 2) {
      setName(userMessage)
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Thanks! Can I have your email?' }])
      setStep(3)
      return
    }

    if (step === 3) {
      setEmail(userMessage)
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Thanks! Feel free to ask anything now.' }])

      await axios.post('/api/lead', {
        user_id: botId,
        name: name || 'Anonymous',
        email: userMessage,
      })

      setStep(99)
      return
    }

    const res = await axios.post('/api/chat', {
      question: userMessage,
      user_id: botId,
      name,
      email,
    })

    const aiResponse = res.data?.answer || 'Sorry, I couldn’t find an answer.'
    setMessages((prev) => [...prev, { sender: 'bot', text: aiResponse }])
  }

  if (!visible) {
    return (
      <div
        className="fixed bottom-5 right-5 flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-lg cursor-pointer max-w-xs z-50"
        onClick={() => setVisible(true)}
      >
        <div className="text-sm text-gray-800">Hi! How can I help you?</div>
        <button className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg">
          💬
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-5 right-5 w-full max-w-sm h-[80vh] bg-white shadow-xl rounded-2xl flex flex-col overflow-hidden z-50">
      <div className="bg-green-600 text-white px-4 py-3 text-base font-bold flex justify-between items-center">
        Assistant
        <button
          onClick={() => setVisible(false)}
          className="text-white text-xl hover:text-gray-200"
        >
          ×
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-white">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`px-4 py-2 rounded-xl text-sm whitespace-pre-wrap max-w-[75%] ${
              msg.sender === 'bot'
                ? 'bg-gray-100 self-start text-black'
                : 'bg-green-600 text-white self-end'
            }`}
          >
            <div>{msg.text}</div>
            {msg.buttons && (
              <div className="flex flex-wrap gap-2 mt-2">
                {msg.buttons.map((btn, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(btn)}
                    className="bg-gray-200 text-sm px-3 py-1 rounded-full hover:bg-gray-300"
                  >
                    {btn}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-3 bg-white flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage()
          }}
          placeholder="Type your message..."
          className="flex-1 p-2 rounded-full border border-gray-300 text-sm outline-none"
        />
        <button
          onClick={() => sendMessage()}
          className="bg-green-600 text-white px-4 py-2 rounded-full text-sm"
        >
          Send
        </button>
      </div>
    </div>
  )
}
