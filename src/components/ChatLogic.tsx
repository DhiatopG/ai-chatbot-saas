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
          buttons: ['Yes', 'No']
        }
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
        email: userMessage
      })

      setStep(99)
      return
    }

    const res = await axios.post('/api/chat', {
      question: userMessage,
      user_id: botId,
      name,
      email
    })

    const aiResponse = res.data?.answer || 'Sorry, I couldn’t find an answer.'
    setMessages((prev) => [...prev, { sender: 'bot', text: aiResponse }])
  }

  if (!visible) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#fff',
          padding: '10px 16px',
          borderRadius: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          maxWidth: '280px',
          zIndex: 9999
        }}
        onClick={() => setVisible(true)}
      >
        <div style={{ fontSize: '14px', color: '#333' }}>
          Hi! How can I help you?
        </div>
        <button
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          💬
        </button>
      </div>
    )
  }

  return (
    <div className="chat-wrapper">
      <div className="chat-header">
        Assistant
        <button
          onClick={() => setVisible(false)}
          style={{
            float: 'right',
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>
      <div className="chat-body">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.sender}`}>
            <div>{msg.text}</div>
            {msg.buttons && (
              <div className="quick-replies">
                {msg.buttons.map((btn, i) => (
                  <button key={i} onClick={() => sendMessage(btn)}>
                    {btn}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage()
          }}
          placeholder="Type your message..."
        />
        <button onClick={() => sendMessage()}>Send</button>
      </div>
    </div>
  )
}
