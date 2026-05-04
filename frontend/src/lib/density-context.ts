import { createContext, useContext } from 'react'

type Density = 'compact' | 'standard' | 'relaxed'

interface DensityContextValue {
  density: Density
  setDensity: (density: Density) => void
}

export const DensityContext = createContext<DensityContextValue | null>(null)

export function useDensity(): DensityContextValue {
  const context = useContext(DensityContext)
  if (!context) {
    throw new Error('useDensity must be used within a DensityProvider')
  }
  return context
}

export type { Density, DensityContextValue }
