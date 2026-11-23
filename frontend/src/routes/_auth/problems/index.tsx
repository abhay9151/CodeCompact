import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Check, Search, SlidersHorizontal } from 'lucide-react'
import { z } from 'zod'
import { getProblems, getSolvedProblems } from '../../../api/problems'
import { DifficultyBadge } from '../../../components/DifficultyBadge'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'

const problemSearchSchema = z.object({
  status: z.enum(['all', 'solved', 'unsolved']).optional().catch(undefined),
  difficulty: z.enum(['all', 'easy', 'medium', 'hard']).optional().catch(undefined),
  tag: z.string().optional().catch(undefined),
  search: z.string().optional().catch(undefined),
})

type ProblemSearch = z.infer<typeof problemSearchSchema>

export const Route = createFileRoute('/_auth/problems/')({
  validateSearch: (search): ProblemSearch => problemSearchSchema.parse(search),
  component: ProblemsPage,
})

const tags = ['array', 'linkedList', 'graph', 'dp', 'string', 'tree', 'math', 'binarySearch', 'stack', 'greedy']

function ProblemsPage() {
  useDocumentTitle('Problems | CodeCompact')
  const filters = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const status = filters.status ?? 'all'
  const difficulty = filters.difficulty ?? 'all'
  const tag = filters.tag ?? 'all'
  const search = filters.search ?? ''
  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    if (searchInput === search) return undefined
    const timer = window.setTimeout(() => {
      void navigate({
        search: (previous) => ({ ...previous, search: searchInput || undefined }),
        replace: true,
      })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [navigate, search, searchInput])

  const problemsQuery = useQuery({
    queryKey: ['problems', filters],
    queryFn: () => getProblems({
      limit: 100,
      difficulty: difficulty === 'all' ? undefined : difficulty,
      tag: tag === 'all' ? undefined : tag,
      search: search || undefined,
    }),
  })
  const solvedQuery = useQuery({
    queryKey: ['problems', 'solved'],
    queryFn: getSolvedProblems,
  })

  const solvedIds = useMemo(() => new Set((solvedQuery.data ?? []).map((problem) => problem._id)), [solvedQuery.data])
  const scopedSolvedCount = useMemo(() => (
    (solvedQuery.data ?? []).filter((problem) => (
      (difficulty === 'all' || problem.difficulty === difficulty)
      && (tag === 'all' || problem.tags === tag)
      && (!search || problem.title.toLowerCase().includes(search.toLowerCase()))
    )).length
  ), [difficulty, search, tag, solvedQuery.data])

  const visibleProblems = (problemsQuery.data?.problems ?? []).filter((problem) => {
    const solved = solvedIds.has(problem._id)
    return status === 'all'
      || (status === 'solved' && solved)
      || (status === 'unsolved' && !solved)
  })
  const total = problemsQuery.data?.total ?? 0
  const progress = total ? Math.min(100, (scopedSolvedCount / total) * 100) : 0
  const queryError = problemsQuery.isError || solvedQuery.isError
  const isLoading = problemsQuery.isLoading || solvedQuery.isLoading

  const updateFilter = (change: Partial<ProblemSearch>) => {
    void navigate({
      search: (previous) => ({ ...previous, ...change }),
      replace: true,
    })
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl tracking-tight text-ink">Problems</h1>
          <p className="mt-2 text-sm text-muted">Choose a problem and work through it at your pace.</p>
        </div>
        <div className="w-full border border-border bg-surface p-3 sm:w-60">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted">Progress</span>
            <span className="text-sm text-ink"><span className="display-number text-xl">{scopedSolvedCount}</span> <span className="text-muted">/ {total} solved</span></span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden bg-raised" role="progressbar" aria-label="Problems solved" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-accent transition-[width]" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <section aria-label="Problem filters" className="mt-6 border-y border-border py-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted">
          <SlidersHorizontal size={16} aria-hidden="true" />Filters
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,2fr)_repeat(3,minmax(8rem,1fr))]">
          <label className="relative">
            <span className="sr-only">Search problems</span>
            <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} type="search" placeholder="Search problems" className="min-h-10 w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus-visible:border-accent" />
          </label>
          <FilterSelect label="Status" value={status} onChange={(value) => updateFilter({ status: value as ProblemSearch['status'] })} options={['all', 'solved', 'unsolved']} />
          <FilterSelect label="Difficulty" value={difficulty} onChange={(value) => updateFilter({ difficulty: value as ProblemSearch['difficulty'] })} options={['all', 'easy', 'medium', 'hard']} />
          <FilterSelect label="Tag" value={tag} onChange={(value) => updateFilter({ tag: value === 'all' ? undefined : value })} options={['all', ...tags]} />
        </div>
      </section>

      <section aria-label="Problems" className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <h2 className="font-medium text-ink">Problem list</h2>
          <span className="text-xs text-muted">{visibleProblems.length} shown</span>
        </div>
        {isLoading ? (
          <div className="border-y border-border" aria-label="Loading problems">
            <div className="grid h-10 grid-cols-[5rem_minmax(12rem,1fr)_8rem_10rem] gap-3 border-b border-border px-3 text-xs text-muted sm:px-4">
              {['Status', 'Title', 'Difficulty', 'Tags'].map((label) => <span key={label} className="self-center">{label}</span>)}
            </div>
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="grid h-[52px] grid-cols-[5rem_minmax(12rem,1fr)_8rem_10rem] gap-3 border-b border-border px-3 sm:px-4">
                <span className="my-3 h-4 animate-pulse bg-raised" />
                <span className="my-3 h-4 animate-pulse bg-raised" />
                <span className="my-3 h-4 w-16 animate-pulse bg-raised" />
                <span className="my-3 h-4 w-20 animate-pulse bg-raised" />
              </div>
            ))}
          </div>
        ) : queryError ? (
          <div role="alert" className="border border-hard/30 bg-hard/10 p-4 text-sm text-hard">
            <p>Could not load the problem list.</p>
            <button type="button" onClick={() => { void problemsQuery.refetch(); void solvedQuery.refetch() }} className="mt-2 font-semibold underline underline-offset-2">Try again</button>
          </div>
        ) : visibleProblems.length === 0 ? (
          <div className="border-y border-border px-4 py-10">
            <h2 className="font-semibold text-ink">No problems found</h2>
            <p className="mt-1 text-sm text-muted">Change or clear a filter to see more problems.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border-y border-border">
            <table className="w-full min-w-[600px] border-collapse text-left">
              <thead>
                <tr className="h-10 border-b border-border text-xs font-medium text-muted">
                  <th scope="col" className="w-24 px-3 font-medium sm:px-4">Status</th>
                  <th scope="col" className="px-3 font-medium">Title</th>
                  <th scope="col" className="w-32 px-3 font-medium">Difficulty</th>
                  <th scope="col" className="w-40 px-3 font-medium">Tags</th>
                </tr>
              </thead>
              <tbody>
              {visibleProblems.map((problem) => {
                const solved = solvedIds.has(problem._id)
                return (
                  <tr key={problem._id} className="h-[52px] border-b border-border transition-colors last:border-b-0 hover:bg-raised">
                    <td className="px-3 sm:px-4">
                      <span className="inline-flex items-center gap-2 text-xs text-muted">
                        {solved ? <Check size={16} className="text-success" aria-hidden="true" /> : <span className="size-3.5 rounded-full border border-muted" aria-hidden="true" />}
                        {solved ? 'Solved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-3">
                      <Link to="/problems/$problemId" params={{ problemId: problem._id }} className="font-medium text-ink hover:text-accent hover:underline">{problem.title}</Link>
                    </td>
                    <td className="px-3"><DifficultyBadge difficulty={problem.difficulty} /></td>
                    <td className="px-3 text-xs text-muted">{problem.tags}</td>
                  </tr>
                )
              })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

const FilterSelect = ({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) => (
  <label className="flex min-h-10 items-center gap-2 rounded-md border border-border bg-surface px-3">
    <span className="shrink-0 text-xs text-muted">{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent py-2 text-sm capitalize text-ink outline-none">
      {options.map((option) => <option key={option} value={option}>{option === 'all' ? `All ${label.toLowerCase()}` : option}</option>)}
    </select>
  </label>
)
