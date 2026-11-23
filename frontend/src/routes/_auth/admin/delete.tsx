import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { deleteProblem, getProblems } from '../../../api/problems'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { DifficultyBadge } from '../../../components/DifficultyBadge'
import { Spinner } from '../../../components/Spinner'
import { Toast } from '../../../components/Toast'
import { useAdminToast } from '../../../hooks/useAdminToast'
import { getErrorMessage } from '../../../lib/errors'
import type { Problem } from '../../../types'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'

export const Route = createFileRoute('/_auth/admin/delete')({
  component: DeleteProblemPage,
})

function DeleteProblemPage() {
  useDocumentTitle('Delete problem | CodeCompact')
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedProblem, setSelectedProblem] = useState<Problem>()
  const { toast, showToast, dismissToast } = useAdminToast()
  const problemsQuery = useQuery({
    queryKey: ['problems', 'admin', 'delete'],
    queryFn: () => getProblems({ page: 1, limit: 100 }),
  })
  const deleteMutation = useMutation({
    mutationFn: deleteProblem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['problems'] })
      setSelectedProblem(undefined)
      showToast('Problem deleted successfully.')
    },
    onError: (error) => showToast(getErrorMessage(error, 'Could not delete the problem.'), 'error'),
  })
  const problems = useMemo(
    () => (problemsQuery.data?.problems ?? []).filter((problem) => problem.title.toLowerCase().includes(search.trim().toLowerCase())),
    [problemsQuery.data, search],
  )

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl text-ink">Delete a problem</h1>
      <p className="mt-2 text-sm text-muted">Deleting a problem also removes its editorial video.</p>
      {toast && <div className="mt-5"><Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} /></div>}
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
            <li key={problem._id} className="flex items-center justify-between gap-4 p-4 sm:p-5">
              <div className="min-w-0"><h2 className="truncate font-semibold text-ink">{problem.title}</h2><div className="mt-2 flex items-center gap-2"><DifficultyBadge difficulty={problem.difficulty} /><span className="text-xs text-muted">{problem.tags}</span></div></div>
              <button type="button" aria-label={`Delete ${problem.title}`} onClick={() => setSelectedProblem(problem)} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-danger/40 px-3 py-2 text-sm font-semibold text-danger transition hover:bg-danger/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"><Trash2 size={15} aria-hidden="true" /><span className="hidden sm:inline">Delete</span></button>
            </li>
          ))}
        </ul>
      ) : <p className="mt-6 rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted">No problems found.</p>)}

      {selectedProblem && (
        <ConfirmDialog
          title="Delete this problem?"
          description={<><strong className="text-ink">{selectedProblem.title}</strong> and its solution video will be permanently removed.</>}
          confirmLabel="Delete problem"
          isPending={deleteMutation.isPending}
          onCancel={() => setSelectedProblem(undefined)}
          onConfirm={() => deleteMutation.mutate(selectedProblem._id)}
        />
      )}
    </main>
  )
}
