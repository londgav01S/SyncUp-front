import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar/Sidebar'
import Player from '../components/Player/Player'
import { useSidebar } from '../context/SidebarContext'
import usePlayer from '../hooks/usePlayer'
import './MainLayout.css'

export default function MainLayout(){
  const { isCollapsed } = useSidebar()
  const { current } = usePlayer()
  
  const isPlayerVisible = current !== null

  return (
    <div className="MainLayout">
      <div className="MainLayout__body">
        <Sidebar />
        <main className={`MainLayout__content 
          ${isPlayerVisible ? 'MainLayout__content--playerVisible' : 'MainLayout__content--playerHidden'} 
          ${isCollapsed ? 'MainLayout__content--sidebarCollapsed' : ''}`}>
          <Outlet />
        </main>
      </div>
      {/* Global player mounted outside the main content so it's always available */}
      <Player />
    </div>
  )
}
