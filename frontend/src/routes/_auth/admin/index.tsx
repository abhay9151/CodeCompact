import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'

export const Route = createFileRoute('/_auth/admin/')({
  component: AdminDashboard,
})

const items = [
  { to: '/admin/create' as const, label: 'Create a problem', description: 'Add a coding challenge.' },
  { to: '/admin/update' as const, label: 'Update a problem', description: 'Choose a challenge to edit.' },
  { to: '/admin/delete' as const, label: 'Delete a problem', description: 'Remove a challenge.' },
  { to: '/admin/video' as const, label: 'Solution videos', description: 'Upload or remove explanations.' },
]

function AdminDashboard() {
  useDocumentTitle('Admin dashboard | CodeCompact')
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl text-ink">Admin dashboard</h1>
      <div className="mt-6 grid border-t border-border sm:grid-cols-2 sm:gap-x-8 xl:grid-cols-4">
        {items.map(({ to, label, description }) => (
          <Link key={to} to={to} className="group flex min-h-36 flex-col border-b border-border py-5 transition-colors hover:bg-raised sm:px-3">
            <h2 className="flex items-center justify-between gap-3 font-semibold text-ink group-hover:text-accent">
              {label}<ArrowUpRight size={16} aria-hidden="true" />
            </h2>
            <p className="mt-1 text-sm text-muted">{description}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
