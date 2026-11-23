import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { getProblems } from '../../../api/problems'
import { DifficultyBadge } from '../../../components/DifficultyBadge'
import { Spinner } from '../../../components/Spinner'
import { getErrorMessage } from '../../../lib/errors'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'

export const Route = createFileRoute('/_auth/admin/update/')({
  component: ChooseProblemPage,
})

function ChooseProblemPage() {
  useDocumentTitle('Update problem | CodeCompact')
  const [search, setSearch] = useState('')
  const problemsQuery = useQuery({
    queryKey: ['problems', 'admin', 'update'],
    queryFn: () => getProblems({ page: 1, limit: 100, search: search || undefined }),
  })
  const problems = useMemo(() => problemsQuery.data?.problems ?? [], [problemsQuery.data])

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl text-ink">Choose a problem to update</h1>
      <label className="relative mt-6 block">
        <span className="sr-only">Search problems</span>
        <Search size={17} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search problems…" className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-base text-ink outline-none focus:border-accent" />
      </label>
      {problemsQuery.isLoading && <div className="flex justify-center py-16"><Spinner label="Loading problems" /></div>}
      {problemsQuery.isError && <p role="alert" className="mt-6 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">{getErrorMessage(problemsQuery.error, 'Could not load problems.')}</p>}
      {problemsQuery.isSuccess && (problems.length ? (
        <ul className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {problems.map((problem) => (
            <li key={problem._id}>
              <Link to="/admin/update/$id" params={{ id: problem._id }} className="flex min-h-[72px] items-center justify-between gap-4 p-4 transition-colors hover:bg-raised sm:p-5">
                <span className="min-w-0"><span className="block truncate font-semibold text-ink">{problem.title}</span><span className="mt-2 flex items-center gap-2"><DifficultyBadge difficulty={problem.difficulty} /><span className="text-xs text-muted">{problem.tags}</span></span></span>
                <ArrowRight size={18} className="shrink-0 text-muted" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      ) : <p className="mt-6 rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted">No problems found.</p>)}
    </main>
  )
}
