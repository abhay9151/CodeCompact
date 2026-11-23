import { CircleCheck, CircleX, X } from 'lucide-react'

interface ToastProps {
  message: string
  variant?: 'success' | 'error'
  onDismiss?: () => void
}

export const Toast = ({ message, variant = 'success', onDismiss }: ToastProps) => (
  <div
    role={variant === 'error' ? 'alert' : 'status'}
    className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
      variant === 'error'
        ? 'border-danger/30 bg-danger/10 text-danger'
        : 'border-success/30 bg-success/10 text-success'
    }`}
  >
    {variant === 'error'
      ? <CircleX aria-hidden="true" className="mt-0.5 shrink-0" size={17} />
      : <CircleCheck aria-hidden="true" className="mt-0.5 shrink-0" size={17} />}
    <p className="min-w-0 flex-1">{message}</p>
    {onDismiss && (
      <button type="button" aria-label="Dismiss notification" onClick={onDismiss} className="shrink-0 opacity-70 hover:opacity-100">
        <X size={16} aria-hidden="true" />
      </button>
    )}
  </div>
)
