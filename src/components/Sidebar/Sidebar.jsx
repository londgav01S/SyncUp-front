import React, { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import './Sidebar.css'

export default function Sidebar(){
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  return (
    <aside className="Sidebar sidebar">
      <div className="Sidebar__brand">
        <Link to="/">
          <img src="/logo.png" alt="Estructuras" className="Sidebar__logo" />
          <span className="Sidebar__brand-text">Estructuras</span>
        </Link>
      </div>

      <div className="Sidebar__search">
        <i className="fas fa-search"></i>
        <input type="search" placeholder="Buscar..." />
      </div>

      <div className="Sidebar__section">
        <h3 className="Sidebar__section-title">Menú</h3>
        <ul className="Sidebar__list">
          <li className="Sidebar__item">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              <i className="fas fa-home"></i>
              <span>Inicio</span>
            </Link>
          </li>
          <li className="Sidebar__item">
            <Link to="/user/discover" className={location.pathname === '/user/discover' ? 'active' : ''}>
              <i className="fas fa-compass"></i>
              <span>Descubrir</span>
            </Link>
          </li>
          <li className="Sidebar__item">
            <Link to="/user/playlists" className={location.pathname === '/user/playlists' ? 'active' : ''}>
              <i className="fas fa-list"></i>
              <span>Playlists</span>
            </Link>
          </li>
        </ul>
      </div>

      {user && (
        <div className="Sidebar__section">
          <h3 className="Sidebar__section-title">Tu Música</h3>
          <ul className="Sidebar__list">
            {user.role === 'admin' && (
              <li className="Sidebar__item">
                <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
                  <i className="fas fa-cog"></i>
                  <span>Admin Panel</span>
                </Link>
              </li>
            )}
            <li className="Sidebar__item">
              <Link to="/user/profile" className={location.pathname === '/user/profile' ? 'active' : ''}>
                <i className="fas fa-user"></i>
                <span>Perfil</span>
              </Link>
            </li>
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
