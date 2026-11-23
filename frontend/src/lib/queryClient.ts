import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        const status = 'response' in error
          ? (error.response as { status?: number } | undefined)?.status
          : undefined
        if (status === 401 || status === 403 || status === 404) return false
        return failureCount < 3
      },
    },
    mutations: {
      retry: false,
    },
  },
})
