import { useEffect, useState } from 'react'

export function useScrollDepth(limit = 240) {
  const [scrollDepth, setScrollDepth] = useState(0)

  useEffect(() => {
    let frameId = 0

    const update = () => {
      frameId = 0
      setScrollDepth(Math.min(window.scrollY, limit))
    }

    const onScroll = () => {
      if (frameId !== 0) return
      frameId = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId)
      }
      window.removeEventListener('scroll', onScroll)
    }
  }, [limit])

  return scrollDepth
}
