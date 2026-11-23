import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Bot, CalendarDays, Code2, Layers3 } from 'lucide-react'

const SCENE_DURATION = 6000

const featureLines = [
  {
    icon: Code2,
    title: 'Solve',
    text: 'problems in JavaScript, Java or C++ and run sample tests.',
  },
  {
    icon: Layers3,
    title: 'Follow',
    text: 'a curated pattern sheet and save your solved questions.',
  },
  {
    icon: CalendarDays,
    title: 'Revise',
    text: 'the questions you are least sure about, on your schedule.',
  },
  {
    icon: Bot,
    title: 'Ask',
    text: 'the AI tutor for hints and complexity feedback, without spoilers.',
  },
]

const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', updatePreference)
    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  return reducedMotion
}

const useSceneLoop = () => {
  const [scene, setScene] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isVisible, setIsVisible] = useState(() => !document.hidden)
  const reducedMotion = useReducedMotion()
  const elapsedRef = useRef(0)

  const goToScene = useCallback((nextScene: number) => {
    elapsedRef.current = 0
    setProgress(0)
    setScene(nextScene)
  }, [])

  useEffect(() => {
    const updateVisibility = () => setIsVisible(!document.hidden)
    document.addEventListener('visibilitychange', updateVisibility)
    return () => document.removeEventListener('visibilitychange', updateVisibility)
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      goToScene(0)
      return
    }

    let previousTime = Date.now()
    const interval = window.setInterval(() => {
      const currentTime = Date.now()
      if (!isPaused && isVisible) {
        elapsedRef.current += currentTime - previousTime
      }
      previousTime = currentTime

      if (elapsedRef.current >= SCENE_DURATION) {
        goToScene((scene + 1) % featureLines.length)
        return
      }
      setProgress(elapsedRef.current / SCENE_DURATION)
    }, 50)

    return () => window.clearInterval(interval)
  }, [goToScene, isPaused, isVisible, reducedMotion, scene])

  return { scene, progress, goToScene, isPaused, setIsPaused, reducedMotion }
}

const useTypewriter = (text: string, active: boolean, reducedMotion: boolean, delay = 40) => {
  const [typedText, setTypedText] = useState(reducedMotion ? text : '')

  useEffect(() => {
    if (!active && !reducedMotion) {
      setTypedText('')
      return
    }
    if (reducedMotion) {
      setTypedText(text)
      return
    }

    let count = 0
    setTypedText('')
    const interval = window.setInterval(() => {
      count += 1
      setTypedText(text.slice(0, count))
      if (count >= text.length) window.clearInterval(interval)
    }, delay)
    return () => window.clearInterval(interval)
  }, [active, delay, reducedMotion, text])

  return typedText
}

const WindowChrome = ({ title }: { title: string }) => (
  <div className="flex h-11 shrink-0 items-center gap-3 border-b border-border px-4">
    <div className="flex items-center gap-1.5" aria-hidden="true">
      <span className="size-2.5 rounded-full bg-muted/50" />
      <span className="size-2.5 rounded-full bg-muted/35" />
      <span className="size-2.5 rounded-full bg-muted/20" />
    </div>
    <span className="min-w-0 flex-1 truncate text-center text-xs text-muted">{title}</span>
    <span className="w-10" aria-hidden="true" />
  </div>
)

const codeText = `function twoSum(a,t){
  for(let i=0;i<a.length;i++)
    for(let j=i+1;j<a.length;j++)
      if(a[i]+a[j]===t)return[i,j]
}`

const keywords = new Set(['function', 'const', 'for', 'let', 'if', 'return', 'new'])

const SyntaxCode = ({ line }: { line: string }) => (
  <>
    {line.split(/(\bfunction\b|\bconst\b|\bfor\b|\blet\b|\bif\b|\breturn\b|\bnew\b|\bMap\b|\bundefined\b|\d+)/g).map((token, index) => {
      const className = keywords.has(token)
        ? 'text-accent'
        : token === 'Map' || token === 'undefined'
          ? 'text-highlight'
          : /^\d+$/.test(token)
            ? 'text-accent'
            : undefined
      return <span key={`${token}-${index}`} className={className}>{token}</span>
    })}
  </>
)

