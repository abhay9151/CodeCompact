import type { ChatMessage } from '../types'
import type { Problem } from '../types'
import { api } from '../lib/api'

export const chatWithTutor = async (input: {
  messages: ChatMessage[]
  title: string
  description: string
  testCases: NonNullable<Problem['visibleTestCases']>
  startCode: NonNullable<Problem['startCode']>
}): Promise<string> => {
  const { data } = await api.post<{ message: string }>('/ai/chat', input)
  return data.message
}
