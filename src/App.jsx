import React from 'react'
import AppRouter from './router/AppRouter'
import { AuthProvider } from './context/AuthContext'
import { PlayerProvider } from './context/PlayerContext'
import { ThemeProvider } from './context/ThemeContext'
import { SidebarProvider } from './context/SidebarContext'

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SidebarProvider>
          <PlayerProvider>
            <AppRouter />
          </PlayerProvider>
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}



