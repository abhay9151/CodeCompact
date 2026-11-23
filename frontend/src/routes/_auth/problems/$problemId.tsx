import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, BookOpen, Bot, Code2, FileText, History, MessageSquare } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Editorial } from '../../../components/Editorial'
import { ChatAi } from '../../../components/ChatAi'
import { CodeEditorPanel } from '../../../components/CodeEditorPanel'
import { DifficultyBadge } from '../../../components/DifficultyBadge'
import { Spinner } from '../../../components/Spinner'
import { SubmissionHistory } from '../../../components/SubmissionHistory'
import { getProblem } from '../../../api/problems'
import { getSubmissions, runSubmission, submitSolution } from '../../../api/submissions'
import { getErrorMessage } from '../../../lib/errors'
import type { ApiLanguage, Problem, Submission, SubmitResult } from '../../../types'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'

export const Route = createFileRoute('/_auth/problems/$problemId')({
  component: ProblemWorkspace,
})

type LeftTab = 'Description' | 'Editorial' | 'Solutions' | 'Submissions' | 'AI Tutor'

const leftTabs: Array<{ label: LeftTab; icon: typeof BookOpen }> = [
  { label: 'Description', icon: BookOpen },
  { label: 'Editorial', icon: FileText },
  { label: 'Solutions', icon: Code2 },
  { label: 'Submissions', icon: History },
  { label: 'AI Tutor', icon: Bot },
]

