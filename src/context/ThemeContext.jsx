import React, { createContext, useState } from 'react'

export const ThemeContext = createContext()

export function ThemeProvider({ children }){
  const [dark, setDark] = useState(false)
  const toggle = () => setDark(d => !d)

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}
