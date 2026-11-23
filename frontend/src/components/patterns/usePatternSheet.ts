import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getSheet,
  markRevised,
  setRevisionMark,
  setSolved,
} from '../../api/patterns'
import type { SheetResponse } from '../../types/patterns'

export const patternSheetQueryKey = ['patterns', 'sheet'] as const

export const usePatternSheet = () => useQuery({
  queryKey: patternSheetQueryKey,
  queryFn: getSheet,
})

interface MutationVariables {
  id: string
  value: boolean
}

interface MutationContext {
  previousSheet?: SheetResponse
}

const updateQuestion = (
  sheet: SheetResponse,
  id: string,
  change: (question: SheetResponse['patterns'][number]['questions'][number]) => void,
): SheetResponse => {
  const patterns = sheet.patterns.map((section) => ({
    ...section,
    questions: section.questions.map((question) => {
      if (question._id !== id) return question
      const updated = { ...question }
      change(updated)
      return updated
    }),
  }))
  const questions = patterns.flatMap((section) => section.questions)

  return {
    ...sheet,
    patterns,
    stats: {
      total: questions.length,
      solved: questions.filter((question) => question.solved).length,
      markedForRevision: questions.filter((question) => question.markedForRevision).length,
    },
  }
}

const useOptimisticPatternMutation = (
  request: (id: string, value: boolean) => Promise<void>,
  update: (question: SheetResponse['patterns'][number]['questions'][number], value: boolean) => void,
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, MutationVariables, MutationContext>({
    mutationFn: ({ id, value }) => request(id, value),
    onMutate: async ({ id, value }) => {
      await queryClient.cancelQueries({ queryKey: patternSheetQueryKey })
      const previousSheet = queryClient.getQueryData<SheetResponse>(patternSheetQueryKey)
      if (previousSheet) {
        queryClient.setQueryData(
          patternSheetQueryKey,
          updateQuestion(previousSheet, id, (question) => update(question, value)),
        )
      }
      return { previousSheet }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousSheet) {
        queryClient.setQueryData(patternSheetQueryKey, context.previousSheet)
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: patternSheetQueryKey }),
  })
}

export const usePatternMutations = () => {
  const queryClient = useQueryClient()

  const solved = useOptimisticPatternMutation(
    setSolved,
    (question, value) => {
      question.solved = value
      question.solvedAt = value ? new Date().toISOString() : null
    },
  )
  const mark = useOptimisticPatternMutation(
    setRevisionMark,
    (question, value) => {
      question.markedForRevision = value
    },
  )
  const revised = useMutation({
    mutationFn: markRevised,
    onSettled: () => queryClient.invalidateQueries({ queryKey: patternSheetQueryKey }),
  })

  return { solved, mark, revised }
}
