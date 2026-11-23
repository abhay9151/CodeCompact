import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Navbar } from '../components/Navbar'
import Logo from '../components/ui/Logo'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  errorComponent: RootErrorBoundary,
  notFoundComponent: NotFoundPage,
})

function RootLayout() {
  return (
    <div className="min-h-screen bg-page text-ink transition-colors">
      <Navbar />
      <Outlet />
    </div>
  )
}

function RootErrorBoundary({ error, reset }: { error: unknown; reset: () => void }) {
  useDocumentTitle('Application error | CodeCompact')
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.'
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
      <Logo size={40} showWordmark={false} />
      <p className="text-sm font-semibold text-hard-ink dark:text-hard">Something went wrong</p>
      <h1 className="mt-3 text-3xl font-bold text-ink">This page couldn’t load</h1>
      <p className="mt-3 max-w-lg text-sm leading-6 text-muted">{errorMessage}</p>
      <button type="button" onClick={reset} className="mt-6 min-h-11 rounded-xl bg-accent-solid px-5 py-3 text-sm font-semibold text-white hover:bg-accent-hover">Try again</button>
    </main>
  )
}

function NotFoundPage() {
  useDocumentTitle('Page not found | CodeCompact')
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
      <Logo size={40} showWordmark={false} />
      <p className="text-sm font-semibold text-accent">Page not found</p>
      <h1 className="mt-3 text-3xl font-bold text-ink">We couldn’t find that page</h1>
      <p className="mt-3 text-sm text-muted">The link may be outdated, or the page may have moved.</p>
      <Link to="/" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-accent-solid px-5 py-3 text-sm font-semibold text-white hover:bg-accent-hover">Go to CodeCompact</Link>
    </main>
  )
}
