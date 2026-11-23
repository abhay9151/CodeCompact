import { createFileRoute, Outlet, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { getCurrentUser } from '../api/auth'
import { Spinner } from '../components/Spinner'
import { authMeQueryKey } from '../hooks/useAuth'
import { useAuth } from '../hooks/useAuth'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.fetchQuery({
        queryKey: authMeQueryKey,
        queryFn: getCurrentUser,
      })
    } catch {
      throw redirect({ to: '/login' })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      void navigate({ to: '/login', replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  if (!isAuthenticated) {
    return <main className="mx-auto flex max-w-7xl justify-center px-4 py-16"><Spinner label="Checking your session" /></main>
  }
  return <Outlet />
}