const useRunSequence = (active: boolean, reducedMotion: boolean, typingComplete: boolean) => {
  const [phase, setPhase] = useState(reducedMotion ? 'accepted' : 'typing')
  const [runtime, setRuntime] = useState(0)

  useEffect(() => {
    if (!active) {
      setPhase('typing')
      setRuntime(0)
      return
    }
    if (reducedMotion) {
      setPhase('accepted')
      setRuntime(52)
      return
    }

    setRuntime(0)
    if (!typingComplete) {
      setPhase('typing')
      return
    }

    setPhase('running')
    const finishRun = window.setTimeout(() => setPhase('accepted'), 650)
    return () => window.clearTimeout(finishRun)
  }, [active, reducedMotion, typingComplete])

  useEffect(() => {
    if (phase !== 'accepted' || reducedMotion) return
    let value = 0
    const interval = window.setInterval(() => {
      value = Math.min(52, value + 4)
      setRuntime(value)
      if (value === 52) window.clearInterval(interval)
    }, 28)
    return () => window.clearInterval(interval)
  }, [phase, reducedMotion])

  return { phase, runtime }
}

const SolveScene = ({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) => {
  const typedCode = useTypewriter(codeText, active, reducedMotion, 40)
  const { phase, runtime } = useRunSequence(active, reducedMotion, reducedMotion || typedCode === codeText)
  const lines = typedCode.split('\n')
  const isRunning = phase === 'running'
  const isAccepted = phase === 'accepted'

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex h-full items-center gap-4 text-xs">
          <span className="flex h-full items-center border-b-2 border-accent text-ink">JavaScript</span>
          <span className="text-muted">Java</span>
          <span className="text-muted">C++</span>
        </div>
        <button
          type="button"
          aria-pressed={isRunning || isAccepted}
          className={`min-h-11 rounded-md border px-3 text-xs font-medium text-white transition-colors ${isRunning || isAccepted ? 'translate-y-px border-accent-hover bg-accent-hover' : 'border-accent-solid bg-accent-solid'}`}
        >
          Run code
        </button>
      </div>
      {isRunning && <div className="auth-run-progress h-0.5 shrink-0 bg-accent" aria-hidden="true" />}
      <div className="relative grid min-h-0 flex-1 grid-cols-[2rem_minmax(0,1fr)] gap-3 overflow-hidden px-3 py-3 font-mono text-sm leading-6">
        <div className="select-none text-right text-muted" aria-hidden="true">
          {Array.from({ length: Math.max(6, lines.length) }, (_, index) => <div key={index}>{index + 1}</div>)}
        </div>
        <pre className="m-0 overflow-hidden whitespace-pre text-ink">
          {lines.map((line, index) => (
            <span className="block min-h-6" key={index}>
              <SyntaxCode line={line} />
              {index === lines.length - 1 && !isAccepted && <span className="auth-cursor" aria-hidden="true" />}
            </span>
          ))}
        </pre>
        {isRunning && <div className="auth-run-progress absolute inset-x-0 bottom-0 h-0.5 bg-accent" aria-hidden="true" />}
      </div>
      <div className="shrink-0 border-t border-border px-4 py-2.5">
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
          <span>Sample tests</span>
          {isAccepted && <span className="font-semibold text-success">Accepted, 3 of 3 test cases</span>}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            ['[2, 7, 11, 15]', '[0, 1]'],
            ['[3, 2, 4]', '[1, 2]'],
            ['[3, 3]', '[0, 1]'],
          ].map(([input, output], index) => (
            <div
              key={input}
              className={`auth-test-result min-w-0 truncate rounded border border-border bg-raised px-2 py-1 text-[11px] text-muted ${isRunning || isAccepted ? 'is-visible' : ''}`}
              style={{ '--test-delay': `${index * 120}ms` } as CSSProperties}
            >
              <span className="font-mono">{input}</span>
              <span className="mx-1 text-muted/70">→</span>
              <span className="font-mono text-success">{output}</span>
            </div>
          ))}
        </div>
        {isAccepted && <div className="mt-1.5 text-right font-mono text-xs text-muted">{runtime} ms runtime</div>}
      </div>
    </div>
  )
}

const patternRows = [
  { name: 'Sliding Window', solved: 9 },
  { name: 'Two Pointers', solved: 7 },
  { name: 'Binary Search', solved: 8 },
  { name: 'Dynamic Programming', solved: 6 },
]

