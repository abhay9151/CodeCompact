import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { QuestionRow } from '../../../components/patterns/QuestionRow'
import { usePatternMutations, usePatternSheet } from '../../../components/patterns/usePatternSheet'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'

type Filter = 'all' | 'pending' | 'done' | 'flagged'

export const Route = createFileRoute('/_auth/patterns/')({
  component: PatternSheetPage,
})

const filters: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'done', label: 'Done' },
  { id: 'flagged', label: 'Flagged' },
]

function PatternSheetPage() {
  useDocumentTitle('DSA Pattern Sheet | CodeCompact')
  const sheetQuery = usePatternSheet()
  const { solved, mark } = usePatternMutations()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const queryError = solved.error ?? mark.error
  const normalizedSearch = search.trim().toLowerCase()
  const sections = sheetQuery.data?.patterns ?? []
  const total = sheetQuery.data?.stats.total ?? 0
  const solvedCount = sheetQuery.data?.stats.solved ?? 0
  const flaggedCount = sheetQuery.data?.stats.markedForRevision ?? 0
  const percentage = total > 0 ? Math.round((solvedCount / total) * 100) : 0
  const hasActiveFilter = filter !== 'all' || normalizedSearch.length > 0
  const filteredSections = useMemo(() => sections.map((section) => ({
    ...section,
    questions: section.questions.filter((question) => {
      const matchesFilter = filter === 'all'
        || (filter === 'pending' && !question.solved)
        || (filter === 'done' && question.solved)
        || (filter === 'flagged' && question.markedForRevision)
      return matchesFilter && question.title.toLowerCase().includes(normalizedSearch)
    }),
  })).filter((section) => section.questions.length > 0), [filter, normalizedSearch, sections])

  return (
    <main className="mx-auto max-w-5xl px-3 py-7 sm:px-6 sm:py-10 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl tracking-tight text-ink">DSA Pattern Sheet</h1>
          <p className="mt-2 text-sm text-muted"><span className="display-number text-2xl text-ink">{solvedCount}</span> <span>of {total} solved</span></p>
        </div>
        <div className="flex items-end justify-between gap-4 sm:justify-end">
          <p className="pb-1 text-sm text-muted"><span className="font-medium text-highlight">{flaggedCount}</span> flagged for revision</p>
          <Link
            to="/patterns/revise"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-accent-solid bg-accent-solid px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Revise
          </Link>
        </div>
      </header>

      <div
        className="mt-5 h-1.5 overflow-hidden bg-raised"
        role="progressbar"
        aria-label="Pattern sheet progress"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full bg-accent transition-[width]" style={{ width: `${percentage}%` }} />
      </div>

      <section aria-label="Pattern question filters" className="sticky top-12 z-10 mt-5 border-y border-border bg-page py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 flex-wrap gap-1.5" role="group" aria-label="Filter questions">
            {filters.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                aria-pressed={filter === id}
                className={`rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  filter === id
                    ? 'bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200'
                    : 'text-muted hover:bg-raised'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="relative block w-full sm:w-64">
            <span className="sr-only">Search questions</span>
            <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search questions"
              className="min-h-10 w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus-visible:border-accent"
            />
          </label>
        </div>
      </section>

      {queryError && (
        <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">
          Could not update your progress. {queryError.message}
        </div>
      )}

      <section aria-label="DSA patterns" className="mt-5 border-t border-border">
        {sheetQuery.isLoading ? (
          <div aria-label="Loading pattern sheet" className="border-b border-border">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex h-16 items-center justify-between border-b border-border px-3">
                  <span className="h-4 w-40 animate-pulse bg-raised" />
                  <span className="h-4 w-14 animate-pulse bg-raised" />
              </div>
            ))}
          </div>
        ) : sheetQuery.isError ? (
          <div role="alert" className="border-b border-danger/30 bg-danger/10 p-4 text-danger">
            <p className="font-semibold">Could not load the pattern sheet.</p>
            <button
              type="button"
              onClick={() => void sheetQuery.refetch()}
              className="mt-2 text-sm font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        ) : total === 0 ? (
          <div className="border-b border-border py-10">
            <h2 className="font-semibold text-ink">No pattern questions yet</h2>
            <p className="mt-1 text-sm text-muted">The DSA sheet has not been seeded yet.</p>
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="border-b border-border py-10">
            <h2 className="font-semibold text-ink">No matching questions</h2>
            <p className="mt-1 text-sm text-muted">Change a filter or search term to see more questions.</p>
          </div>
        ) : (
          filteredSections.map((section) => {
            const originalSection = sections.find((item) => item.patternOrder === section.patternOrder)
            const sectionSolved = originalSection?.questions.filter((question) => question.solved).length ?? 0
            return (
              <details
                key={section.patternOrder}
                open={hasActiveFilter ? true : undefined}
                className="group border-b border-border"
              >
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 py-3 marker:hidden focus-visible:outline-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 break-words font-medium text-ink">{section.pattern}</span>
                  <span className="shrink-0 font-mono text-xs text-muted">{sectionSolved} / {originalSection?.questions.length ?? 0}</span>
                </summary>
                <div className="flex flex-wrap gap-[2px] pb-3" role="img" aria-label={`${sectionSolved} of ${originalSection?.questions.length ?? 0} solved in ${section.pattern}`}>
                  {originalSection?.questions.map((question, index) => {
                    const state = question.markedForRevision
                      ? 'flagged'
                      : question.solved
                        ? 'solved'
                        : 'pending'
                    return (
                      <span
                        key={question._id}
                        aria-hidden="true"
                        data-state={state}
                        className="pattern-strip-square size-[10px] border"
                        style={{ animationDelay: `${index * 2}ms` }}
                      />
                    )
                  })}
                </div>
                <ul className="divide-y divide-border border-t border-border">
                  {section.questions.map((question) => (
                    <QuestionRow
                      key={question._id}
                      question={question}
                      onSolvedChange={(value) => solved.mutate({ id: question._id, value })}
                      onRevisionMarkChange={(value) => mark.mutate({ id: question._id, value })}
                      disabled={solved.isPending || mark.isPending}
                    />
                  ))}
                </ul>
              </details>
            )
          })
        )}
      </section>
    </main>
  )
}
