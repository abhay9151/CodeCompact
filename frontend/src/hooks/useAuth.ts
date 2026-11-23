import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { getCurrentUser, login, logout, signup } from '../api/auth'
import type { LoginInput, SignupInput } from '../api/auth'
import type { User } from '../types'

export const authMeQueryKey = ['auth', 'me'] as const

export const useAuth = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [isLoginSuccess, setIsLoginSuccess] = useState(false)
  const userQuery = useQuery({
    queryKey: authMeQueryKey,
    queryFn: getCurrentUser,
  })

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onMutate: () => setIsLoginSuccess(false),
    onSuccess: async ({ user }) => {
      queryClient.setQueryData<User>(authMeQueryKey, user)
      setIsLoginSuccess(true)
      await new Promise((resolve) => window.setTimeout(resolve, 350))
      await navigate({ to: '/problems' })
    },
    onError: () => setIsLoginSuccess(false),
  })

  const signupMutation = useMutation({
    mutationFn: (input: SignupInput) => signup(input),
    onSuccess: async ({ user }) => {
      queryClient.setQueryData<User>(authMeQueryKey, user)
      await navigate({ to: '/problems' })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: authMeQueryKey })
      await navigate({ to: '/login' })
    },
  })

  return {
    user: userQuery.data,
    isAuthenticated: Boolean(userQuery.data),
    isLoading: userQuery.isLoading,
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    loginError: loginMutation.error,
    signupError: signupMutation.error,
    isLoggingIn: loginMutation.isPending,
    isLoginSuccess,
    isSigningUp: signupMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  }
}
