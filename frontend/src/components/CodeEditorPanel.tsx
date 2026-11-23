import { useEffect, useRef, useState } from 'react'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import { Minus, Play, Plus, RotateCcw, Send } from 'lucide-react'
import type { ApiLanguage, EditorLanguage, Problem, RunResult, SubmitResult } from '../types'
import { SubmissionResult } from './SubmissionResult'
import { TestcaseResults } from './TestcaseResults'
import { ThemeToggle } from './ThemeToggle'
import { Kbd } from './ui'
import { defineCodeCompactThemes } from '../lib/monacoThemes'

interface EditorErrorBoundaryState {
  hasError: boolean
}

class EditorErrorBoundary extends Component<{ children: ReactNode }, EditorErrorBoundaryState> {
  state: EditorErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): EditorErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Monaco editor failed to load', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 p-4 text-sm text-muted">
          <p>The editor could not load. Reload the page.</p>
          <button type="button" onClick={() => window.location.reload()} className="rounded-md border border-border px-3 py-1.5 text-ink hover:bg-raised">
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

type RightTab = 'Testcase' | 'Result'
const languages: Array<{ label: EditorLanguage; api: ApiLanguage; monaco: string }> = [
  { label: 'JavaScript', api: 'javascript', monaco: 'javascript' },
  { label: 'Java', api: 'java', monaco: 'java' },
  { label: 'C++', api: 'cpp', monaco: 'cpp' },
]

interface CodeEditorPanelProps {
  problem: Problem
  isRunning: boolean
  isSubmitting: boolean
  runResult?: RunResult
  submitResult?: SubmitResult
  errorMessage?: string
  onRun: (code: string, language: ApiLanguage) => void
  onSubmit: (code: string, language: ApiLanguage) => void
}

const getStarterCode = (problem: Problem, language: EditorLanguage) => (
  problem.startCode?.find((starter) => starter.language === language)?.initialCode ?? ''
)

const getDraftKey = (problemId: string, language: EditorLanguage) => `codecompact:draft:${problemId}:${language}`

const getSavedCode = (problem: Problem, language: EditorLanguage) => {
  const starterCode = getStarterCode(problem, language)
  try {
    return window.localStorage.getItem(getDraftKey(problem._id, language)) ?? starterCode
  } catch {
    return starterCode
  }
}

