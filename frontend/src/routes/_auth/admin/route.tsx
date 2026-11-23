import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getCurrentUser } from '../../../api/auth'
import { authMeQueryKey } from '../../../hooks/useAuth'

export const Route = createFileRoute('/_auth/admin')({
  beforeLoad: async ({ context }) => {
    try {
      const user = await context.queryClient.fetchQuery({
        queryKey: authMeQueryKey,
        queryFn: getCurrentUser,
      })
      if (user.role !== 'admin') {
        throw redirect({ to: '/problems' })
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'to' in error) throw error
      throw redirect({ to: '/login' })
    }
  },
  component: () => <Outlet />,
})
