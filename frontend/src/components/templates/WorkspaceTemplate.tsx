import type { ReactNode } from 'react'

type WorkspaceTemplateProps = {
  intro?: ReactNode
  secondary?: ReactNode
  children: ReactNode
}

export function WorkspaceTemplate({ intro, secondary, children }: WorkspaceTemplateProps) {
  return (
    <section className="space-y-8 lg:space-y-10">
      {intro}
      {secondary ? (
        <div className="grid gap-7 lg:gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-7 lg:space-y-8">{children}</div>
          <aside className="space-y-7">{secondary}</aside>
        </div>
      ) : (
        children
      )}
    </section>
  )
}
