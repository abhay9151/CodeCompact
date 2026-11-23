export type PatternPlatform = 'leetcode' | 'gfg' | 'other'

export interface PatternQuestion {
  _id: string
  title: string
  platform: PatternPlatform
  url: string
  solved: boolean
  solvedAt: string | null
  markedForRevision: boolean
  revisionCount: number
  lastRevisedAt: string | null
}

export interface PatternSection {
  pattern: string
  patternOrder: number
  questions: PatternQuestion[]
}

export interface SheetResponse {
  patterns: PatternSection[]
  stats: {
    total: number
    solved: number
    markedForRevision: number
  }
}

export interface RevisionQuestion extends PatternQuestion {
  pattern: string
}

export interface PickResponse {
  available: number
  questions: RevisionQuestion[]
}
