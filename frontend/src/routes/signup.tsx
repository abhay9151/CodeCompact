import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AuthLayout } from '../components/auth/AuthLayout'
import { Toast } from '../components/Toast'
import { useAuth } from '../hooks/useAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { getErrorMessage } from '../lib/errors'
import { userNameSchema } from '../lib/nameSchema'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

const signupSchema = z.object({
  ...userNameSchema.shape,
  emailId: z.string().trim().email('Enter a valid email address'),
  password: z.string()
    .min(8, 'Use at least 8 characters')
    .regex(/[a-z]/, 'Include a lowercase letter')
    .regex(/[A-Z]/, 'Include an uppercase letter')
    .regex(/[0-9]/, 'Include a number')
    .regex(/[^A-Za-z0-9]/, 'Include a symbol'),
})

type SignupValues = z.infer<typeof signupSchema>

function SignupPage() {
  useDocumentTitle('Create account | CodeCompact')
  const { signup, isSigningUp } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [capsLockOn, setCapsLockOn] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { firstName: '', lastName: '', emailId: '', password: '' },
  })
  const firstName = watch('firstName', '')
  const lastName = watch('lastName') ?? ''
  const passwordRegistration = register('password')

  const onSubmit = async (values: SignupValues) => {
    setServerError('')
    try {
      await signup(values)
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to create your account. Check the details and try again.')
      if (message.startsWith('First name')) {
        setError('firstName', { type: 'server', message })
      } else if (message.startsWith('Last name')) {
        setError('lastName', { type: 'server', message })
      } else {
        setServerError(message)
      }
    }
  }

  return (
    <AuthLayout>
      <div>
        <h1 className="auth-page-enter text-4xl leading-[1.08] tracking-tight text-ink">Create an account</h1>
        <p data-delay="1" className="auth-page-enter mt-3 max-w-[68ch] text-base leading-[1.65] text-muted">
          Save solved problems and build a revision routine that fits your pace.
        </p>

        {serverError && <div className="mt-5"><Toast message={serverError} variant="error" /></div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-3">
          <div className="auth-field auth-page-enter" data-delay="2">
            <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-ink">First name</label>
            <input
              id="firstName"
              autoComplete="given-name"
              maxLength={25}
              aria-invalid={Boolean(errors.firstName)}
              aria-describedby={`firstName-count${errors.firstName ? ' firstName-error' : ''}`}
              placeholder="Alex"
              className="raised-surface w-full rounded-lg bg-surface px-3 text-base text-ink outline-none placeholder:text-muted"
              {...register('firstName')}
            />
            <p id="firstName-count" className={`mt-0.5 text-xs ${firstName.length >= 25 ? 'text-danger' : 'text-muted'}`}>{firstName.length} / 25</p>
            {errors.firstName && <p id="firstName-error" role="alert" className="mt-1 text-sm text-danger">{errors.firstName.message}</p>}
          </div>

          <div className="auth-field auth-page-enter" data-delay="3">
            <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-ink">Last name <span className="text-muted">(optional)</span></label>
            <input
              id="lastName"
              autoComplete="family-name"
              maxLength={25}
              aria-invalid={Boolean(errors.lastName)}
              aria-describedby={`lastName-count${errors.lastName ? ' lastName-error' : ''}`}
              placeholder="Jordan"
              className="raised-surface w-full rounded-lg bg-surface px-3 text-base text-ink outline-none placeholder:text-muted"
              {...register('lastName')}
            />
            <p id="lastName-count" className={`mt-0.5 text-xs ${lastName.length >= 25 ? 'text-danger' : 'text-muted'}`}>{lastName.length} / 25</p>
            {errors.lastName && <p id="lastName-error" role="alert" className="mt-1 text-sm text-danger">{errors.lastName.message}</p>}
          </div>

          <div className="auth-field auth-page-enter" data-delay="4">
            <label htmlFor="emailId" className="mb-1.5 block text-sm font-medium text-ink">Email address</label>
            <input
              id="emailId"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.emailId)}
              aria-describedby={errors.emailId ? 'emailId-error' : undefined}
              placeholder="you@example.com"
              className="raised-surface w-full rounded-lg bg-surface px-3 text-base text-ink outline-none placeholder:text-muted"
              {...register('emailId')}
            />
            {errors.emailId && <p id="emailId-error" role="alert" className="mt-1 text-sm text-danger">{errors.emailId.message}</p>}
          </div>

          <div className="auth-field auth-page-enter" data-delay="5">
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={[
                  errors.password ? 'password-error' : 'password-hint',
                  capsLockOn ? 'caps-lock-warning' : '',
                ].filter(Boolean).join(' ')}
                placeholder="Create a strong password"
                className="raised-surface w-full rounded-lg bg-surface py-2 pl-3 pr-14 text-base text-ink outline-none placeholder:text-muted"
                {...passwordRegistration}
                onKeyDown={(event) => setCapsLockOn(event.getModifierState('CapsLock'))}
                onKeyUp={(event) => setCapsLockOn(event.getModifierState('CapsLock'))}
                onBlur={(event) => {
                  passwordRegistration.onBlur(event)
                  setCapsLockOn(false)
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute inset-y-0 right-0 grid min-h-11 w-11 place-items-center rounded-md text-muted hover:text-ink"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
            {errors.password
              ? <p id="password-error" role="alert" className="mt-1 text-sm text-danger">{errors.password.message}</p>
              : <p id="password-hint" className="mt-1 text-xs text-muted">Use at least 8 characters with upper, lower, number, and symbol.</p>}
            {capsLockOn && <p id="caps-lock-warning" role="status" className="mt-1.5 text-sm text-highlight">Caps Lock is on.</p>}
          </div>

          <button type="submit" disabled={isSigningUp} className="auth-primary-button auth-page-enter mt-1 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 text-base font-semibold" data-delay="6">
            {isSigningUp && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
            {isSigningUp ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p data-delay="6" className="auth-page-enter mt-5 text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent hover:underline">Log in</Link>
        </p>
      </div>
    </AuthLayout>
  )
}
