import React, { createContext, useEffect, useMemo, useState } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }){
  // Initialize from localStorage to persist session across reloads
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('auth:user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  // Persist any change to user
  useEffect(() => {
    if (user) {
      localStorage.setItem('auth:user', JSON.stringify(user))
    } else {
      localStorage.removeItem('auth:user')
    }
  }, [user])

  const login = (u) => setUser(u)
  const logout = () => setUser(null)

  const isAuthenticated = !!user

  const value = useMemo(() => ({ user, isAuthenticated, login, logout }), [user, isAuthenticated])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
