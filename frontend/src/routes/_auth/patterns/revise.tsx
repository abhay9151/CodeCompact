import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Check, ExternalLink, LoaderCircle, Minus, Plus, Shuffle } from 'lucide-react'
import { pickRevision } from '../../../api/patterns'
import type { RevisionMode } from '../../../api/patterns'
import { Toast } from '../../../components/Toast'
import { usePatternMutations, usePatternSheet } from '../../../components/patterns/usePatternSheet'
import { useAuth } from '../../../hooks/useAuth'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'
import { getErrorMessage } from '../../../lib/errors'
import type { RevisionQuestion } from '../../../types/patterns'

interface QueueQuestion extends RevisionQuestion {
  round: number
}

interface RevisionSession {
  queue: QueueQuestion[]
  currentIndex: number
  counted: number
  rounds: number
  revisedQuestions: Array<{ title: string; round: number }>
}

type Screen = 'setup' | 'session' | 'finished'

export const Route = createFileRoute('/_auth/patterns/revise')({
  component: RevisionPage,
})

const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[otherIndex]] = [result[otherIndex], result[index]]
  }
  return result
}

const sessionKey = (userId: string) => `patternRevisionSession:${userId}`

const isRevisionSession = (value: unknown): value is RevisionSession => {
  if (!value || typeof value !== 'object') return false
  const session = value as Partial<RevisionSession>
  return Array.isArray(session.queue)
    && Number.isInteger(session.currentIndex)
    && Number.isInteger(session.counted)
    && Number.isInteger(session.rounds)
    && Array.isArray(session.revisedQuestions)
    && (session.currentIndex as number) >= 0
    && (session.currentIndex as number) < session.queue.length
    && session.queue.every((item) => (
      item
      && typeof item === 'object'
      && typeof item._id === 'string'
      && typeof item.title === 'string'
      && Number.isInteger(item.round)
    ))
    && session.revisedQuestions.every((item) => (
      item
      && typeof item.title === 'string'
      && Number.isInteger(item.round)
    ))
}

const NumberStepper = ({
  id,
  label,
  value,
  min,
  max,
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-ink">{label}</label>
    <div className="mt-2 flex min-h-11 items-stretch border border-border bg-surface">
      <button
        type="button"
        aria-label={`Decrease ${label.toLowerCase()}`}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="grid w-11 shrink-0 place-items-center border-r border-border text-muted hover:bg-raised hover:text-ink disabled:opacity-40"
      >
        <Minus size={16} aria-hidden="true" />
      </button>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Math.min(max, Math.max(min, Math.trunc(Number(event.target.value) || min))))}
        className="min-w-0 flex-1 bg-transparent text-center font-mono text-sm text-ink outline-none"
      />
      <button
        type="button"
        aria-label={`Increase ${label.toLowerCase()}`}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="grid w-11 shrink-0 place-items-center border-l border-border text-muted hover:bg-raised hover:text-ink disabled:opacity-40"
      >
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  </div>
)

