import { useState, useEffect } from 'react'

export const useResponsiveSizes = () => {
  const [sizes, setSizes] = useState({
    smallPhone: false,
    phone: false,
    tabPort: false,
    tabLand: false,
    desktop: false,
    bigDesktop: false,
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setSizes({
        smallPhone: width <= 30 * 16,
        phone: width <= 37.5 * 16,
        tabPort: width <= 56.25 * 16,
        tabLand: width <= 75 * 16,
        desktop: width >= 56.25 * 16,
        bigDesktop: width >= 112.5 * 16,
      })
    }

    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return { sizes }
}
