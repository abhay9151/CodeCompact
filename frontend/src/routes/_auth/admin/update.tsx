import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/admin/update')({
  component: () => <Outlet />,
})
