import type { ApiLanguage, RunResult, Submission, SubmitResult } from '../types'
import { api } from '../lib/api'

export const runSubmission = async (
  problemId: string,
  code: string,
  language: ApiLanguage,
): Promise<RunResult> => {
  const { data } = await api.post<RunResult>(`/submission/run/${problemId}`, { code, language })
  return data
}

export const submitSolution = async (
  problemId: string,
  code: string,
  language: ApiLanguage,
): Promise<SubmitResult> => {
  const { data } = await api.post<SubmitResult>(`/submission/submit/${problemId}`, { code, language })
  return data
}

export const getSubmissions = async (problemId: string): Promise<Submission[]> => {
  const { data } = await api.get<Submission[]>(`/problem/submittedProblem/${problemId}`)
  return data
}
