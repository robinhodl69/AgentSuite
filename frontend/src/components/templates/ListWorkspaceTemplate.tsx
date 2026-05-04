import type { ReactNode } from 'react'

type ListWorkspaceTemplateProps = {
  intro?: ReactNode
  metrics?: ReactNode
  filters?: ReactNode
  side?: ReactNode
  children: ReactNode
}

export function ListWorkspaceTemplate({
  intro,
  metrics,
  filters,
  side,
  children,
}: ListWorkspaceTemplateProps) {
  return (
    <section className="space-y-6 lg:space-y-7">
      {intro}
      {metrics}
      {side ? (
        <div className="grid gap-6 lg:gap-7 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6 lg:space-y-7">
            {filters}
            {children}
          </div>
          <aside className="space-y-6">{side}</aside>
        </div>
      ) : (
        <div className="space-y-6 lg:space-y-7">
          {filters}
          {children}
        </div>
      )}
    </section>
  )
}
