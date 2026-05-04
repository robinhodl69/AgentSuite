import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../lib/auth-context'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, login, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const destination =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof location.state.from === 'string'
      ? location.state.from
      : '/erp'

  if (!loading && user) {
    return <Navigate to={destination} replace />
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login(email, password)
      navigate(destination, { replace: true })
    } catch (loginError: unknown) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--as-bg-base)] px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--as-accent)] font-mono">
            The Agentic ERP
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--as-text-primary)]">
            Sign in to AgentSuite
          </h1>
          <p className="text-sm leading-6 text-[var(--as-text-secondary)]">
            Access the Finance workspace with your invite-only account.
          </p>
        </div>

        <Card className="space-y-4">
          <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--as-text-muted)] font-mono" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)] px-3 py-2 text-sm text-[var(--as-text-primary)] outline-none transition focus:border-[var(--as-accent-border)]"
                placeholder="finance@company.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--as-text-muted)] font-mono" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)] px-3 py-2 text-sm text-[var(--as-text-primary)] outline-none transition focus:border-[var(--as-accent-border)]"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            {error ? (
              <div className="rounded-[var(--as-radius-md)] border border-[var(--as-error)]/15 bg-[var(--as-error-subtle)] px-3 py-2 text-xs text-[var(--as-error)]">
                {error}
              </div>
            ) : null}

            <Button type="submit" className="w-full" isLoading={submitting}>
              Sign in
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
