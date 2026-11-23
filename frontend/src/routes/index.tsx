import { createFileRoute, redirect } from '@tanstack/react-router'
import { authMeQueryKey } from '../hooks/useAuth'
import { getCurrentUser } from '../api/auth'

export const Route = createFileRoute('/')({
  beforeLoad: async ({ context }) => {
    let isAuthenticated = false
    try {
      await context.queryClient.fetchQuery({
        queryKey: authMeQueryKey,
        queryFn: getCurrentUser,
      })
      isAuthenticated = true
    } catch {
      isAuthenticated = false
    }
    throw redirect({ to: isAuthenticated ? '/problems' : '/login' })
  },
  component: () => null,
})
