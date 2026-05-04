import { useState, type ReactNode } from 'react'
import { DensityContext, type Density } from './density-context'

export function DensityProvider({ children }: { children: ReactNode }) {
  const [density, setDensity] = useState<Density>('standard')
  return (
    <DensityContext.Provider value={{ density, setDensity }}>
      <div data-density={density} className="contents">
        {children}
      </div>
    </DensityContext.Provider>
  )
}
