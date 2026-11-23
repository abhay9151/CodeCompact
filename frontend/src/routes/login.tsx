import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AuthLayout } from '../components/auth/AuthLayout'
import { Toast } from '../components/Toast'
import { useAuth } from '../hooks/useAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { getErrorMessage } from '../lib/errors'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

const loginSchema = z.object({
  emailId: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
})

type LoginValues = z.infer<typeof loginSchema>

function LoginPage() {
  useDocumentTitle('Log in | CodeCompact')
  const { login, isLoggingIn, isLoginSuccess } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [errorAttempt, setErrorAttempt] = useState(0)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { emailId: '', password: '' },
  })
  const passwordRegistration = register('password')

  const onSubmit = async (values: LoginValues) => {
    setServerError('')
    try {
      await login(values)
    } catch (error) {
      setServerError(getErrorMessage(error, 'Unable to log in. Check your details and try again.'))
      setErrorAttempt((attempt) => attempt + 1)
    }
  }

  return (
    <AuthLayout>
      <div>
        <h1 className="auth-page-enter text-4xl leading-[1.08] tracking-tight text-ink">Log in</h1>
        <p data-delay="1" className="auth-page-enter mt-3 max-w-[68ch] text-base leading-[1.65] text-muted">
          Pick up where you left off. Your solved problems and revision list are saved.
        </p>

        {serverError && (
          <div key={errorAttempt} className="auth-shake mt-6">
            <Toast message={serverError} variant="error" />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
          <div className="auth-field auth-page-enter" data-delay="2">
            <label htmlFor="emailId" className="mb-2 block text-sm font-medium text-ink">Email address</label>
            <input
              id="emailId"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.emailId)}
              aria-describedby={errors.emailId ? 'emailId-error' : undefined}
              placeholder="you@example.com"
              className="raised-surface w-full rounded-lg bg-surface px-4 text-base text-ink outline-none placeholder:text-muted"
              {...register('emailId')}
            />
            {errors.emailId && <p id="emailId-error" role="alert" className="mt-1.5 text-sm text-danger">{errors.emailId.message}</p>}
          </div>

          <div className="auth-field auth-page-enter" data-delay="3">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-ink">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={[
                  errors.password ? 'password-error' : '',
                  capsLockOn ? 'caps-lock-warning' : '',
                ].filter(Boolean).join(' ') || undefined}
                placeholder="Your password"
                className="raised-surface w-full rounded-lg bg-surface py-2 pl-4 pr-14 text-base text-ink outline-none placeholder:text-muted"
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
            {errors.password && <p id="password-error" role="alert" className="mt-1.5 text-sm text-danger">{errors.password.message}</p>}
            {capsLockOn && <p id="caps-lock-warning" role="status" className="mt-1.5 text-sm text-highlight">Caps Lock is on.</p>}
          </div>

          <button type="submit" disabled={isLoggingIn} className="auth-primary-button auth-page-enter inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 text-base font-semibold" data-delay="4">
            {isLoginSuccess
              ? <><CheckCircle2 size={18} aria-hidden="true" />Signed in</>
              : isLoggingIn
                ? <><LoaderCircle size={18} className="animate-spin" aria-hidden="true" />Signing in…</>
                : 'Log in'}
          </button>
        </form>

        <p data-delay="5" className="auth-page-enter mt-6 text-sm text-muted">
          Need an account?{' '}
          <Link to="/signup" className="font-semibold text-accent hover:underline">Create one</Link>
        </p>
      </div>
    </AuthLayout>
  )
}