const PatternScene = () => {
  const [questionCount, setQuestionCount] = useState(0)

  useEffect(() => {
    let count = 0
    const interval = window.setInterval(() => {
      count = Math.min(188, count + 8)
      setQuestionCount(count)
      if (count === 188) window.clearInterval(interval)
    }, 28)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-end justify-between border-b border-border pb-4">
        <div>
          <p className="text-xs font-medium text-muted">DSA Pattern Sheet</p>
          <p className="mt-1 font-serif text-2xl text-ink">Build a stronger base</p>
        </div>
        <p className="text-right text-xs text-muted"><span className="font-mono text-base text-ink">{questionCount}</span> questions<br />16 patterns</p>
      </div>
      <div className="mt-4 flex flex-1 flex-col justify-center gap-4">
        {patternRows.map((row, rowIndex) => (
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3" key={row.name}>
            <span className="truncate text-sm font-medium text-ink">{row.name}</span>
            <div className="flex gap-1.5" aria-label={`${row.solved} solved questions in ${row.name}`}>
              {Array.from({ length: 12 }, (_, index) => {
                const flagged = rowIndex === 2 && index === 8
                const solved = index < row.solved
                return (
                  <span
                    key={index}
                    className={`auth-pattern-square ${solved ? 'is-solved' : ''} ${flagged ? 'is-flagged' : ''}`}
                    style={{ '--square-delay': `${rowIndex * 90 + index * 45}ms` } as CSSProperties}
                    aria-hidden="true"
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted">
        <span className="size-2.5 rounded-sm bg-accent" aria-hidden="true" />
        Solved
        <span className="ml-3 size-2.5 rounded-sm border border-highlight" aria-hidden="true" />
        Flagged for revision
      </div>
    </div>
  )
}

const revisionCards = [
  { pattern: 'Sliding Window', title: 'Longest substring without repeats', round: 'Round 2 of 3', progress: 66 },
  { pattern: 'Two Pointers', title: 'Container with most water', round: 'Round 1 of 3', progress: 33 },
]

const RevisionScene = () => {
  const [cardIndex, setCardIndex] = useState(0)
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    const press = window.setTimeout(() => setPressed(true), 1700)
    const swap = window.setTimeout(() => {
      setCardIndex((current) => (current + 1) % revisionCards.length)
      setPressed(false)
    }, 2250)
    return () => {
      window.clearTimeout(press)
      window.clearTimeout(swap)
    }
  }, [cardIndex])

  const card = revisionCards[cardIndex]

  return (
    <div className="flex h-full flex-col justify-center p-6 sm:p-8">
      <p className="text-xs font-medium text-muted">Today’s revision</p>
      <div key={card.title} className="auth-revision-card mt-3 raised-surface rounded-xl bg-surface p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-highlight/50 bg-highlight/10 px-2.5 py-1 text-xs font-medium text-highlight">{card.pattern}</span>
          <span className="text-xs text-muted">{card.round}</span>
        </div>
        <h3 className="mt-5 max-w-[28ch] font-serif text-xl leading-snug text-ink">{card.title}</h3>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-raised">
          <span className="auth-revision-progress block h-full rounded-full bg-accent" style={{ '--progress-end': `${card.progress}%` } as CSSProperties} />
        </div>
        <div className="mt-5 flex justify-end">
          <button type="button" className={`min-h-11 rounded-lg border border-accent-solid bg-accent-solid px-4 text-sm font-medium text-white transition-transform ${pressed ? 'translate-y-px' : ''}`}>
            I revised it
          </button>
        </div>
      </div>
    </div>
  )
}

const tutorReply = 'Because each loop runs across the array. For every item, you scan up to n more items: n × n operations.'

const TutorScene = () => {
  const [showQuestion, setShowQuestion] = useState(false)
  const [showReply, setShowReply] = useState(false)
  const reply = useTypewriter(tutorReply, showReply, false, 36)

  useEffect(() => {
    const questionTimer = window.setTimeout(() => setShowQuestion(true), 250)
    const replyTimer = window.setTimeout(() => setShowReply(true), 850)
    return () => {
      window.clearTimeout(questionTimer)
      window.clearTimeout(replyTimer)
    }
  }, [])

  return (
    <div className="flex h-full flex-col gap-5 p-5 sm:p-6">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Bot size={16} className="text-accent" aria-hidden="true" />
        <span className="text-sm font-medium text-ink">AI tutor</span>
        <span className="ml-auto text-xs text-muted">Hints, not spoilers</span>
      </div>
      <div className="flex flex-1 flex-col gap-4 pt-2">
        {showQuestion && <div className="auth-chat-in ml-auto max-w-[82%] rounded-xl border border-border bg-raised px-4 py-3 text-sm text-ink">Why is my loop O(n²)?</div>}
        {showReply
          ? (
            <div className="auth-chat-in mr-auto max-w-[90%] rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-6 text-ink">
              <p>{reply}<span className="auth-cursor" aria-hidden="true" /></p>
              <pre className="mt-3 overflow-hidden rounded-md border border-border bg-page p-3 text-sm text-accent">for each item → scan n items</pre>
            </div>
          )
          : <div className="mr-auto flex h-10 items-center gap-1.5 rounded-xl border border-border bg-surface px-4" aria-label="Tutor is typing">
              <span className="auth-typing-dot" />
              <span className="auth-typing-dot" />
              <span className="auth-typing-dot" />
            </div>}
      </div>
    </div>
  )
}

const featureCaption = (index: number) => (
  [
    'Write code in JavaScript, Java or C++. Run it on sample tests, then submit it against hidden ones.',
    'A curated pattern sheet. Tick what you solve and it is saved to your account.',
    'Choose how many solved questions to revise and how many times. We pick what you are least sure about.',
    'Get hints and complexity feedback for the problem you are working on, without spoilers.',
  ][index]
)

export const AuthShowcase = () => {
  const { scene, progress, goToScene, isPaused, setIsPaused, reducedMotion } = useSceneLoop()
  const sceneTitles = ['Solve problems', 'Follow the patterns', 'Revise on a schedule', 'Ask the AI tutor']

  return (
    <>
      <aside
        className="auth-showcase showcase-grid hidden min-h-[620px] min-w-0 flex-col justify-center gap-5 overflow-hidden rounded-2xl border border-border bg-surface p-5 sm:p-7 md:flex lg:p-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsPaused(false)
        }}
        aria-label="Interactive tour of CodeCompact"
      >
        <div className="auth-window raised-surface relative overflow-hidden rounded-xl bg-page">
          <WindowChrome title={sceneTitles[reducedMotion ? 0 : scene]} />
          <div className="h-[calc(100%-2.75rem)]">
            {reducedMotion || scene === 0
              ? <SolveScene active={reducedMotion || scene === 0} reducedMotion={reducedMotion} />
              : scene === 1
                ? <PatternScene />
                : scene === 2
                  ? <RevisionScene />
                  : <TutorScene />}
          </div>
        </div>

        {reducedMotion ? (
          <ul className="grid gap-2.5" aria-label="What you can do with CodeCompact">
            {featureLines.map(({ icon: Icon, title, text }) => (
              <li className="flex items-center gap-3 text-base leading-[1.65] text-muted" key={title}>
                <Icon size={16} className="shrink-0 text-accent" aria-hidden="true" />
                <span><strong className="font-semibold text-ink">{title}</strong> {text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-2" role="group" aria-label="Showcase scenes">
              {sceneTitles.map((title, index) => (
                <button
                  type="button"
                  key={title}
                  aria-label={`Show scene: ${title}`}
                  aria-current={scene === index ? 'step' : undefined}
                  className="auth-scene-progress group rounded-sm px-0.5"
                  onClick={() => goToScene(index)}
                >
                  <span className="block h-1 overflow-hidden rounded-full bg-border">
                    <span
                      className="block h-full bg-highlight transition-none"
                      style={{
                        width: scene === index ? `${progress * 100}%` : scene > index ? '100%' : '0%',
                        transition: 'width 50ms linear',
                      }}
                    />
                  </span>
                  <span className="sr-only">{title}</span>
                </button>
              ))}
            </div>
            <p className="min-h-[3.3rem] max-w-[68ch] text-base leading-[1.65] text-muted" aria-live="polite">{featureCaption(scene)}</p>
            <span className="sr-only">{isPaused ? 'Showcase paused' : ''}</span>
          </>
        )}
      </aside>

      <div className="grid gap-3 md:hidden" aria-label="What you can do with CodeCompact">
        {featureLines.map(({ icon: Icon, title, text }) => (
          <div className="flex items-start gap-3 text-base leading-[1.65] text-muted" key={title}>
            <Icon size={17} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
            <p><strong className="font-semibold text-ink">{title}</strong> {text}</p>
          </div>
        ))}
      </div>
    </>
  )
}
