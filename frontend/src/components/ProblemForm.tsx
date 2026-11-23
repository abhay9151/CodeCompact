import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import type { Problem } from '../types'

const languages = ['C++', 'Java', 'JavaScript'] as const
const tags = ['array', 'linkedList', 'graph', 'dp', 'string', 'tree', 'math', 'binarySearch', 'stack', 'greedy'] as const

const codeSchema = z.object({
  language: z.enum(languages),
  initialCode: z.string().min(1, 'Start code is required'),
})

const solutionSchema = z.object({
  language: z.enum(languages),
  completeCode: z.string().min(1, 'Reference solution is required'),
})

const problemFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(tags),
  visibleTestCases: z.array(z.object({
    input: z.string().min(1, 'Input is required'),
    output: z.string().min(1, 'Output is required'),
    explanation: z.string().min(1, 'Explanation is required'),
  })).min(1, 'Add at least one visible test case'),
  hiddenTestCases: z.array(z.object({
    input: z.string().min(1, 'Input is required'),
    output: z.string().min(1, 'Output is required'),
  })).min(1, 'Add at least one hidden test case'),
  startCode: z.array(codeSchema).length(languages.length),
  referenceSolution: z.array(solutionSchema).length(languages.length),
}).refine((value) => languages.every((language) => value.startCode.some((item) => item.language === language)), {
  message: 'Start code is required for C++, Java, and JavaScript',
  path: ['startCode'],
}).refine((value) => languages.every((language) => value.referenceSolution.some((item) => item.language === language)), {
  message: 'Reference solutions are required for C++, Java, and JavaScript',
  path: ['referenceSolution'],
})

export type ProblemFormValues = z.infer<typeof problemFormSchema>

interface ProblemFormProps {
  mode: 'create' | 'update'
  initialProblem?: Problem
  isSaving: boolean
  onSubmit: (problem: ProblemFormValues) => Promise<void>
}

const emptyValues: ProblemFormValues = {
  title: '',
  description: '',
  difficulty: 'easy',
  tags: 'array',
  visibleTestCases: [{ input: '', output: '', explanation: '' }],
  hiddenTestCases: [{ input: '', output: '' }],
  startCode: languages.map((language) => ({ language, initialCode: '' })),
  referenceSolution: languages.map((language) => ({ language, completeCode: '' })),
}

const inputClass = 'w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted focus-visible:border-accent'
const labelClass = 'mb-1.5 block text-sm font-medium text-ink'
const sectionClass = 'border border-border bg-surface p-4 sm:p-6'

const fromProblem = (problem?: Problem): ProblemFormValues => {
  if (!problem) return emptyValues
  return {
    title: problem.title,
    description: problem.description ?? '',
    difficulty: problem.difficulty,
    tags: (tags.includes(problem.tags as (typeof tags)[number]) ? problem.tags : 'array') as (typeof tags)[number],
    visibleTestCases: problem.visibleTestCases?.map(({ input, output, explanation }) => ({
      input,
      output,
      explanation: explanation ?? '',
    })) ?? emptyValues.visibleTestCases,
    hiddenTestCases: problem.hiddenTestCases?.map(({ input, output }) => ({ input, output })) ?? emptyValues.hiddenTestCases,
    startCode: languages.map((language) => ({
      language,
      initialCode: problem.startCode?.find((item) => item.language === language)?.initialCode ?? '',
    })),
    referenceSolution: languages.map((language) => ({
      language,
      completeCode: problem.referenceSolution?.find((item) => item.language === language)?.completeCode ?? '',
    })),
  }
}

