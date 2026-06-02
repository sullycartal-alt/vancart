'use client'

import { useEffect, useRef, useState } from 'react'

interface Message {
  role: 'user' | 'model'
  content: string
}

interface MerchantContext {
  business_name?: string
  loyalty_rule?: string
  stamps_required?: number
  points_required?: number | null
  loyalty_type?: string
}

const DEFAULT_WELCOME = "Bonjour ! Je suis votre conseiller fidélité VanCart. Je suis là pour vous aider à créer le programme de fidélité idéal pour votre commerce. Pour commencer, pouvez-vous me dire quel type de commerce vous avez ? (bar, coffee shop, restaurant, autre)"

const DAILY_LIMIT = 30
const LS_KEY = 'vancart_ai_usage'

function getDailyCount(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return 0
    const { date, count } = JSON.parse(raw)
    if (date !== new Date().toISOString().slice(0, 10)) return 0
    return count
  } catch { return 0 }
}

function incrementDailyCount() {
  const today = new Date().toISOString().slice(0, 10)
  const count = getDailyCount() + 1
  localStorage.setItem(LS_KEY, JSON.stringify({ date: today, count }))
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 bg-[#6C47FF]/40 rounded-full"
          style={{ animation: `typing-bounce 1.2s ${i * 0.2}s ease-in-out infinite` }}
        />
      ))}
    </div>
  )
}

function AIAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-[#6C47FF] flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-sm">
      VC
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && <AIAvatar />}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-[#6C47FF] text-white rounded-br-sm'
            : 'bg-white border border-[#E8E8E3] text-[#1A1A1A] rounded-bl-sm'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}

export default function ChatClient({ merchantContext, initialWelcome }: { merchantContext: MerchantContext; initialWelcome?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: initialWelcome ?? DEFAULT_WELCOME },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [dailyCount, setDailyCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setDailyCount(getDailyCount())
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return
    if (dailyCount >= DAILY_LIMIT) {
      setError(`Vous avez atteint la limite de ${DAILY_LIMIT} messages par jour.`)
      return
    }

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setError(null)
    incrementDailyCount()
    setDailyCount(getDailyCount())

    try {
      const res = await fetch('/api/ai/conseil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, merchantContext }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Une erreur est survenue')
      } else {
        setMessages(prev => [...prev, { role: 'model', content: data.content }])
      }
    } catch {
      setError('Erreur réseau. Veuillez réessayer.')
    }
    setLoading(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Auto-resize textarea
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
    }
  }

  const remaining = DAILY_LIMIT - dailyCount

  return (
    <div className="flex flex-col h-full bg-white border border-[#E8E8E3] rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E8E8E3] bg-[#F7F6F3]">
        <AIAvatar />
        <div>
          <p className="text-sm font-semibold text-[#1A1A1A]">Conseiller Fidélité VanCart</p>
          <p className="text-xs text-[#6B6B6B]">Propulsé par Mistral AI 🇫🇷 · {remaining} message{remaining !== 1 ? 's' : ''} restant{remaining !== 1 ? 's' : ''} aujourd&apos;hui</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-[#6B6B6B]">En ligne</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-[#F7F6F3]">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {loading && (
          <div className="flex items-end gap-2.5">
            <AIAvatar />
            <div className="bg-white border border-[#E8E8E3] rounded-2xl rounded-bl-sm">
              <TypingDots />
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-600">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-[#E8E8E3] bg-white">
        {dailyCount >= DAILY_LIMIT ? (
          <div className="text-center text-sm text-[#6B6B6B] py-2">
            Limite quotidienne atteinte. Revenez demain !
          </div>
        ) : (
          <div className="flex items-end gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question… (Entrée pour envoyer)"
              rows={1}
              disabled={loading}
              className="flex-1 resize-none rounded-xl border border-[#E8E8E3] bg-[#F7F6F3] px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#6B6B6B] focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/15 transition-all disabled:opacity-50"
              style={{ minHeight: '44px', maxHeight: '120px', fontSize: '16px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#6C47FF] text-white flex items-center justify-center hover:bg-[#5835e0] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        )}
        <p className="text-[10px] text-[#6B6B6B] mt-2 text-center">
          Shift+Entrée pour aller à la ligne · Les conseils sont informatifs, adaptez-les à votre situation
        </p>
      </div>

      <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
