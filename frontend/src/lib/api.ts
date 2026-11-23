import axios from 'axios'
import { queryClient } from './queryClient'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = error.config?.url ?? ''
      if (requestUrl !== '/user/check' && requestUrl !== '/user/login') {
        queryClient.removeQueries({ queryKey: ['auth', 'me'] })
      }
    }
    return Promise.reject(error)
  },
)
