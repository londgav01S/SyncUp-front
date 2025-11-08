import React, { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { useSidebar } from '../../context/SidebarContext'
import './Sidebar.css'
import AutocompleteSearch from '../SearchBar/AutocompleteSearch'

export default function Sidebar(){
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { isCollapsed, toggle } = useSidebar();

  const menuItems = [
    { path: '/', icon: 'fas fa-home', label: 'Inicio', tooltip: 'Inicio' },
    { path: '/user/discover', icon: 'fas fa-compass', label: 'Descubrir', tooltip: 'Descubrir' },
    { path: '/user/playlists', icon: 'fas fa-list', label: 'Playlists', tooltip: 'Playlists' },
  ];

  const userItems = user ? [
    ...(user.role === 'admin' ? [{ path: '/admin', icon: 'fas fa-cog', label: 'Admin Panel', tooltip: 'Panel Admin' }] : []),
    { path: '/user/profile', icon: 'fas fa-user', label: 'Perfil', tooltip: 'Mi Perfil' },
  ] : [];

  return (
    <aside className={`Sidebar sidebar ${isCollapsed ? 'Sidebar--collapsed' : ''}`}>
      <div className="Sidebar__brand">
        <Link to="/" className="Sidebar__brandLink">
          <img src="/Logo.png" alt="Estructuras" className="Sidebar__logo" />
          <span className="Sidebar__brand-text">SyncUp</span>
        </Link>
        <button 
          className="Sidebar__toggleBtn" 
          onClick={toggle}
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
        >
          <svg className="Sidebar__toggleIcon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>

      <div className="Sidebar__search">
        {/* Autocomplete search integrated in sidebar - navigates to /user?search=... on Enter */}
        {/* Lazy-load component to avoid circular deps in some setups */}
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <AutocompleteSearch placeholder="Buscar..." submitPath="/user" />
      </div>

      <div className="Sidebar__section">
        <h3 className="Sidebar__section-title">Menú</h3>
        <ul className="Sidebar__list">
          {menuItems.map((item) => (
            <li 
              key={item.path} 
              className="Sidebar__item"
              data-tooltip={item.tooltip}
            >
              <Link 
                to={item.path} 
                className={location.pathname === item.path ? 'active' : ''}
              >
                <i className={item.icon}></i>
                <span className="Sidebar__itemText">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {user && userItems.length > 0 && (
        <div className="Sidebar__section">
          <h3 className="Sidebar__section-title">Tu Música</h3>
          <ul className="Sidebar__list">
            {userItems.map((item) => (
              <li 
                key={item.path} 
                className="Sidebar__item"
                data-tooltip={item.tooltip}
              >
                <Link 
                  to={item.path} 
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  <i className={item.icon}></i>
                  <span className="Sidebar__itemText">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="Sidebar__footer">
        {user ? (
          <button className="Sidebar__btn" onClick={logout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Cerrar Sesión</span>
          </button>
        ) : (
          <div className="Sidebar__auth-buttons">
            <Link to="/login" className="Sidebar__btn">
              <i className="fas fa-sign-in-alt"></i>
              <span>Iniciar Sesión</span>
            </Link>
            <Link to="/register" className="Sidebar__btn Sidebar__btn--accent">
              <i className="fas fa-user-plus"></i>
              <span>Registrarse</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}
