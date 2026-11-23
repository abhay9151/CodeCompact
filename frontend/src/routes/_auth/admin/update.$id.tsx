import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ProblemForm, type ProblemFormValues } from '../../../components/ProblemForm'
import { Spinner } from '../../../components/Spinner'
import { Toast } from '../../../components/Toast'
import { useAdminToast } from '../../../hooks/useAdminToast'
import { getProblem, updateProblem } from '../../../api/problems'
import { getErrorMessage } from '../../../lib/errors'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'

export const Route = createFileRoute('/_auth/admin/update/$id')({
  component: UpdateProblemPlaceholder,
})

function UpdateProblemPlaceholder() {
  const { id } = Route.useParams()
  useDocumentTitle('Edit problem | CodeCompact')
  const queryClient = useQueryClient()
  const { toast, showToast, dismissToast } = useAdminToast()
  const problemQuery = useQuery({ queryKey: ['problems', id], queryFn: () => getProblem(id) })
  const updateMutation = useMutation({
    mutationFn: (values: ProblemFormValues) => updateProblem(id, values),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['problems'] }),
        queryClient.invalidateQueries({ queryKey: ['problems', id] }),
      ])
      showToast('Problem updated successfully.')
    },
    onError: (error) => showToast(getErrorMessage(error, 'Could not update the problem.'), 'error'),
  })

  if (problemQuery.isLoading) return <main className="flex justify-center px-4 py-24"><Spinner label="Loading problem" /></main>
  if (problemQuery.isError || !problemQuery.data) {
    return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><h1 className="text-3xl text-ink">Update problem</h1><p role="alert" className="mt-6 border border-danger/30 bg-danger/10 p-4 text-sm text-danger">{getErrorMessage(problemQuery.error, 'Could not load the problem.')}</p></main>
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl text-ink">Update problem</h1>
      {toast && <div className="fixed right-4 top-20 z-40 w-[min(32rem,calc(100vw-2rem))]"><Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} /></div>}
      <div className="mt-7"><ProblemForm mode="update" initialProblem={problemQuery.data} isSaving={updateMutation.isPending} onSubmit={async (values) => { await updateMutation.mutateAsync(values).catch(() => undefined) }} /></div>
    </main>
  )
}
