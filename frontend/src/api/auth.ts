import type { ApiMessage, AuthResponse, User } from '../types'
import { api } from '../lib/api'

export interface LoginInput {
  emailId: string
  password: string
}

export interface SignupInput extends LoginInput {
  firstName: string
  lastName?: string
}

export const getCurrentUser = async (): Promise<User> => {
  const { data } = await api.get<{ user: User; message: string }>('/user/check')
  return data.user
}

export const login = async (input: LoginInput): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/user/login', input)
  return data
}

export const signup = async (input: SignupInput): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/user/register', input)
  return data
}

export const logout = async (): Promise<ApiMessage> => {
  const { data } = await api.post<ApiMessage>('/user/logout')
  return data
}
