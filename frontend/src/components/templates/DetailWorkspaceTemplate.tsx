import type { ReactNode } from 'react'

type DetailWorkspaceTemplateProps = {
  header?: ReactNode
  summary?: ReactNode
  inspector?: ReactNode
  children: ReactNode
}

export function DetailWorkspaceTemplate({
  header,
  summary,
  inspector,
  children,
}: DetailWorkspaceTemplateProps) {
  return (
    <section className="space-y-6 lg:space-y-7">
      {header}
      {summary}
      {inspector ? (
        <div className="grid gap-6 lg:gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6 lg:space-y-7">{children}</div>
          <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">{inspector}</aside>
        </div>
      ) : (
        children
      )}
    </section>
  )
}
