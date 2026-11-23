import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import { ArrowUp, Bot, LoaderCircle } from 'lucide-react'
import { chatWithTutor } from '../api/ai'
import type { ChatMessage, Problem } from '../types'

export const ChatAi = ({ problem }: { problem: Problem }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const mutation = useMutation({ mutationFn: chatWithTutor })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, mutation.isPending])

  const sendMessage = async (event?: FormEvent) => {
    event?.preventDefault()
    const text = draft.trim()
    if (!text || mutation.isPending) return
    const userMessage: ChatMessage = { role: 'user', parts: [{ text }] }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setDraft('')
    try {
      const answer = await mutation.mutateAsync({
        messages: nextMessages.slice(-20),
        title: problem.title,
        description: problem.description ?? '',
        testCases: problem.visibleTestCases ?? [],
        startCode: problem.startCode ?? [],
      })
      setMessages((current) => [...current, { role: 'model', parts: [{ text: answer }] }])
    } catch {
      // The mutation error is shown below without exposing transport details in chat history.
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void sendMessage()
    }
  }

  return (
    <section className="flex h-[min(68vh,680px)] min-h-[420px] flex-col overflow-hidden border border-border bg-surface">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Bot size={16} className="text-accent" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-semibold text-ink">AI tutor</h2>
          <p className="text-xs text-muted">Hints and explanations for this problem</p>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="mx-auto max-w-sm py-8 text-center">
            <p className="text-sm font-medium text-ink">What are you stuck on?</p>
            <p className="mt-1 text-xs leading-5 text-muted">Ask for a hint, a code review, or help comparing approaches.</p>
          </div>
        )}
        {messages.map((message, index) => (
          <article key={`${message.role}-${index}`} className={`max-w-[92%] px-3 py-2.5 text-sm leading-6 ${message.role === 'user' ? 'ml-auto border border-border bg-raised text-ink' : 'mr-auto text-ink'}`}>
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="whitespace-pre-wrap [&+p]:mt-2">{children}</p>,
                pre: ({ children }) => <pre className="my-2 overflow-x-auto border border-border bg-page p-3 font-mono text-sm leading-6 text-ink">{children}</pre>,
                code: ({ children, className }) => className
                  ? <code className={className}>{children}</code>
                  : <code className="rounded-sm bg-raised px-1 py-0.5 font-mono text-[0.9em]">{children}</code>,
                ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
                ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
              }}
            >
              {message.parts.map((part) => part.text).join('\n')}
            </ReactMarkdown>
          </article>
        ))}
        {mutation.isPending && (
          <p role="status" className="flex items-center gap-2 text-xs text-muted"><LoaderCircle size={16} className="animate-spin" aria-hidden="true" />Thinking…</p>
        )}
        {mutation.isError && (
          <p role="alert" className="border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">The tutor could not respond. Try sending your question again.</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="sticky bottom-0 border-t border-border bg-surface p-3">
        <label htmlFor="ai-message" className="sr-only">Message the AI tutor</label>
        <div className="flex items-end gap-2 border border-border bg-page p-2 focus-within:border-accent">
          <textarea
            id="ai-message"
            rows={2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask for a hint…"
            disabled={mutation.isPending}
            className="max-h-32 min-h-12 flex-1 resize-y bg-transparent px-1 py-1 text-sm leading-5 text-ink outline-none placeholder:text-muted disabled:opacity-60"
          />
          <button type="submit" disabled={!draft.trim() || mutation.isPending} aria-label="Send message" className="inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-accent-solid bg-accent-solid text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40">
            <ArrowUp size={16} aria-hidden="true" />
          </button>
        </div>
        <p className="mt-1.5 px-1 text-xs text-muted">Enter sends. Shift+Enter adds a line.</p>
      </form>
    </section>
  )
}
