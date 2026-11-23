import { useEffect } from 'react'
import { Check, Clock3, X } from 'lucide-react'
import type { Submission } from '../types'
import { formatMemory, formatRuntime } from '../lib/format'

interface SubmissionHistoryProps {
  submissions: Submission[]
  isLoading: boolean
  isError?: boolean
  selected: Submission | null
  onSelect: (submission: Submission | null) => void
}

const statusLabel: Record<Submission['status'], string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  wrong_answer: 'Wrong answer',
  time_limit: 'Time limit',
  compile_error: 'Compile error',
  runtime_error: 'Runtime error',
}

const relativeTime = (date?: string) => {
  if (!date) return '—'
  const elapsed = Date.now() - new Date(date).getTime()
  if (!Number.isFinite(elapsed)) return '—'
  const minutes = Math.floor(elapsed / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export const SubmissionHistory = ({ submissions, isLoading, isError = false, selected, onSelect }: SubmissionHistoryProps) => {
  useEffect(() => {
    if (!selected) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onSelect(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onSelect, selected])

  return (
    <>
      {isLoading ? (
        <p className="text-sm text-muted">Loading submissions…</p>
      ) : isError ? (
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">Could not load submissions.</p>
      ) : submissions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
          <p className="font-medium text-ink">No submissions yet</p>
          <p className="mt-1 text-sm text-muted">Your attempts will show up here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-raised text-xs text-muted">
              <tr><th className="px-4 py-3">Status</th><th className="px-4 py-3">Language</th><th className="px-4 py-3">Runtime</th><th className="px-4 py-3">Memory</th><th className="px-4 py-3">Submitted</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {submissions.map((submission) => (
                <tr key={submission._id} className="h-[52px] cursor-pointer bg-surface hover:bg-raised" onClick={() => onSelect(submission)}>
                  <td className="px-4 py-3"><StatusText status={submission.status} /></td>
                  <td className="px-4 py-3 capitalize text-ink">{submission.language === 'cpp' ? 'C++' : submission.language}</td>
                  <td className="px-4 py-3 tabular-nums text-muted">{formatRuntime(submission.runtimeMs)}</td>
                  <td className="px-4 py-3 tabular-nums text-muted">{formatMemory(submission.memory)}</td>
                  <td className="px-4 py-3 text-muted">{relativeTime(submission.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-page/80 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) onSelect(null)
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="submission-code-title" className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface">
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 id="submission-code-title" className="font-semibold text-ink">Submission code</h2>
                <p className="mt-1 flex items-center gap-2 text-xs text-muted">
                  <StatusText status={selected.status} />
                  <span>·</span><span className="capitalize">{selected.language === 'cpp' ? 'C++' : selected.language}</span>
                  <span>·</span><span className="tabular-nums">{formatRuntime(selected.runtimeMs)}</span>
                  <span>·</span><span className="tabular-nums">{formatMemory(selected.memory)}</span>
                  <span>·</span><Clock3 size={13} aria-hidden="true" />{relativeTime(selected.createdAt)}
                </p>
              </div>
              <button type="button" onClick={() => onSelect(null)} aria-label="Close submission code" className="grid size-11 place-items-center rounded-lg text-muted hover:bg-raised"><X size={18} aria-hidden="true" /></button>
            </header>
            <pre className="max-h-[calc(85vh-5rem)] overflow-auto whitespace-pre-wrap p-5 font-mono text-sm leading-6 text-ink"><code>{selected.code}</code></pre>
          </section>
        </div>
      )}
    </>
  )
}

const StatusText = ({ status }: { status: Submission['status'] }) => (
  <span className={`inline-flex items-center gap-1.5 font-medium ${status === 'accepted' ? 'text-success' : status === 'pending' ? 'text-muted' : 'text-danger'}`}>
    {status === 'accepted' ? <Check size={14} aria-hidden="true" /> : <X size={14} aria-hidden="true" />}
    {statusLabel[status]}
  </span>
)
