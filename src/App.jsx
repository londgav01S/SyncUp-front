import React from 'react'
import AppRouter from './router/AppRouter'
import { AuthProvider } from './context/AuthContext'
import { PlayerProvider } from './context/PlayerContext'
import { ThemeProvider } from './context/ThemeContext'

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PlayerProvider>
          <AppRouter />
        </PlayerProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
