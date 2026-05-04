interface SkeletonProps {
  className?: string
  count?: number
}

export function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={[
            'animate-pulse rounded-[var(--as-radius-sm)] bg-[var(--as-bg-elevated)]',
            className,
          ].join(' ')}
        />
      ))}
    </>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] p-4">
      <Skeleton className="h-3.5 w-1/3 mb-3" />
      <Skeleton className="h-2.5 w-full mb-1.5" />
      <Skeleton className="h-2.5 w-2/3 mb-3" />
      <div className="flex gap-2">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-7 w-20" />
      </div>
    </div>
  )
}

export function SkeletonTimeline() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-1.5 w-1.5 rounded-full" />
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-2.5 w-full" />
        </div>
      ))}
    </div>
  )
}
