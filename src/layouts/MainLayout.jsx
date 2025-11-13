import React from 'react'
import { Outlet } from 'react-router-dom'
import TopNavbar from '../components/TopNavbar/TopNavbar'
import Player from '../components/Player/Player'
import usePlayer from '../hooks/usePlayer'
import './MainLayout.css'

export default function MainLayout(){
  const { current } = usePlayer()
  
  const isPlayerVisible = current !== null

  return (
    <div className="MainLayout">
      <TopNavbar />
      <div className="MainLayout__body">
        <main className={`MainLayout__content 
          ${isPlayerVisible ? 'MainLayout__content--playerVisible' : 'MainLayout__content--playerHidden'}`}>
          <Outlet />
        </main>
      </div>
      {/* Global player mounted outside the main content so it's always available */}
      <Player />
    </div>
  )
}
