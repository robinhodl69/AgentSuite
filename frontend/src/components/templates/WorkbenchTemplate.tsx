import type { ReactNode } from 'react'

type WorkbenchTemplateProps = {
  intro?: ReactNode
  processRail?: ReactNode
  side?: ReactNode
  children: ReactNode
}

export function WorkbenchTemplate({
  intro,
  processRail,
  side,
  children,
}: WorkbenchTemplateProps) {
  return (
    <section className="space-y-6 lg:space-y-7">
      {intro}
      {processRail}
      {side ? (
        <div className="grid gap-6 lg:gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6 lg:space-y-7">{children}</div>
          <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">{side}</aside>
        </div>
      ) : (
        children
      )}
    </section>
  )
}