function ProblemWorkspace() {
  const { problemId } = Route.useParams()
  useDocumentTitle('Problem workspace | CodeCompact')
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<LeftTab>('Description')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [submitResult, setSubmitResult] = useState<SubmitResult>()
  const [splitPercent, setSplitPercent] = useState(50)
  const splitterDragging = useRef(false)
  const splitContainer = useRef<HTMLDivElement>(null)

  const problemQuery = useQuery({
    queryKey: ['problems', problemId],
    queryFn: () => getProblem(problemId),
  })
  const submissionsQuery = useQuery({
    queryKey: ['submissions', problemId],
    queryFn: () => getSubmissions(problemId),
    enabled: activeTab === 'Submissions',
  })

  const runMutation = useMutation({
    mutationFn: ({ code, language }: { code: string; language: ApiLanguage }) => runSubmission(problemId, code, language),
  })
  const submitMutation = useMutation({
    mutationFn: ({ code, language }: { code: string; language: ApiLanguage }) => submitSolution(problemId, code, language),
    onSuccess: async (result) => {
      setSubmitResult(result)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['problems', 'solved'] }),
        queryClient.invalidateQueries({ queryKey: ['submissions', problemId] }),
      ])
    },
  })

  const moveSplitter = (event: PointerEvent<HTMLDivElement>) => {
    if (!splitterDragging.current || !splitContainer.current) return
    const bounds = splitContainer.current.getBoundingClientRect()
    const nextPercent = ((event.clientX - bounds.left) / bounds.width) * 100
    setSplitPercent(Math.min(70, Math.max(30, nextPercent)))
  }
  const stopSplitter = () => {
    splitterDragging.current = false
  }

  if (problemQuery.isLoading) {
    return <main className="mx-auto flex max-w-7xl justify-center px-4 py-24"><Spinner label="Loading problem" /></main>
  }
  if (problemQuery.isError || !problemQuery.data) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Link to="/problems" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline"><ArrowLeft size={16} aria-hidden="true" />All problems</Link>
        <p role="alert" className="mt-6 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">Could not load this problem.</p>
      </main>
    )
  }

  const problem = problemQuery.data

  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-col px-3 py-3 sm:px-5 lg:h-[calc(100vh-3rem)] lg:overflow-hidden lg:px-6">
      <header className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="min-w-0">
          <Link to="/problems" className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-accent"><ArrowLeft size={16} aria-hidden="true" />All problems</Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl text-ink sm:text-2xl">{problem.title}</h1>
            <DifficultyBadge difficulty={problem.difficulty} />
            <span className="text-xs text-muted">{problem.tags}</span>
          </div>
        </div>
        <p className="hidden text-xs text-muted xl:block">Drafts save on this device.</p>
      </header>

      <div
        ref={splitContainer}
        onPointerMove={moveSplitter}
        onPointerUp={stopSplitter}
        onPointerCancel={stopSplitter}
        style={{ '--workspace-split': `${splitPercent}%` } as CSSProperties}
        className="workspace-split grid min-h-0 flex-1 grid-cols-1 items-start gap-4 lg:items-stretch lg:gap-0"
      >
        <section className="flex min-h-[480px] min-w-0 flex-col overflow-hidden border border-border bg-surface lg:min-h-0">
          <div role="tablist" aria-label="Problem information" className="flex shrink-0 overflow-x-auto border-b border-border px-2">
            {leftTabs.map(({ label, icon: Icon }) => (
              <button key={label} type="button" role="tab" aria-selected={activeTab === label} onClick={() => setActiveTab(label)} className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 border-b-2 px-3 text-sm font-medium transition-colors sm:px-3.5 ${activeTab === label ? 'border-accent text-ink' : 'border-transparent text-muted hover:text-ink'}`}>
                <Icon size={16} aria-hidden="true" />{label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            {activeTab === 'Description' && <ProblemDescription problem={problem} />}
            {activeTab === 'Editorial' && <Editorial problem={problem} />}
            {activeTab === 'Solutions' && <ReferenceSolutions problem={problem} />}
            {activeTab === 'Submissions' && (
              <SubmissionHistory
                submissions={submissionsQuery.data ?? []}
                isLoading={submissionsQuery.isLoading}
                isError={submissionsQuery.isError}
                selected={selectedSubmission}
                onSelect={setSelectedSubmission}
              />
            )}
            {activeTab === 'AI Tutor' && <ChatAi key={problem._id} problem={problem} />}
          </div>
        </section>

        <div
          role="separator"
          aria-label="Resize problem and editor panes"
          aria-orientation="vertical"
          aria-valuemin={30}
          aria-valuemax={70}
          aria-valuenow={Math.round(splitPercent)}
          tabIndex={0}
          onPointerDown={(event) => {
            splitterDragging.current = true
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') setSplitPercent((value) => Math.max(30, value - 2))
            if (event.key === 'ArrowRight') setSplitPercent((value) => Math.min(70, value + 2))
          }}
          className="hidden cursor-col-resize touch-none bg-border transition-colors hover:bg-accent focus-visible:bg-accent lg:block"
        />
        <div className="min-w-0 lg:min-h-0">
          <CodeEditorPanel
            problem={problem}
            isRunning={runMutation.isPending}
            isSubmitting={submitMutation.isPending}
            runResult={runMutation.data}
            submitResult={submitResult}
            errorMessage={runMutation.isError
              ? getErrorMessage(runMutation.error, 'Run request failed.')
              : submitMutation.isError
                ? getErrorMessage(submitMutation.error, 'Submit request failed.')
                : undefined}
            onRun={(code, language) => { setSubmitResult(undefined); runMutation.mutate({ code, language }) }}
            onSubmit={(code, language) => { setSubmitResult(undefined); submitMutation.mutate({ code, language }) }}
          />
        </div>
      </div>
    </main>
  )
}

const ProblemDescription = ({ problem }: { problem: Problem }) => (
  <article className="mx-auto w-full max-w-[70ch]">
    <div className="prose max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h2 className="mb-4 mt-0 font-serif text-xl font-semibold text-ink">{children}</h2>,
          h2: ({ children }) => <h3 className="mb-3 mt-6 font-serif text-lg font-semibold text-ink">{children}</h3>,
          h3: ({ children }) => <h4 className="mb-2 mt-5 text-base font-semibold text-ink">{children}</h4>,
          p: ({ children }) => <p className="my-3 whitespace-pre-wrap text-sm leading-[1.65] text-ink">{children}</p>,
          ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-6 text-sm leading-6 text-ink">{children}</ul>,
          ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-6 text-sm leading-6 text-ink">{children}</ol>,
          code: ({ children, className }) => className
            ? <code className={className}>{children}</code>
            : <code className="rounded-sm bg-raised px-1 py-0.5 font-mono text-[0.9em] text-accent">{children}</code>,
          pre: ({ children }) => <pre className="my-4 overflow-x-auto border-l-2 border-accent bg-raised p-4 font-mono text-sm leading-6 text-ink">{children}</pre>,
          blockquote: ({ children }) => <blockquote className="my-4 border-l-2 border-accent pl-4 text-muted">{children}</blockquote>,
        }}
      >
        {problem.description ?? 'No description is available for this problem.'}
      </ReactMarkdown>
    </div>

    <section className="mt-8">
      <h2 className="mb-4 font-serif text-lg font-semibold text-ink">Examples</h2>
      <div className="space-y-3">
        {(problem.visibleTestCases ?? []).map((testCase, index) => (
          <article key={`${testCase.input}-${index}`} className="border-l-2 border-accent bg-raised p-4">
            <h3 className="mb-3 text-sm font-semibold text-ink">Example {index + 1}</h3>
            <DescriptionCode label="Input" value={testCase.input} />
            <DescriptionCode label="Output" value={testCase.output} />
            {testCase.explanation && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted"><strong className="font-medium text-ink">Explanation: </strong>{testCase.explanation}</p>}
          </article>
        ))}
      </div>
    </section>
  </article>
)

const DescriptionCode = ({ label, value }: { label: string; value: string }) => (
  <div className="mt-2">
    <p className="mb-1 text-xs font-medium text-muted">{label}</p>
    <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-surface px-3 py-2 font-mono text-sm leading-6 text-ink">{value}</pre>
  </div>
)

const ReferenceSolutions = ({ problem }: { problem: Problem }) => (
  <section>
    <h2 className="mb-4 text-lg font-semibold text-ink">Reference solutions</h2>
    {problem.referenceSolution?.length ? (
      <div className="space-y-4">
        {problem.referenceSolution.map((solution) => (
          <article key={solution.language} className="overflow-hidden rounded-xl border border-border">
            <h3 className="border-b border-border bg-raised px-4 py-2.5 text-xs font-semibold text-ink">{solution.language}</h3>
            <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap bg-surface p-4 font-mono text-sm leading-6 text-ink"><code>{solution.completeCode}</code></pre>
          </article>
        ))}
      </div>
    ) : (
      <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center">
        <MessageSquare size={24} className="mx-auto text-muted" aria-hidden="true" />
        <p className="mt-3 font-medium text-ink">Solve this problem to unlock solutions</p>
      </div>
    )}
  </section>
)
