import type { PickResponse, SheetResponse } from '../types/patterns'
import { api } from '../lib/api'

export type RevisionMode = 'smart' | 'random'

export const getSheet = async (): Promise<SheetResponse> => {
  const { data } = await api.get<SheetResponse>('/pattern/sheet')
  return data
}

export const setSolved = async (id: string, solved: boolean): Promise<void> => {
  await api.patch(`/pattern/question/${id}/solved`, { solved })
}

export const setRevisionMark = async (id: string, marked: boolean): Promise<void> => {
  await api.patch(`/pattern/question/${id}/revision-mark`, { marked })
}

export const markRevised = async (id: string): Promise<void> => {
  await api.post(`/pattern/question/${id}/revised`)
}

export const pickRevision = async ({
  count,
  mode,
  patterns,
}: {
  count: number
  mode: RevisionMode
  patterns?: string[]
}): Promise<PickResponse> => {
  const { data } = await api.post<PickResponse>('/pattern/revision/pick', {
    count,
    mode,
    patterns,
  })
  return data
}
