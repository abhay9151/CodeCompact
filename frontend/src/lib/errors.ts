import axios from 'axios'

const extractMessage = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'message' in value) {
    return typeof value.message === 'string' ? value.message : undefined
  }
  return undefined
}

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data
    if (typeof data === 'object' && data !== null) {
      const message = ('message' in data ? extractMessage(data.message) : undefined)
        ?? ('error' in data ? extractMessage(data.error) : undefined)
      return message ?? fallback
    }
    return fallback
  }
  return error instanceof Error ? error.message : fallback
}
