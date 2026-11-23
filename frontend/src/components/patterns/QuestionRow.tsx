import { Flag, RefreshCw } from 'lucide-react'
import type { PatternQuestion as PatternQuestionType } from '../../types/patterns'

interface QuestionRowProps {
  question: PatternQuestionType
  onSolvedChange: (solved: boolean) => void
  onRevisionMarkChange: (marked: boolean) => void
  disabled?: boolean
}

const platformName: Record<PatternQuestionType['platform'], string> = {
  leetcode: 'LeetCode',
  gfg: 'GfG',
  other: 'Link',
}

export const QuestionRow = ({
  question,
  onSolvedChange,
  onRevisionMarkChange,
  disabled = false,
}: QuestionRowProps) => (
  <li className="flex min-w-0 items-start gap-3 px-3 py-3 sm:items-center sm:px-4">
    <input
      type="checkbox"
      checked={question.solved}
      onChange={(event) => onSolvedChange(event.target.checked)}
      disabled={disabled}
      aria-label={`Mark ${question.title} ${question.solved ? 'pending' : 'done'}`}
      className="mt-1 size-4 shrink-0 cursor-pointer accent-success disabled:cursor-wait sm:mt-0"
    />
    <a
      href={question.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`min-w-0 flex-1 break-words text-sm font-medium underline-offset-4 hover:text-cyan-700 hover:underline dark:hover:text-cyan-300 ${
        question.solved
          ? 'text-muted line-through'
          : 'text-ink'
      }`}
    >
      {question.title}
    </a>
    <span
      aria-label={platformName[question.platform]}
      title={platformName[question.platform]}
      className="inline-flex shrink-0 rounded-full bg-raised px-2 py-1 text-[10px] font-medium text-muted sm:text-xs"
    >
      {question.platform === 'leetcode' ? (
        <>
          <span className="sm:hidden">LC</span>
          <span className="hidden sm:inline">LeetCode</span>
        </>
      ) : platformName[question.platform]}
    </span>
    {question.revisionCount > 0 && (
      <span
        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"
        aria-label={`Revised ${question.revisionCount} times`}
      >
        <RefreshCw size={12} aria-hidden="true" /> {question.revisionCount}
      </span>
    )}
    <button
      type="button"
      onClick={() => onRevisionMarkChange(!question.markedForRevision)}
      disabled={disabled}
      aria-pressed={question.markedForRevision}
      aria-label={`${question.markedForRevision ? 'Unflag' : 'Flag'} ${question.title} for revision`}
      className={`shrink-0 rounded-lg px-2 py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 disabled:cursor-wait disabled:opacity-60 ${
        question.markedForRevision
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
          : 'text-muted hover:bg-raised'
      }`}
    >
      <Flag size={16} aria-hidden="true" />
      <span className="ml-1 hidden sm:inline">{question.markedForRevision ? 'Flagged' : 'Revise'}</span>
    </button>
  </li>
)
