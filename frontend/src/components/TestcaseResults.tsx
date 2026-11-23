import { Check, X } from 'lucide-react'
import type { Problem, RunResult } from '../types'
import { formatMemory, formatRuntime } from '../lib/format'

interface TestcaseResultsProps {
  problem: Problem
  result?: RunResult
}

export const TestcaseResults = ({ problem, result }: TestcaseResultsProps) => {
  const cases = problem.visibleTestCases ?? []

  return (
    <div className="space-y-3">
      {cases.map((testCase, index) => {
        const actual = result?.testCases[index]
        const passed = actual?.status_id === 3
        return (
          <article key={`${testCase.input}-${index}`} className="border-b border-border py-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-ink">Example {index + 1}</h3>
              {actual && (
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${passed ? 'text-success' : 'text-hard-ink dark:text-hard'}`}>
                  {passed ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}
                  {actual.status?.description ?? (passed ? 'Accepted' : 'Failed')}
                </span>
              )}
            </div>
            {actual && (
              <p className="mb-3 flex gap-4 text-xs text-muted">
                <span>Runtime: <span className="tabular-nums">{formatRuntime(actual.runtimeMs)}</span></span>
                <span>Memory: <span className="tabular-nums">{formatMemory(actual.memory)}</span></span>
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <OutputBlock label="Input" value={testCase.input} />
              <OutputBlock label="Expected output" value={testCase.output} />
              {actual && <OutputBlock label="Your output" value={actual.stdout || '(no output)'} />}
              {actual?.stderr && <OutputBlock label="stderr" value={actual.stderr} />}
              {actual?.compile_output && <OutputBlock label="Compile output" value={actual.compile_output} />}
              {testCase.explanation && <OutputBlock label="Explanation" value={testCase.explanation} />}
            </div>
          </article>
        )
      })}
    </div>
  )
}

const OutputBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <p className="mb-1 text-xs font-medium text-muted">{label}</p>
    <pre className="overflow-x-auto whitespace-pre-wrap border border-border bg-raised px-3 py-2 font-mono text-sm leading-6 text-ink">{value}</pre>
  </div>
)
