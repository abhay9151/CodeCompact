import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Search, Upload, Video } from 'lucide-react'
import { useMemo, useState } from 'react'
import { deleteSolutionVideo } from '../../../api/video'
import { getProblems } from '../../../api/problems'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { DifficultyBadge } from '../../../components/DifficultyBadge'
import { Spinner } from '../../../components/Spinner'
import { Toast } from '../../../components/Toast'
import { useAdminToast } from '../../../hooks/useAdminToast'
import { getErrorMessage } from '../../../lib/errors'
import type { Problem } from '../../../types'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'

export const Route = createFileRoute('/_auth/admin/video')({
  component: VideoManagementPage,
})

function VideoManagementPage() {
  useDocumentTitle('Solution videos | CodeCompact')
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedProblem, setSelectedProblem] = useState<Problem>()
  const { toast, showToast, dismissToast } = useAdminToast()
  const problemsQuery = useQuery({
    queryKey: ['problems', 'admin', 'video'],
    queryFn: () => getProblems({ page: 1, limit: 100 }),
  })
  const deleteMutation = useMutation({
    mutationFn: deleteSolutionVideo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['problems'] })
      setSelectedProblem(undefined)
      showToast('Solution video deleted.')
    },
    onError: (error) => {
      showToast(getErrorMessage(error, 'Could not delete the solution video.'), 'error')
      setSelectedProblem(undefined)
    },
  })
  const problems = useMemo(
    () => (problemsQuery.data?.problems ?? []).filter((problem) => problem.title.toLowerCase().includes(search.trim().toLowerCase())),
    [problemsQuery.data, search],
  )

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl text-ink">Solution videos</h1>
      <p className="mt-2 text-sm text-muted">Upload an editorial or remove a problem’s current video.</p>
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
            <li key={problem._id} className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
              <div className="min-w-0"><h2 className="truncate font-semibold text-ink">{problem.title}</h2><div className="mt-2 flex items-center gap-2"><DifficultyBadge difficulty={problem.difficulty} /><span className="text-xs text-muted">{problem.tags}</span></div></div>
              <div className="flex shrink-0 items-center gap-2">
                <Link to="/admin/upload/$problemId" params={{ problemId: problem._id }} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent-solid px-3 py-2 text-sm font-semibold text-white hover:bg-accent-hover"><Upload size={15} aria-hidden="true" />Upload</Link>
                <button type="button" onClick={() => setSelectedProblem(problem)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-ink hover:bg-raised"><Video size={15} aria-hidden="true" />Delete video</button>
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="mt-6 rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted">No problems found.</p>)}

      {selectedProblem && (
        <ConfirmDialog
          title="Delete solution video?"
          description={<>Remove the editorial for <strong>{selectedProblem.title}</strong>?</>}
          confirmLabel="Delete video"
          isPending={deleteMutation.isPending}
          onCancel={() => setSelectedProblem(undefined)}
          onConfirm={() => deleteMutation.mutate(selectedProblem._id)}
        />
      )}
    </main>
  )
}
