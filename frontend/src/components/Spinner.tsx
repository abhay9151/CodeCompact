export const Spinner = ({ label = 'Loading' }: { label?: string }) => (
  <span role="status" className="inline-flex items-center gap-2 text-sm text-muted">
    <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
    <span>{label}</span>
  </span>
)
