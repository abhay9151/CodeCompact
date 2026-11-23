import type { Problem } from '../types'
import { api } from '../lib/api'

export interface ProblemListResponse {
  problems: Problem[]
  total: number
  page: number
  pages: number
}

export interface ProblemListParams {
  page?: number
  limit?: number
  difficulty?: Problem['difficulty']
  tag?: string
  search?: string
}

export interface SolvedProblem {
  _id: string
  title: string
  difficulty: Problem['difficulty']
  tags: string
}

export const getProblems = async (params?: ProblemListParams): Promise<ProblemListResponse> => {
  const { data } = await api.get<ProblemListResponse>('/problem/getAllProblem', { params })
  return data
}

export const getProblem = async (problemId: string): Promise<Problem> => {
  const { data } = await api.get<Problem>(`/problem/problemById/${problemId}`)
  return data
}

export const getSolvedProblems = async (): Promise<SolvedProblem[]> => {
  const { data } = await api.get<{ problemSolved: SolvedProblem[] }>('/problem/problemSolvedByUser')
  return data.problemSolved
}

export const createProblem = async (problem: Partial<Problem>): Promise<Problem> => {
  const { data } = await api.post<{ problem: Problem }>('/problem/create', problem)
  return data.problem
}

export const updateProblem = async (problemId: string, problem: Partial<Problem>): Promise<Problem> => {
  const { data } = await api.put<{ problem: Problem }>(`/problem/update/${problemId}`, problem)
  return data.problem
}

export const deleteProblem = async (problemId: string): Promise<void> => {
  await api.delete(`/problem/delete/${problemId}`)
}
