import { useEffect, useState } from 'react'

export interface AdminToastState {
  message: string
  variant: 'success' | 'error'
}

export const useAdminToast = () => {
  const [toast, setToast] = useState<AdminToastState>()

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(undefined), 5000)
    return () => window.clearTimeout(timer)
  }, [toast])

  return {
    toast,
    showToast: (message: string, variant: AdminToastState['variant'] = 'success') => {
      setToast({ message, variant })
    },
    dismissToast: () => setToast(undefined),
  }
}
