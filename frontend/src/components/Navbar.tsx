import { useState } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { LogOut, Menu, X } from 'lucide-react'
import { getSolvedProblems } from '../api/problems'
import { useAuth } from '../hooks/useAuth'
import { ThemeToggle } from './ThemeToggle'
import Logo from './ui/Logo'
import { Spinner } from './Spinner'
import { shortName } from '../lib/shortName'

const navLinkClass = 'inline-flex min-h-12 items-center border-b-2 px-1 text-sm font-medium transition-colors hover:text-ink'

export const Navbar = () => {
  const { user, isLoading, isAuthenticated, logout, isLoggingOut } = useAuth()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isLoginPage = pathname === '/login'
  const isSignupPage = pathname === '/signup'
  const isAuthPage = isLoginPage || isSignupPage
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const solvedQuery = useQuery({
    queryKey: ['problems', 'solved'],
    queryFn: getSolvedProblems,
    enabled: isAuthenticated,
  })
  const initials = user?.firstName?.slice(0, 1).toUpperCase() ?? 'U'
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      await navigate({ to: '/login' })
    }
  }
  const isActive = (to: string) => pathname === to || (to !== '/problems' && pathname.startsWith(`${to}/`))
  const linkClass = (to: string) => `${navLinkClass} ${
    isActive(to) ? 'border-accent text-ink' : 'border-transparent text-muted'
  }`

  return (
    <header className="sticky top-0 z-20 h-12 border-b border-border bg-page">
      <nav aria-label="Main navigation" className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-5">
          <Logo size={28} />
          {!isAuthPage && isLoading ? (
            <span className="hidden sm:block"><Spinner label="Checking session" /></span>
          ) : !isAuthPage && isAuthenticated ? (
            <div className="hidden h-12 items-center gap-4 sm:flex">
              <Link to="/problems" className={linkClass('/problems')}>Problems</Link>
              <Link to="/patterns" className={linkClass('/patterns')}>Pattern Sheet</Link>
              {user?.role === 'admin' && <Link to="/admin" className={linkClass('/admin')}>Admin</Link>}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isAuthPage ? (
            <>
              <ThemeToggle />
              <Link
                to={isLoginPage ? '/signup' : '/login'}
                className={`inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium ${
                  isSignupPage
                    ? 'text-muted hover:text-ink'
                    : 'border border-accent-solid bg-accent-solid text-white hover:bg-accent-hover'
                }`}
              >
                {isLoginPage ? 'Sign up' : 'Log in'}
              </Link>
            </>
          ) : isAuthenticated ? (
            <>
              <span className="hidden text-xs text-muted sm:inline">
                <span className="font-serif text-lg text-ink">{solvedQuery.data?.length ?? '—'}</span>
                <span className="ml-1">solved</span>
              </span>
              <ThemeToggle />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccountOpen((open) => !open)}
                  aria-label="Account menu"
                  title={fullName}
                  aria-expanded={isAccountOpen}
                  aria-haspopup="menu"
                  className="grid size-11 place-items-center rounded-full border border-border bg-raised text-xs font-semibold text-ink hover:border-accent"
                >
                  {initials}
                </button>
                {isAccountOpen && (
                  <div role="menu" className="absolute right-0 top-10 z-30 w-52 border border-border bg-surface p-2 shadow-md">
                    <p title={fullName} className="max-w-[180px] truncate px-2 py-1 text-sm font-medium text-ink">{shortName(fullName)}</p>
                    <p className="truncate px-2 py-2 text-xs text-muted">{user?.emailId}</p>
                    {user?.role === 'admin' && (
                      <Link to="/admin" role="menuitem" onClick={() => setIsAccountOpen(false)} className="block rounded-md px-2 py-2 text-sm text-ink hover:bg-raised">Admin dashboard</Link>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => void handleLogout()}
                      disabled={isLoggingOut}
                      className="flex min-h-11 w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-ink hover:bg-raised disabled:opacity-50"
                    >
                      <LogOut size={16} aria-hidden="true" />
                      {isLoggingOut ? 'Logging out…' : 'Log out'}
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-navigation"
                onClick={() => setIsMenuOpen((open) => !open)}
                className="grid size-11 place-items-center rounded-md border border-border text-muted sm:hidden"
              >
                {isMenuOpen ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
              </button>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link to="/login" className="inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-muted hover:text-ink">Log in</Link>
              <Link to="/signup" className="inline-flex min-h-11 items-center rounded-md border border-accent-solid bg-accent-solid px-3 py-2 text-sm font-semibold text-white hover:bg-accent-hover">Sign up</Link>
            </>
          )}
        </div>
      </nav>
      {isAuthenticated && isMenuOpen && (
        <div id="mobile-navigation" className="border-b border-border bg-page px-3 py-2 sm:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col">
            <Link to="/problems" onClick={() => setIsMenuOpen(false)} className="min-h-11 border-b border-border py-2 text-sm text-ink">Problems</Link>
            <Link to="/patterns" onClick={() => setIsMenuOpen(false)} className="min-h-11 border-b border-border py-2 text-sm text-ink">Pattern Sheet</Link>
            {user?.role === 'admin' && <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="min-h-11 py-2 text-sm text-ink">Admin dashboard</Link>}
          </nav>
        </div>
      )}
    </header>
  )
}