export const CodeEditorPanel = ({
  problem,
  isRunning,
  isSubmitting,
  runResult,
  submitResult,
  errorMessage,
  onRun,
  onSubmit,
}: CodeEditorPanelProps) => {
  const [language, setLanguage] = useState<EditorLanguage>('JavaScript')
  const [code, setCode] = useState(() => getSavedCode(problem, 'JavaScript'))
  const [activeTab, setActiveTab] = useState<RightTab>('Testcase')
  const [fontSize, setFontSize] = useState(15)
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const codeRef = useRef(code)
  const languageRef = useRef(language)
  const problemIdRef = useRef(problem._id)
  const runningRef = useRef(isRunning || isSubmitting)
  const onRunRef = useRef(onRun)
  const onSubmitRef = useRef(onSubmit)

  useEffect(() => {
    if (problemIdRef.current === problem._id) return
    problemIdRef.current = problem._id
    setCode(getSavedCode(problem, language))
  }, [language, problem, problem._id])

  useEffect(() => {
    codeRef.current = code
    try {
      window.localStorage.setItem(getDraftKey(problemIdRef.current, language), code)
    } catch {
      // Keep editing available when browser storage is unavailable.
    }
  }, [code, language, problem._id])

  useEffect(() => {
    languageRef.current = language
  }, [language])

  useEffect(() => {
    runningRef.current = isRunning || isSubmitting
  }, [isRunning, isSubmitting])

  useEffect(() => {
    onRunRef.current = onRun
    onSubmitRef.current = onSubmit
  }, [onRun, onSubmit])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const chooseLanguage = (nextLanguage: EditorLanguage) => {
    if (nextLanguage === language) return
    languageRef.current = nextLanguage
    const nextCode = getSavedCode(problem, nextLanguage)
    codeRef.current = nextCode
    setLanguage(nextLanguage)
    setCode(nextCode)
  }

  const runCurrentCode = () => {
    if (!runningRef.current) {
      setActiveTab('Testcase')
      onRunRef.current(codeRef.current, languages.find((item) => item.label === languageRef.current)!.api)
    }
  }

  const submitCurrentCode = () => {
    if (!runningRef.current) {
      setActiveTab('Result')
      onSubmitRef.current(codeRef.current, languages.find((item) => item.label === languageRef.current)!.api)
    }
  }

  const onEditorMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, runCurrentCode)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, submitCurrentCode)
  }

  const resetCode = () => {
    const starter = getStarterCode(problem, language)
    setCode(starter)
    try {
      window.localStorage.removeItem(getDraftKey(problem._id, language))
    } catch {
      // The in-memory reset still succeeds.
    }
  }

  const selectedLanguage = languages.find((item) => item.label === language)!
  const busy = isRunning || isSubmitting

  return (
    <section className="flex h-[min(78vh,820px)] min-h-[620px] flex-col overflow-hidden border border-border bg-surface lg:h-full lg:min-h-0">
      <header className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <label htmlFor="editor-language" className="sr-only">Programming language</label>
          <select
            id="editor-language"
            value={language}
            onChange={(event) => chooseLanguage(event.target.value as EditorLanguage)}
            className="min-h-11 max-w-32 rounded-md border border-border bg-raised px-2 text-sm text-ink outline-none focus-visible:border-accent"
          >
            {languages.map(({ label }) => <option key={label} value={label}>{label}</option>)}
          </select>
          <button type="button" onClick={resetCode} className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-xs text-muted hover:bg-raised hover:text-ink" title="Reset to starter code">
            <RotateCcw size={16} aria-hidden="true" /> Reset
          </button>
          <span className="hidden h-5 w-px bg-border sm:block" aria-hidden="true" />
          <button type="button" onClick={() => setFontSize((size) => Math.max(13, size - 1))} aria-label="Decrease editor font size" className="grid size-11 place-items-center rounded-md text-muted hover:bg-raised hover:text-ink">
            <Minus size={16} aria-hidden="true" />
          </button>
          <span className="hidden min-w-8 text-center font-mono text-xs text-muted sm:inline">{fontSize}</span>
          <button type="button" onClick={() => setFontSize((size) => Math.min(20, size + 1))} aria-label="Increase editor font size" className="grid size-11 place-items-center rounded-md text-muted hover:bg-raised hover:text-ink">
            <Plus size={16} aria-hidden="true" />
          </button>
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={runCurrentCode}
            disabled={busy}
            aria-keyshortcuts="Control+Enter"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border bg-raised px-2.5 text-xs font-semibold text-ink hover:bg-page disabled:cursor-wait disabled:opacity-50 sm:px-3 sm:text-sm"
          >
            <Play size={16} aria-hidden="true" />{isRunning ? 'Running…' : 'Run code'}
            <Kbd><span className="hidden xl:inline">Ctrl+</span>↵</Kbd>
          </button>
          <button
            type="button"
            onClick={submitCurrentCode}
            disabled={busy}
            aria-keyshortcuts="Control+Shift+Enter"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-accent-solid bg-accent-solid px-2.5 text-xs font-semibold text-white hover:bg-accent-hover disabled:cursor-wait disabled:opacity-50 sm:px-3 sm:text-sm"
          >
            <Send size={16} aria-hidden="true" />{isSubmitting ? 'Submitting…' : 'Submit solution'}
            <Kbd><span className="hidden xl:inline">Ctrl+⇧+</span>↵</Kbd>
          </button>
        </div>
      </header>

      <div className={`h-0.5 shrink-0 overflow-hidden ${busy ? 'bg-accent/15' : 'bg-transparent'}`}>
        {busy && <div className="execution-progress h-full w-1/3 bg-accent" />}
      </div>

      {errorMessage && <p role="alert" className="border-b border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">{errorMessage}</p>}

      <div className="min-h-[280px] flex-1">
        <EditorErrorBoundary>
          <Editor
            height="100%"
            language={selectedLanguage.monaco}
            value={code}
            onChange={(value) => {
              const nextCode = value ?? ''
              codeRef.current = nextCode
              setCode(nextCode)
            }}
            beforeMount={defineCodeCompactThemes}
            onMount={onEditorMount}
            theme={isDark ? 'cc-dark' : 'cc-light'}
            options={{
              automaticLayout: true,
              minimap: { enabled: false },
              fontSize,
              lineHeight: Math.round(fontSize * 1.6),
              fontFamily: '"IBM Plex Mono", monospace',
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
              tabSize: 2,
              wordWrap: 'on',
              ariaLabel: 'Source code editor',
            }}
          />
        </EditorErrorBoundary>
      </div>

      <div className="flex h-[220px] shrink-0 flex-col border-t border-border bg-page sm:h-[240px]">
        <div className="flex h-11 shrink-0 items-stretch border-b border-border px-2" role="tablist" aria-label="Execution results">
          {(['Testcase', 'Result'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-3 text-xs font-medium transition-colors ${
                activeTab === tab ? 'border-accent text-ink' : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          {activeTab === 'Testcase'
            ? <TestcaseResults problem={problem} result={runResult} />
            : submitResult
              ? <SubmissionResult result={submitResult} />
              : <p className="text-sm text-muted">Submit your code to see the result.</p>}
        </div>
      </div>
    </section>
  )
}
