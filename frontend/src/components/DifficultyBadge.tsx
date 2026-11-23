import type { Problem } from '../types'

const textStyles: Record<Problem['difficulty'], string> = {
  easy: 'text-accent',
  medium: 'text-medium-ink',
  hard: 'text-hard-ink',
}

const dotStyles: Record<Problem['difficulty'], string> = {
  easy: 'bg-accent',
  medium: 'bg-medium',
  hard: 'bg-hard',
}

export const DifficultyBadge = ({ difficulty }: { difficulty: Problem['difficulty'] }) => (
  <span className={`inline-flex items-center gap-1.5 text-xs font-medium capitalize ${textStyles[difficulty]}`}>
    <span aria-hidden="true" className={`size-1.5 rounded-full ${dotStyles[difficulty]}`} />
    {difficulty}
  </span>
)
