import React, { useContext, useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import './TopNavbar.css'
import AutocompleteSearch from '../SearchBar/AutocompleteSearch'

export default function TopNavbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useContext(AuthContext)
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const adminMenuRef = useRef(null)
  const userMenuRef = useRef(null)

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setAdminMenuOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const menuItems = [
    { path: '/', icon: 'fas fa-home', label: 'Inicio' },
    { path: '/user/discover', icon: 'fas fa-compass', label: 'Descubrir' },
    { path: '/favorites', icon: 'fas fa-heart', label: 'Favoritos' },
    { path: '/friends', icon: 'fas fa-user-friends', label: 'Amigos' },
    { path: '/user/playlists', icon: 'fas fa-list', label: 'Playlists' },
  ]

  const adminItems = [
    { path: '/admin', icon: 'fas fa-gauge', label: 'Dashboard' },
    { path: '/admin/artists', icon: 'fas fa-microphone', label: 'Artistas' },
    { path: '/admin/albums', icon: 'fas fa-compact-disc', label: 'Álbumes' },
    { path: '/admin/songs', icon: 'fas fa-music', label: 'Canciones' },
    { path: '/admin/users', icon: 'fas fa-users', label: 'Usuarios' },
    { path: '/admin/upload', icon: 'fas fa-upload', label: 'Carga Masiva' },
  ]

  const handleAdminMenuClick = (path) => {
    navigate(path)
    setAdminMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
  }

  return (
    <nav className="TopNavbar">
      <div className="TopNavbar__container">
        {/* Logo y Brand */}
        <Link to="/" className="TopNavbar__brand">
          <img 
            src="/Logo2.png" 
            alt="BeatWave" 
            className="TopNavbar__logo" 
            onError={(e) => { e.currentTarget.src = '/placeholder-album.svg' }} 
          />
          <span className="TopNavbar__brandText">BeatWave</span>
        </Link>

        {/* Botón hamburguesa para móvil */}
        <button 
          className="TopNavbar__hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menú"
        >
          <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>

        {/* Menú principal */}
        <div className={`TopNavbar__menu ${mobileMenuOpen ? 'TopNavbar__menu--open' : ''}`}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`TopNavbar__menuItem ${location.pathname === item.path ? 'TopNavbar__menuItem--active' : ''}`}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </Link>
          ))}

          {/* Menú Admin (desplegable) */}
          {user?.role === 'admin' && (
            <div className="TopNavbar__dropdown" ref={adminMenuRef}>
              <button
                className={`TopNavbar__menuItem TopNavbar__menuItem--dropdown ${adminMenuOpen ? 'TopNavbar__menuItem--active' : ''}`}
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
              >
                <i className="fas fa-tools"></i>
                <span>Administración</span>
                <i className={`fas fa-chevron-down TopNavbar__dropdownIcon ${adminMenuOpen ? 'TopNavbar__dropdownIcon--open' : ''}`}></i>
              </button>

              {adminMenuOpen && (
                <div className="TopNavbar__dropdownMenu">
                  {adminItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleAdminMenuClick(item.path)}
                      className={`TopNavbar__dropdownItem ${location.pathname === item.path ? 'TopNavbar__dropdownItem--active' : ''}`}
                    >
                      <i className={item.icon}></i>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Barra de búsqueda */}
        <div className="TopNavbar__search">
          <AutocompleteSearch placeholder="Buscar canciones, artistas..." submitPath="/user" />
        </div>

        {/* Usuario y acciones */}
        <div className="TopNavbar__actions">
          {user ? (
            <div className="TopNavbar__dropdown" ref={userMenuRef}>
              <button
                className="TopNavbar__userButton"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <i className="fas fa-user-circle"></i>
                <span className="TopNavbar__userName">{user.username}</span>
                <i className={`fas fa-chevron-down TopNavbar__dropdownIcon ${userMenuOpen ? 'TopNavbar__dropdownIcon--open' : ''}`}></i>
              </button>

              {userMenuOpen && (
                <div className="TopNavbar__dropdownMenu TopNavbar__dropdownMenu--right">
                  <Link
                    to="/user/profile"
                    className="TopNavbar__dropdownItem"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <i className="fas fa-user"></i>
                    <span>Mi Perfil</span>
                  </Link>
                  <div className="TopNavbar__divider"></div>
                  <button
                    onClick={handleLogout}
                    className="TopNavbar__dropdownItem TopNavbar__dropdownItem--danger"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="TopNavbar__authButtons">
              <Link to="/login" className="TopNavbar__btn TopNavbar__btn--ghost">
                <i className="fas fa-sign-in-alt"></i>
                <span>Iniciar Sesión</span>
              </Link>
              <Link to="/register" className="TopNavbar__btn TopNavbar__btn--primary">
                <i className="fas fa-user-plus"></i>
                <span>Registrarse</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
