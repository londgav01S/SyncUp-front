import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import './Navbar.css'

export default function Navbar(){
  const { user, logout } = useContext(AuthContext)
  return (
    <nav className="Navbar navbar">
      <div className="Navbar__brand brand">
        <Link to="/">
          <img src="/logo.png" alt="Estructuras" className="Navbar__logo" />
          <span>Estructuras</span>
        </Link>
      </div>
      <div className="Navbar__actions nav-actions">
        <Link className="Navbar__link" to="/user">Inicio</Link>
        <Link className="Navbar__link" to="/user/discover">Descubrir</Link>
        <Link className="Navbar__link" to="/user/playlists">Playlists</Link>
        {user?.role === 'admin' && <Link className="Navbar__link" to="/admin">Admin</Link>}
        {user ? (
          <>
            <Link className="Navbar__link" to="/user/profile">Perfil</Link>
            <button className="Navbar__btn" onClick={logout}>Salir</button>
          </>
        ) : (
          <>
            <Link className="Navbar__link" to="/login">Login</Link>
            <Link className="Navbar__link" to="/register">Registro</Link>
          </>
        )}
      </div>
    </nav>
  )
}
