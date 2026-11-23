import { Check, X } from 'lucide-react'
import type { SubmitResult } from '../types'
import { formatMemory, formatRuntime } from '../lib/format'

const readableStatus: Record<SubmitResult['status'], string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  wrong_answer: 'Wrong answer',
  time_limit: 'Time limit exceeded',
  compile_error: 'Compilation error',
  runtime_error: 'Runtime error',
}

export const SubmissionResult = ({ result }: { result: SubmitResult }) => (
  <section className={`border-l-2 pl-4 ${result.accepted ? 'border-easy' : 'border-hard'}`}>
    <div className="flex items-start gap-3">
      {result.accepted
        ? <Check size={16} className="mt-1 text-success" aria-hidden="true" />
        : <X size={16} className="mt-1 text-hard-ink dark:text-hard" aria-hidden="true" />}
      <div>
        <h3 className={`font-serif text-2xl ${result.accepted ? 'text-success' : 'text-hard-ink dark:text-hard'}`}>{readableStatus[result.status]}</h3>
        <p className="mt-1 text-sm text-muted">{result.passedTestCases} of {result.totalTestCases} test cases passed</p>
      </div>
    </div>
    <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
      <div>
        <dt className="text-xs text-muted">Runtime</dt>
        <dd className="font-mono tabular-nums text-ink">{formatRuntime(result.runtimeMs)}</dd>
      </div>
      <div>
        <dt className="text-xs text-muted">Memory</dt>
        <dd className="font-mono tabular-nums text-ink">{formatMemory(result.memory)}</dd>
      </div>
    </dl>
    {result.errorMessage && (
      <pre className="mt-4 max-h-48 overflow-auto whitespace-pre-wrap border border-border bg-raised p-3 font-mono text-sm leading-6 text-hard-ink dark:text-hard">{result.errorMessage}</pre>
    )}
  </section>
)
