export type UserRole = 'user' | 'admin'

export interface User {
  _id: string
  firstName: string
  lastName?: string
  emailId: string
  role: UserRole
}

export interface TestCase {
  input: string
  output: string
  explanation?: string
}

export interface StartCode {
  language: 'C++' | 'Java' | 'JavaScript'
  initialCode: string
}

export interface ReferenceSolution {
  language: StartCode['language']
  completeCode: string
}

export interface Problem {
  _id: string
  title: string
  description?: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string
  visibleTestCases?: TestCase[]
  hiddenTestCases?: TestCase[]
  startCode?: StartCode[]
  referenceSolution?: ReferenceSolution[]
  secureUrl?: string
  thumbnailUrl?: string
  duration?: number
}

export type ApiLanguage = 'javascript' | 'java' | 'cpp' | 'c++'
export type EditorLanguage = 'JavaScript' | 'Java' | 'C++'

export interface Submission {
  _id: string
  userId: string
  problemId: string
  code: string
  language: ApiLanguage
  status: 'pending' | 'accepted' | 'wrong_answer' | 'time_limit' | 'compile_error' | 'runtime_error'
  runtimeMs: number
  memory?: number
  errorMessage?: string
  testCasesPassed: number
  testCasesTotal: number
  createdAt?: string
}

export interface RunResult {
  success: boolean
  testCases: Array<{
    stdin: string
    expected_output: string
    stdout?: string | null
    status_id: number
    status?: { description: string }
    runtimeMs: number
    memory?: number | null
    stderr?: string | null
    compile_output?: string | null
  }>
  runtimeMs: number
  memory: number
}

export interface SubmitResult {
  accepted: boolean
  status: Submission['status']
  totalTestCases: number
  passedTestCases: number
  runtimeMs: number
  memory: number
  errorMessage: string | null
}

export interface ChatMessage {
  role: 'user' | 'model'
  parts: Array<{ text: string }>
}

export interface ApiMessage {
  message: string
}

export interface AuthResponse extends ApiMessage {
  user: User
}
