import { createContext, useContext, useEffect, useState } from 'react'

export const ThemeContext = createContext()

export const ThemeContextProvider = ({ children }) => {
  const theme = localStorage.getItem('algo_theme')
  const [isLight, setIsLight] = useState(theme === 'DARK' ? false : true)

  const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)')

  useEffect(() => {
    if (darkThemeMq.matches) {
      setIsLight(false)
      localStorage.setItem('algo_theme', 'DARK')
    } else {
      setIsLight(true)
      localStorage.setItem('algo_theme', 'LIGHT')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('algo_theme', isLight ? 'LIGHT' : 'DARK')
  }, [isLight])
  return (
    <ThemeContext.Provider value={{ isLight, setIsLight }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useThemeContextValue = () => useContext(ThemeContext)
