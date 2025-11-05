import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar/Sidebar'
import Player from '../components/Player/Player'
import './MainLayout.css'

export default function MainLayout(){
  return (
    <div className="MainLayout">
      <div className="MainLayout__body">
        <Sidebar />
        <main className="MainLayout__content">
          <Outlet />
        </main>
      </div>
      {/* Global player mounted outside the main content so it's always available */}
      <Player />
    </div>
  )
}
