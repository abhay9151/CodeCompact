import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ProblemForm, type ProblemFormValues } from '../../../components/ProblemForm'
import { Toast } from '../../../components/Toast'
import { useAdminToast } from '../../../hooks/useAdminToast'
import { createProblem } from '../../../api/problems'
import { getErrorMessage } from '../../../lib/errors'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'

export const Route = createFileRoute('/_auth/admin/create')({
  component: CreateProblemPage,
})

function CreateProblemPage() {
  useDocumentTitle('Create problem | CodeCompact')
  const queryClient = useQueryClient()
  const { toast, showToast, dismissToast } = useAdminToast()
  const createMutation = useMutation({
    mutationFn: createProblem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['problems'] })
      showToast('Problem created successfully.')
    },
    onError: (error) => showToast(getErrorMessage(error, 'Could not create the problem.'), 'error'),
  })

  const submit = async (values: ProblemFormValues) => {
    await createMutation.mutateAsync(values).catch(() => undefined)
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl text-ink">Create problem</h1>
      <p className="mt-2 max-w-[70ch] text-sm text-muted">Reference solutions are checked against visible examples before saving.</p>
      {toast && <div className="fixed right-4 top-20 z-40 w-[min(32rem,calc(100vw-2rem))]"><Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} /></div>}
      <div className="mt-7"><ProblemForm mode="create" isSaving={createMutation.isPending} onSubmit={submit} /></div>
    </main>
  )
}
