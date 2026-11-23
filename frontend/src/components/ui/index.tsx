import { useState, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'
import { LoaderCircle, X } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
  children: ReactNode
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'border border-accent-solid bg-accent-solid text-white hover:bg-accent-hover',
  secondary: 'border border-border bg-raised text-ink hover:bg-page',
  ghost: 'border border-transparent bg-transparent text-ink hover:bg-raised',
  danger: 'border border-danger bg-danger text-white hover:brightness-90',
}

export const Button = ({ variant = 'primary', loading = false, disabled, children, className = '', ...props }: ButtonProps) => (
  <button
    {...props}
    disabled={disabled || loading}
    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55 ${buttonVariants[variant]} ${className}`}
  >
    {loading && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
    {children}
  </button>
)

interface FieldProps {
  label: string
  error?: string
  hint?: string
  id: string
}

export const Input = ({ label, error, hint, id, className = '', ...props }: FieldProps & InputHTMLAttributes<HTMLInputElement>) => (
  <label htmlFor={id} className="block text-sm font-medium text-ink">
    {label}
    <input
      {...props}
      id={id}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      className={`mt-2 min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus-visible:border-accent ${error ? 'border-danger' : ''} ${className}`}
    />
    {error && <span id={`${id}-error`} className="mt-1 block text-xs text-danger">{error}</span>}
    {!error && hint && <span id={`${id}-hint`} className="mt-1 block text-xs text-muted">{hint}</span>}
  </label>
)

export const Select = ({ label, id, children, className = '', ...props }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) => (
  <label htmlFor={id} className="block text-sm font-medium text-ink">
    {label}
    <select
      {...props}
      id={id}
      className={`mt-2 min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:border-accent ${className}`}
    >
      {children}
    </select>
  </label>
)

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
}

export const Checkbox = ({ label, className = '', ...props }: CheckboxProps) => (
  <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
    <input {...props} type="checkbox" className={`peer sr-only ${className}`} />
    <span aria-hidden="true" className="grid size-4 place-items-center rounded-sm border border-muted bg-surface transition-colors duration-150 peer-checked:border-accent peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent peer-checked:[&>svg]:scale-100">
      <svg viewBox="0 0 12 12" className="size-3 scale-0 text-white transition-transform duration-150">
        <path d="m2 6 2.4 2.4L10 3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
      </svg>
    </span>
    {label}
  </label>
)

type BadgeTone = 'neutral' | 'accent' | 'highlight' | 'easy' | 'medium' | 'hard'

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'border-border bg-raised text-muted',
  accent: 'border-accent/30 bg-accent/10 text-accent',
  highlight: 'border-highlight/35 bg-highlight/10 text-highlight',
  easy: 'border-accent/30 bg-accent/10 text-accent',
  medium: 'border-medium/30 bg-medium/10 text-medium',
  hard: 'border-hard/30 bg-hard/10 text-hard',
}

export const Badge = ({ tone = 'neutral', children, className = '' }: { tone?: BadgeTone; children: ReactNode; className?: string }) => (
  <span className={`inline-flex min-h-5 items-center rounded-sm border px-1.5 text-xs font-medium ${badgeTones[tone]} ${className}`}>
    {children}
  </span>
)

interface TabsProps<T extends string> {
  tabs: readonly T[]
  value: T
  onChange: (value: T) => void
  label: string
}

export const Tabs = <T extends string>({ tabs, value, onChange, label }: TabsProps<T>) => (
  <div role="tablist" aria-label={label} className="flex min-w-0 overflow-x-auto border-b border-border">
    {tabs.map((tab) => (
      <button
        key={tab}
        type="button"
        role="tab"
        aria-selected={tab === value}
        onClick={() => onChange(tab)}
        className={`min-h-11 shrink-0 border-b-2 px-3 text-sm transition-colors ${
          tab === value ? 'border-accent font-semibold text-accent' : 'border-transparent text-muted hover:text-ink'
        }`}
      >
        {tab}
      </button>
    ))}
  </div>
)

export const Table = ({ children, className = '', ...props }: HTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-x-auto">
    <table {...props} className={`w-full border-collapse text-left text-sm ${className}`}>{children}</table>
  </div>
)

export const Modal = ({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-page/80 p-4" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section role="dialog" aria-modal="true" aria-labelledby="ui-modal-title" className="w-full max-w-lg rounded-xl border border-border bg-surface p-5">
        <header className="flex items-center justify-between gap-3">
          <h2 id="ui-modal-title" className="text-lg font-semibold text-ink">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="grid size-11 place-items-center rounded-md text-muted hover:bg-raised hover:text-ink">
            <X size={16} aria-hidden="true" />
          </button>
        </header>
        <div className="mt-4">{children}</div>
      </section>
    </div>
  )
}

export const Toast = ({ message, onDismiss }: { message: string; onDismiss?: () => void }) => (
  <div role="status" className="flex items-start gap-3 rounded-lg border border-border bg-raised p-3 text-sm text-ink shadow-md">
    <p className="min-w-0 flex-1">{message}</p>
    {onDismiss && <button type="button" onClick={onDismiss} aria-label="Dismiss notification" className="grid size-11 shrink-0 place-items-center rounded-md text-muted hover:text-ink"><X size={16} aria-hidden="true" /></button>}
  </div>
)

export const Tooltip = ({ label, children }: { label: string; children: ReactNode }) => (
  <span className="group relative inline-flex">
    {children}
    <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-raised px-2 py-1 text-xs text-ink opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
      {label}
    </span>
  </span>
)

export const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd className="rounded-sm border border-border bg-raised px-1.5 py-0.5 font-mono text-xs text-muted">{children}</kbd>
)

export const Skeleton = ({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div aria-hidden="true" {...props} className={`animate-pulse bg-raised ${className}`} />
)

export const EmptyState = ({ title, description, action }: { title: string; description: string; action?: ReactNode }) => (
  <section className="border border-dashed border-border px-5 py-10 text-left">
    <h2 className="font-semibold text-ink">{title}</h2>
    <p className="mt-1 max-w-[70ch] text-sm text-muted">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </section>
)

export const ProgressBar = ({ value, label, className = '' }: { value: number; label: string; className?: string }) => (
  <div
    role="progressbar"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.max(0, Math.min(100, value))}
    className={`h-1.5 overflow-hidden bg-raised ${className}`}
  >
    <div className="h-full bg-accent transition-[width] duration-200 ease-out" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
  </div>
)

export const useDisclosure = (initial = false) => {
  const [open, setOpen] = useState(initial)
  return { open, show: () => setOpen(true), hide: () => setOpen(false), toggle: () => setOpen((value) => !value) }
}
