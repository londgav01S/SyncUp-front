import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getFavorites, exportFavoritesToCSV } from '../../api/favoriteService'
import SongCard from '../../components/SongCard/SongCard'
import './Favorites.css'

export default function Favorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // TODO: Obtener email del usuario autenticado desde contexto
      // Por ahora, usamos un placeholder
      const userEmail = localStorage.getItem('userEmail') || 'test@example.com'
      
      const favs = await getFavorites(userEmail)
      setFavorites(favs)
    } catch (err) {
      console.error('Error cargando favoritos:', err)
      setError('No se pudieron cargar los favoritos')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    const today = new Date().toISOString().split('T')[0]
    exportFavoritesToCSV(favorites, `favoritos-${today}.csv`)
  }

  if (loading) {
    return (
      <div className="FavoritesPage">
        <div className="Favorites__loading">
          <div className="spinner"></div>
          <p>Cargando favoritos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="FavoritesPage">
        <div className="Favorites__error">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={loadFavorites} className="btn-retry">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="FavoritesPage">
      {/* Header */}
      <div className="Favorites__header">
        <div className="Favorites__headerContent">
          <h1 className="Favorites__title">❤️ Mis Favoritos</h1>
          <p className="Favorites__subtitle">
            {favorites.length} {favorites.length === 1 ? 'canción' : 'canciones'}
          </p>
        </div>
        
        {favorites.length > 0 && (
          <button 
            onClick={handleExportCSV}
            className="Favorites__exportBtn"
            title="Exportar a CSV"
          >
            📊 Exportar CSV
          </button>
        )}
      </div>

      {/* Content */}
      {favorites.length === 0 ? (
        <div className="Favorites__empty">
          <div className="Favorites__emptyIcon">🎵</div>
          <h2>No tienes favoritos aún</h2>
          <p>Comienza a agregar canciones que te gusten</p>
          <Link to="/" className="Favorites__emptyLink">
            Explorar música
          </Link>
        </div>
      ) : (
        <div className="Favorites__grid">
          {favorites.map(song => (
            <Link 
              key={song.id || song._id} 
              to={`/songs/${song.id || song._id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <SongCard song={song} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
