import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar/Sidebar'
import SearchBar from '../components/SearchBar/SearchBar'
import './MainLayout.css'

export default function MainLayout(){
  const location = useLocation();
  const showSearch = !location.pathname.includes('/admin');

  return (
    <div className="MainLayout">
      <div className="MainLayout__body">
        <Sidebar />
        <main className="MainLayout__content">
          {showSearch && (
            <div className="MainLayout__search">
              <SearchBar />
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
