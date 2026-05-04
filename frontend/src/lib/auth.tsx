import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getCurrentSession, loginRequest, logoutRequest, type AuthUser } from './api/auth'
import { ApiError } from './api/http'
import { AuthContext, type AuthContextValue, useAuth } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    void getCurrentSession()
      .then((response) => {
        if (!cancelled) {
          setUser(response.user)
        }
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return
        }
        if (error instanceof ApiError && error.status === 401) {
          setUser(null)
          return
        }
        setUser(null)
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email, password)
    setUser(response.user)
  }, [])

  const logout = useCallback(async () => {
    await logoutRequest()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      logout,
    }),
    [login, loading, logout, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function RequireAuth() {
  const { loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--as-bg-base)] px-6">
        <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-secondary)] px-5 py-4 text-sm text-[var(--as-text-secondary)]">
          Loading workspace...
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
