import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'

const marketingLinks = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/use-cases', label: 'Use cases' },
  { to: '/security', label: 'Security' },
  { to: '/integrations', label: 'Integrations' },
]

export function PublicSiteNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={[
        'fixed top-0 left-0 right-0 z-50 backdrop-blur-xl transition-shadow duration-300',
        scrolled ? 'shadow-[0_4px_24px_rgba(0,0,0,0.4)]' : 'shadow-none',
      ].join(' ')}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.25) 50%, transparent 100%)',
        }}
      />

      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-5 py-3 sm:px-6">
        <Link
          to="/"
          className="text-sm font-semibold tracking-tight text-[var(--as-text-primary)] transition-colors hover:text-[var(--as-accent)]"
        >
          AgentSuite
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {marketingLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  'inline-flex min-h-8 items-center rounded-[var(--as-radius-md)] px-3 text-xs font-medium font-mono uppercase tracking-[0.1em] transition-all duration-200',
                  isActive
                    ? 'text-[var(--as-text-primary)] bg-[var(--as-bg-hover)]'
                    : 'text-[var(--as-text-secondary)] hover:bg-[var(--as-bg-hover)] hover:text-[var(--as-text-primary)]',
                ].join(' ')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="group relative inline-flex min-h-8 items-center overflow-hidden rounded-[var(--as-radius-md)] bg-gradient-to-r from-[#1d4ed8] via-[#3b82f6] to-[#06b6d4] px-3 text-xs font-semibold font-mono uppercase tracking-[0.1em] text-white shadow-[0_0_12px_rgba(59,130,246,0.25)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.45)]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 right-0 h-px z-[1] opacity-60"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
              }}
            />
            <span className="relative z-10 flex items-center gap-1">Login</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

function PublicSiteFooter() {
  return (
    <footer className="relative z-10 mt-20 border-t border-[var(--as-border-default)]/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-sm space-y-2">
          <div className="text-sm font-semibold tracking-tight text-[var(--as-text-primary)]">AgentSuite</div>
          <p className="text-sm leading-6 text-[var(--as-text-secondary)]">
            Mail-first agent operations for enterprise teams that need traceability, approvals, and execution in one workspace.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <div className="space-y-3">
            <div className="text-[11px] font-semibold font-mono uppercase tracking-[0.14em] text-[var(--as-text-muted)]">
              Product
            </div>
            <div className="flex flex-col gap-2 text-sm text-[var(--as-text-secondary)]">
              {marketingLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className="transition-colors hover:text-[var(--as-text-primary)]">
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-[11px] font-semibold font-mono uppercase tracking-[0.14em] text-[var(--as-text-muted)]">
              Platform
            </div>
            <div className="flex flex-col gap-2 text-sm text-[var(--as-text-secondary)]">
              <Link to="/erp/mail" className="transition-colors hover:text-[var(--as-text-primary)]">
                Mail workspace
              </Link>
              <Link to="/erp/create-task" className="transition-colors hover:text-[var(--as-text-primary)]">
                Create task
              </Link>
              <Link to="/erp/integrations" className="transition-colors hover:text-[var(--as-text-primary)]">
                ERP integrations
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-[11px] font-semibold font-mono uppercase tracking-[0.14em] text-[var(--as-text-muted)]">
              Access
            </div>
            <div className="flex flex-col gap-2 text-sm text-[var(--as-text-secondary)]">
              <Link to="/login" className="transition-colors hover:text-[var(--as-text-primary)]">
                Login
              </Link>
              <Link to="/book-demo" className="transition-colors hover:text-[var(--as-text-primary)]">
                Book demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export function PublicSiteLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen text-[var(--as-text-primary)]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="home-gradient" aria-hidden="true" />
        <div className="home-orb home-orb-blue" aria-hidden="true" />
        <div className="home-orb home-orb-violet" aria-hidden="true" />
        <div className="home-orb home-orb-cyan" aria-hidden="true" />
        <div className="home-noise" aria-hidden="true" />
      </div>

      <PublicSiteNav />
      <div className="relative z-10 pt-14">
        {children}
        <PublicSiteFooter />
      </div>
    </main>
  )
}
