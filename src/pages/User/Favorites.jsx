import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { getFavorites, exportFavoritesToCSV, removeFromFavorites } from '../../api/favoriteService'
import { AuthContext } from '../../context/AuthContext'
import SongCard from '../../components/SongCard/SongCard'
import { FaHeart, FaFileDownload, FaMusic, FaTimes, FaExclamationTriangle } from 'react-icons/fa'
import './Favorites.css'

export default function Favorites() {
  const { user } = useContext(AuthContext)
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user?.correo) {
      loadFavorites()
    }
    
    // Escuchar evento de actualización de favoritos
    const handler = () => loadFavorites()
    window.addEventListener('favorites-updated', handler)
    return () => window.removeEventListener('favorites-updated', handler)
  }, [user])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const userEmail = user?.correo || localStorage.getItem('userEmail')
      if (!userEmail) {
        setError('Usuario no autenticado')
        setLoading(false)
        return
      }
      
      const favs = await getFavorites(userEmail)
      console.log('💖 Favoritos cargados:', favs)
      
      // Adaptar canciones del backend al formato que espera SongCard
      const adaptedFavs = favs.map(song => ({
        id: song.id,
        title: song.titulo,
        artist: song.artista?.nombre || 'Artista desconocido',
        cover: (
          song.URLPortadaCancion ||
          song.urlPortadaCancion ||
          song.album?.urlPortadaAlbum ||
          song.album?.URLPortadaAlbum ||
          song.artista?.urlfotoArtista ||
          ''
        ).toString().trim() || '/placeholder-song.svg',
        url: song.URLCancion || song.url || song.urlCancion, // Campo crítico para reproducción
        genre: song.genero || 'Music',
        year: song.anio,
        album: song.album?.titulo,
        // Mantener datos originales
        ...song
      }))
      
      setFavorites(adaptedFavs)
    } catch (err) {
      console.error('Error cargando favoritos:', err)
      setError('No se pudieron cargar los favoritos')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (songTitle) => {
    try {
      const userEmail = user?.correo || localStorage.getItem('userEmail')
      await removeFromFavorites(userEmail, songTitle)
      // Recargar favoritos
      await loadFavorites()
    } catch (err) {
      console.error('Error al eliminar favorito:', err)
      alert('No se pudo eliminar de favoritos')
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
          <h2>
            <FaExclamationTriangle style={{ marginRight: '8px', color: '#ff6b6b' }} />
            Error
          </h2>
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
          <h1 className="Favorites__title">
            <FaHeart style={{ color: 'var(--accent)', marginRight: '12px' }} />
            Mis Favoritos
          </h1>
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
            <FaFileDownload style={{ marginRight: '8px' }} />
            Exportar CSV
          </button>
        )}
      </div>

      {/* Content */}
      {favorites.length === 0 ? (
        <div className="Favorites__empty">
          <div className="Favorites__emptyIcon">
            <FaMusic style={{ fontSize: 64, color: 'var(--text-muted)' }} />
          </div>
          <h2>No tienes favoritos aún</h2>
          <p>Comienza a agregar canciones que te gusten dando click en el corazón</p>
          <Link to="/" className="Favorites__emptyLink">
            Explorar música
          </Link>
        </div>
      ) : (
        <div className="Favorites__grid">
          {favorites.map(song => (
            <div key={song.id} style={{ position: 'relative' }}>
              <Link 
                to={`/songs/${song.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <SongCard song={song} />
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleRemoveFavorite(song.title)
                }}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: 'rgba(0,0,0,0.7)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                  zIndex: 10
                }}
                title="Quitar de favoritos"
              >
                <FaTimes style={{ color: '#fff', fontSize: 16 }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
