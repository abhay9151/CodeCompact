import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ConfirmDialogProps {
  title: string
  description: ReactNode
  confirmLabel: string
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}

export const ConfirmDialog = ({
  title,
  description,
  confirmLabel,
  isPending,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    cancelRef.current?.focus()
    return () => dialog.close()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      onCancel={(event) => {
        event.preventDefault()
        if (!isPending) onCancel()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !isPending) {
          event.preventDefault()
          onCancel()
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !isPending) onCancel()
      }}
      className="fixed m-auto w-[min(32rem,calc(100vw-2rem))] max-w-none rounded-modal border border-border bg-surface p-0 text-left text-ink backdrop:bg-page/80"
    >
      <section className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="confirm-dialog-title" className="text-lg font-semibold text-ink">{title}</h2>
            <div id="confirm-dialog-description" className="mt-2 text-sm leading-6 text-muted">{description}</div>
          </div>
          <button type="button" aria-label="Close confirmation" disabled={isPending} onClick={onCancel} className="rounded-md p-1 text-muted hover:bg-raised disabled:opacity-50"><X size={16} aria-hidden="true" /></button>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button ref={cancelRef} type="button" disabled={isPending} onClick={onCancel} className="min-h-11 rounded-md border border-border px-4 py-2 text-sm font-medium text-ink disabled:opacity-50">Cancel</button>
          <button type="button" disabled={isPending} onClick={onConfirm} className="min-h-11 rounded-md border border-danger bg-danger px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{isPending ? 'Working…' : confirmLabel}</button>
        </div>
      </section>
    </dialog>
  )
}