export const ProblemForm = ({ mode, initialProblem, isSaving, onSubmit }: ProblemFormProps) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProblemFormValues>({
    resolver: zodResolver(problemFormSchema),
    defaultValues: fromProblem(initialProblem),
  })
  const visibleCases = useFieldArray({ control, name: 'visibleTestCases' })
  const hiddenCases = useFieldArray({ control, name: 'hiddenTestCases' })

  useEffect(() => {
    reset(fromProblem(initialProblem))
  }, [initialProblem, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className={sectionClass}>
        <h2 className="text-lg font-semibold text-ink">Problem details</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="problem-title">Title</label>
            <input id="problem-title" className={inputClass} {...register('title')} />
            {errors.title && <p className="mt-1 text-xs text-danger">{errors.title.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="problem-description">Description</label>
            <textarea id="problem-description" rows={6} className={inputClass} {...register('description')} />
            {errors.description && <p className="mt-1 text-xs text-danger">{errors.description.message}</p>}
          </div>
          <div>
            <label className={labelClass} htmlFor="problem-difficulty">Difficulty</label>
            <select id="problem-difficulty" className={inputClass} {...register('difficulty')}>
              <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="problem-tag">Tag</label>
            <select id="problem-tag" className={inputClass} {...register('tags')}>
              {tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-lg font-semibold text-ink">Visible test cases</h2><p className="mt-1 text-sm text-muted">Shown to users with the problem description.</p></div>
          <button type="button" onClick={() => visibleCases.append({ input: '', output: '', explanation: '' })} className="min-h-11 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-ink hover:bg-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Add test case</button>
        </div>
        {errors.visibleTestCases?.root && <p className="mt-3 text-sm text-danger">{errors.visibleTestCases.root.message}</p>}
        <div className="mt-4 space-y-4">
          {visibleCases.fields.map((field, index) => (
            <fieldset key={field.id} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2">
              <legend className="px-1 text-xs font-semibold text-muted">Example {index + 1}</legend>
              <div><label className={labelClass} htmlFor={`visible-input-${index}`}>Input</label><textarea id={`visible-input-${index}`} rows={2} className={inputClass} {...register(`visibleTestCases.${index}.input`)} />{errors.visibleTestCases?.[index]?.input && <p className="mt-1 text-xs text-danger">{errors.visibleTestCases[index]?.input?.message}</p>}</div>
              <div><label className={labelClass} htmlFor={`visible-output-${index}`}>Output</label><textarea id={`visible-output-${index}`} rows={2} className={inputClass} {...register(`visibleTestCases.${index}.output`)} />{errors.visibleTestCases?.[index]?.output && <p className="mt-1 text-xs text-danger">{errors.visibleTestCases[index]?.output?.message}</p>}</div>
              <div className="sm:col-span-2"><label className={labelClass} htmlFor={`visible-explanation-${index}`}>Explanation</label><textarea id={`visible-explanation-${index}`} rows={2} className={inputClass} {...register(`visibleTestCases.${index}.explanation`)} />{errors.visibleTestCases?.[index]?.explanation && <p className="mt-1 text-xs text-danger">{errors.visibleTestCases[index]?.explanation?.message}</p>}</div>
              {visibleCases.fields.length > 1 && <button type="button" onClick={() => visibleCases.remove(index)} className="min-h-11 justify-self-start text-xs font-semibold text-danger">Remove example</button>}
            </fieldset>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-lg font-semibold text-ink">Hidden test cases</h2><p className="mt-1 text-sm text-muted">Used to validate submitted solutions.</p></div>
          <button type="button" onClick={() => hiddenCases.append({ input: '', output: '' })} className="min-h-11 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-ink hover:bg-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Add test case</button>
        </div>
        {errors.hiddenTestCases?.root && <p className="mt-3 text-sm text-danger">{errors.hiddenTestCases.root.message}</p>}
        <div className="mt-4 space-y-4">
          {hiddenCases.fields.map((field, index) => (
            <fieldset key={field.id} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2">
              <legend className="px-1 text-xs font-semibold text-muted">Hidden case {index + 1}</legend>
              <div><label className={labelClass} htmlFor={`hidden-input-${index}`}>Input</label><textarea id={`hidden-input-${index}`} rows={2} className={inputClass} {...register(`hiddenTestCases.${index}.input`)} />{errors.hiddenTestCases?.[index]?.input && <p className="mt-1 text-xs text-danger">{errors.hiddenTestCases[index]?.input?.message}</p>}</div>
              <div><label className={labelClass} htmlFor={`hidden-output-${index}`}>Output</label><textarea id={`hidden-output-${index}`} rows={2} className={inputClass} {...register(`hiddenTestCases.${index}.output`)} />{errors.hiddenTestCases?.[index]?.output && <p className="mt-1 text-xs text-danger">{errors.hiddenTestCases[index]?.output?.message}</p>}</div>
              {hiddenCases.fields.length > 1 && <button type="button" onClick={() => hiddenCases.remove(index)} className="min-h-11 justify-self-start text-xs font-semibold text-danger">Remove case</button>}
            </fieldset>
          ))}
        </div>
      </section>

      {languages.map((language, index) => (
        <section key={language} className={sectionClass}>
          <h2 className="text-lg font-semibold text-ink">{language}</h2>
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor={`start-code-${index}`}>Starting code</label>
              <textarea id={`start-code-${index}`} rows={12} spellCheck={false} className={`${inputClass} font-mono`} {...register(`startCode.${index}.initialCode`)} />
              {errors.startCode?.[index]?.initialCode && <p className="mt-1 text-xs text-danger">{errors.startCode[index]?.initialCode?.message}</p>}
            </div>
            <div>
              <label className={labelClass} htmlFor={`reference-solution-${index}`}>Reference solution</label>
              <textarea id={`reference-solution-${index}`} rows={12} spellCheck={false} className={`${inputClass} font-mono`} {...register(`referenceSolution.${index}.completeCode`)} />
              {errors.referenceSolution?.[index]?.completeCode && <p className="mt-1 text-xs text-danger">{errors.referenceSolution[index]?.completeCode?.message}</p>}
            </div>
          </div>
        </section>
      ))}

      {(errors.startCode?.message || errors.referenceSolution?.message) && (
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {errors.startCode?.message ?? errors.referenceSolution?.message}
        </p>
      )}

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-3 border-t border-border bg-page px-2 py-3">
        {isSaving && <p role="status" className="mr-auto text-sm font-medium text-accent">Validating reference solutions. This can take a few seconds.</p>}
        <button type="submit" disabled={isSaving} className="min-h-11 rounded-md border border-accent-solid bg-accent-solid px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-wait disabled:opacity-60">
          {isSaving ? 'Validating and saving…' : mode === 'create' ? 'Create problem' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
