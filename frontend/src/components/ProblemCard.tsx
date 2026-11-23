import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import type { Problem } from '../types'
import { DifficultyBadge } from './DifficultyBadge'

export const ProblemCard = ({ problem }: { problem: Problem }) => (
  <Link
    to="/problems/$problemId"
    params={{ problemId: problem._id }}
    className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent"
  >
    <div className="min-w-0">
      <h2 className="truncate font-semibold text-ink">{problem.title}</h2>
      <div className="mt-3 flex items-center gap-2">
        <DifficultyBadge difficulty={problem.difficulty} />
        <span className="truncate text-xs text-muted">{problem.tags}</span>
      </div>
    </div>
    <ArrowUpRight aria-hidden="true" size={18} className="shrink-0 text-muted transition group-hover:text-accent" />
  </Link>
)
