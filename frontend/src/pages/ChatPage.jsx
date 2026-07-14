import { useEffect, useRef, useState } from 'react'
import { Send, FileText, AlertTriangle, Bot, User, Loader2, MessageSquare } from 'lucide-react'
import { sendChatMessage } from '../api/client'

function Message({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-zinc-700' : 'bg-violet-600'
        }`}
      >
        {isUser ? <User size={16} className="text-zinc-200" /> : <Bot size={16} className="text-white" />}
      </div>

      <div className={`flex max-w-[75%] flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
        {message.error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
            {message.text}
          </div>
        ) : (
          <div
            className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              isUser ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-100'
            }`}
          >
            {message.text}
          </div>
        )}

        {!isUser && message.isCovered === false && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            This topic is not covered in your uploaded material
          </div>
        )}

        {!isUser && message.isCovered && message.source && (
          <div className="flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-400">
            <FileText size={12} />
            {message.source}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isSending) return

    const userMessage = { role: 'user', text: trimmed }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setIsSending(true)

    try {
      const res = await sendChatMessage(trimmed)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.message,
          source: res.source,
          isCovered: res.is_covered,
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: err.message || 'Something went wrong. Please try again.', error: true },
      ])
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-6">
      <div className="flex-1 overflow-y-auto py-8">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/15">
              <MessageSquare size={26} className="text-violet-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-100">Ask anything about your notes</h2>
            <p className="mt-1 max-w-sm text-sm text-zinc-500">
              Upload your study materials first, then ask questions here. Answers are grounded in what you uploaded.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((m, i) => (
              <Message key={i} message={m} />
            ))}

            {isSending && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-zinc-800 px-4 py-2.5 text-sm text-zinc-400">
                  <Loader2 size={14} className="animate-spin" />
                  Thinking…
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-zinc-800 bg-zinc-900 pb-6 pt-4">
        <div className="flex items-end gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 focus-within:border-violet-500">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your uploaded material…"
            rows={1}
            className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-500"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