function RevisionPage() {
  useDocumentTitle('Revise Patterns | CodeCompact')
  const { user } = useAuth()
  const sheetQuery = usePatternSheet()
  const { revised } = usePatternMutations()
  const [count, setCount] = useState(3)
  const [times, setTimes] = useState(1)
  const [mode, setMode] = useState<RevisionMode>('smart')
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([])
  const [screen, setScreen] = useState<Screen>('setup')
  const [session, setSession] = useState<RevisionSession | null>(null)
  const [restoredUserId, setRestoredUserId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [isStarting, setIsStarting] = useState(false)
  const sections = sheetQuery.data?.patterns ?? []
  const solvedCount = sheetQuery.data?.stats.solved ?? 0
  const solvedCountsByPattern = useMemo(() => new Map(
    sections.map((section) => [
      section.pattern,
      section.questions.filter((question) => question.solved).length,
    ]),
  ), [sections])
  const currentQuestion = session?.queue[session.currentIndex]
  const totalQuestions = session?.queue.length ?? 0
  const progress = totalQuestions > 0 && session
    ? Math.round((session.currentIndex / totalQuestions) * 100)
    : 0

  useEffect(() => {
    const userId = user?._id
    if (!userId || restoredUserId === userId) return

    let restored: RevisionSession | null = null
    try {
      const stored = window.localStorage.getItem(sessionKey(userId))
      if (stored) {
        const parsed: unknown = JSON.parse(stored)
        if (isRevisionSession(parsed)) restored = parsed
      }
    } catch {
      restored = null
    }
    setSession(restored)
    setScreen(restored ? 'session' : 'setup')
    setRestoredUserId(userId)
  }, [restoredUserId, user?._id])

  useEffect(() => {
    const userId = user?._id
    if (!userId || restoredUserId !== userId) return

    try {
      if (screen === 'session' && session && session.currentIndex < session.queue.length) {
        window.localStorage.setItem(sessionKey(userId), JSON.stringify(session))
      } else {
        window.localStorage.removeItem(sessionKey(userId))
      }
    } catch {
      setError('Could not save the revision session on this device.')
    }
  }, [restoredUserId, screen, session, user?._id])

  const startSession = async () => {
    setError('')
    setIsStarting(true)
    try {
      const response = await pickRevision({
        count,
        mode,
        patterns: selectedPatterns.length > 0 ? selectedPatterns : undefined,
      })
      if (response.questions.length === 0) {
        setError('No solved questions match these filters.')
        return
      }

      const queue: QueueQuestion[] = []
      let previousId: string | undefined
      for (let round = 1; round <= times; round += 1) {
        const roundQuestions = shuffle(response.questions)
        if (
          roundQuestions.length > 1
          && previousId === roundQuestions[0]?._id
        ) {
          ;[roundQuestions[0], roundQuestions[1]] = [roundQuestions[1], roundQuestions[0]]
        }
        for (const question of roundQuestions) {
          queue.push({ ...question, round })
        }
        previousId = roundQuestions.at(-1)?._id
      }
      setSession({ queue, currentIndex: 0, counted: 0, rounds: times, revisedQuestions: [] })
      setScreen('session')
    } catch (startError) {
      setError(getErrorMessage(startError, 'Could not start the revision session.'))
    } finally {
      setIsStarting(false)
    }
  }

  const finishSession = () => {
    setScreen('finished')
    if (user?._id) {
      try {
        window.localStorage.removeItem(sessionKey(user._id))
      } catch {
        setError('Could not clear the saved session from this device.')
      }
    }
  }

  const advance = (counted: boolean) => {
    if (!session) return
    const nextIndex = session.currentIndex + 1
    const nextSession = {
      ...session,
      currentIndex: nextIndex,
      counted: session.counted + (counted ? 1 : 0),
      revisedQuestions: counted && currentQuestion
        ? [...session.revisedQuestions, { title: currentQuestion.title, round: currentQuestion.round }]
        : session.revisedQuestions,
    }
    setSession(nextSession)
    if (nextIndex >= nextSession.queue.length) {
      setScreen('finished')
      if (user?._id) {
        try {
          window.localStorage.removeItem(sessionKey(user._id))
        } catch {
          setError('Could not clear the saved session from this device.')
        }
      }
    }
  }

  const confirmRevised = async () => {
    if (!currentQuestion) return
    setError('')
    try {
      await revised.mutateAsync(currentQuestion._id)
      advance(true)
    } catch (revisionError) {
      setError(getErrorMessage(revisionError, 'Could not mark this question as revised.'))
    }
  }

  const togglePattern = (pattern: string) => {
    setSelectedPatterns((previous) => (
      previous.includes(pattern)
        ? previous.filter((item) => item !== pattern)
        : [...previous, pattern]
    ))
  }

  if (sheetQuery.isLoading || !user?._id || restoredUserId !== user._id) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="h-48 animate-pulse rounded-3xl bg-raised" aria-label="Loading revision setup" />
      </main>
    )
  }

  if (sheetQuery.isError) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Toast message="Could not load solved pattern questions." variant="error" />
        <button type="button" onClick={() => void sheetQuery.refetch()} className="mt-4 min-h-11 rounded-lg bg-accent-solid px-4 py-2 font-semibold text-white">
          Try again
        </button>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-3 py-7 sm:px-6 sm:py-10">
      <Link to="/patterns" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-muted hover:text-accent">
        <ArrowLeft size={17} aria-hidden="true" /> Back to sheet
      </Link>

      {error && (
        <div className="mt-4">
          <Toast message={error} variant="error" onDismiss={() => setError('')} />
        </div>
      )}

      {screen === 'setup' && (
        <section className="mt-5 border-y border-border bg-surface py-5 sm:py-7">
          <h1 className="text-3xl tracking-tight text-ink">Revision session</h1>
          <p className="mt-2 text-sm text-muted">Choose solved questions to revisit. Your session saves on this device.</p>

          {solvedCount === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border p-5 text-center">
              <p className="font-semibold text-ink">You have 0 solved questions</p>
              <p className="mt-2 text-sm text-muted">Tick questions as solved on the pattern sheet before starting a revision session.</p>
              <Link to="/patterns" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-accent-solid px-4 py-2 text-sm font-semibold text-white">
                Go to pattern sheet
              </Link>
            </div>
          ) : (
            <>
              <p className="mt-5 border-l-2 border-accent bg-raised px-4 py-3 text-sm font-medium text-ink">
                You have {solvedCount} solved questions
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <NumberStepper id="revision-count" label="How many questions" value={count} min={1} max={200} onChange={setCount} />
                <NumberStepper id="revision-times" label="How many times each" value={times} min={1} max={10} onChange={setTimes} />
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-ink">Selection mode</p>
                <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label="Selection mode">
                  {(['smart', 'random'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setMode(option)}
                      aria-pressed={mode === option}
                      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold capitalize ${
                        mode === option
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border text-muted hover:bg-raised'
                      }`}
                    >
                      {option === 'random' &&                       <Shuffle size={16} aria-hidden="true" />}
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <fieldset className="mt-5">
                <legend className="text-sm font-semibold text-ink">Optional patterns</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sections.map((section) => {
                    const sectionSolved = solvedCountsByPattern.get(section.pattern) ?? 0
                    const selected = selectedPatterns.includes(section.pattern)
                    return (
                      <button
                        key={section.patternOrder}
                        type="button"
                        disabled={sectionSolved === 0}
                        onClick={() => togglePattern(section.pattern)}
                        aria-pressed={selected}
                        className={`min-h-11 max-w-full rounded-sm border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                          selected
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border text-muted hover:bg-raised'
                        }`}
                      >
                        {section.pattern} ({sectionSolved})
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <p className="mt-5 text-sm text-muted">
                This session will have <strong className="text-ink">{count * times} revisions</strong>
                {selectedPatterns.length > 0 && ' from the selected patterns'}.
              </p>
              <button
                type="button"
                onClick={() => void startSession()}
                disabled={isStarting || solvedCount === 0}
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-accent-solid bg-accent-solid px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-wait disabled:opacity-60"
              >
                {isStarting ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : null}
                {isStarting ? 'Building session…' : 'Start session'}
              </button>
            </>
          )}
        </section>
      )}

      {screen === 'session' && session && currentQuestion && (
        <section className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted">
              Question <span className="display-number text-xl text-highlight">{session.currentIndex + 1}</span> of {totalQuestions}
            </p>
            <button type="button" onClick={finishSession} className="min-h-11 rounded-md px-3 text-sm font-medium text-muted hover:bg-raised hover:text-ink">
              End session
            </button>
          </div>
          <div
            className="mt-3 h-1 overflow-hidden bg-raised"
            role="progressbar"
            aria-label="Revision session progress"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full bg-accent transition-[width]" style={{ width: `${progress}%` }} />
          </div>

          <article className="mt-5 border-y border-border bg-surface px-4 py-6 sm:px-8 sm:py-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="border-l-2 border-accent pl-2 text-sm font-medium text-ink">{currentQuestion.pattern}</span>
              {times > 1 && (
                <span className="text-xs text-muted">
                  Round {currentQuestion.round} of {session.rounds}
                </span>
              )}
            </div>
            <h1 className="mt-5 break-words font-serif text-3xl leading-tight text-ink">{currentQuestion.title}</h1>
            <a
              href={currentQuestion.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline"
            >
              Open problem <ExternalLink size={16} aria-hidden="true" />
            </a>
          </article>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <button
              type="button"
              onClick={() => void confirmRevised()}
              disabled={revised.isPending}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-accent-solid bg-accent-solid px-4 py-2.5 font-semibold text-white hover:bg-accent-hover disabled:cursor-wait disabled:opacity-60"
            >
              {revised.isPending ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
              I revised it
            </button>
            <button
              type="button"
              onClick={() => advance(false)}
              disabled={revised.isPending}
              className="min-h-11 rounded-md border border-transparent px-5 py-2.5 font-medium text-muted hover:bg-raised hover:text-ink disabled:opacity-50"
            >
              Skip
            </button>
          </div>
        </section>
      )}

      {screen === 'finished' && (
        <section className="mt-5 border-y border-border py-6">
          <h1 className="text-3xl text-ink">Session complete</h1>
          <p className="mt-2 text-sm text-muted">
            You counted <strong className="display-number text-xl text-ink">{session?.counted ?? 0}</strong> revisions.
          </p>
          {session && session.revisedQuestions.length > 0 && (
            <ul className="mt-5 max-w-xl divide-y divide-border border-y border-border">
              {session.revisedQuestions.map((revisedQuestion, index) => (
                <li key={`${revisedQuestion.round}-${index}`} className="py-2.5 text-left text-sm text-ink">
                  {revisedQuestion.title}
                  {session.rounds > 1 && <span className="ml-2 text-xs text-muted">Round {revisedQuestion.round}</span>}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setSession(null)
                setScreen('setup')
                setError('')
              }}
              className="min-h-11 rounded-md border border-accent-solid bg-accent-solid px-5 py-2 font-semibold text-white hover:bg-accent-hover"
            >
              New session
            </button>
            <Link to="/patterns" className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-5 py-2 font-medium text-ink hover:bg-raised">
              Back to sheet
            </Link>
          </div>
        </section>
      )}
    </main>
  )
}
