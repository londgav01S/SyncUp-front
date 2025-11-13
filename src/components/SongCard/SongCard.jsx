import React, { useState, useContext, useEffect } from 'react'
import './SongCard.css'
import usePlayer from '../../hooks/usePlayer'
import { addToFavorites, removeFromFavorites } from '../../api/favoriteService'
import { getUserPlaylists, addSongToPlaylist } from '../../api/playlistService'
import { startRadio } from '../../api/radioService'
import { AuthContext } from '../../context/AuthContext'
import RadioModal from '../RadioModal/RadioModal'

export default function SongCard({ song }) {
  const { user } = useContext(AuthContext)
  const { current, playing, play, pause } = usePlayer()
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isAddingFavorite, setIsAddingFavorite] = useState(false)
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false)
  const [playlists, setPlaylists] = useState([])
  const [loadingPlaylists, setLoadingPlaylists] = useState(false)
  const [showRadioModal, setShowRadioModal] = useState(false)

  const isCurrent = current?.id === song?.id
  const isPlaying = isCurrent && playing

  // Cargar playlists del usuario
  useEffect(() => {
    const handlePlaylistsUpdated = () => {
      if (showPlaylistMenu) {
        loadPlaylists()
      }
    }
    
    window.addEventListener('playlists-updated', handlePlaylistsUpdated)
    return () => window.removeEventListener('playlists-updated', handlePlaylistsUpdated)
  }, [showPlaylistMenu])

  const loadPlaylists = async () => {
    try {
      setLoadingPlaylists(true)
      const userEmail = user?.correo || localStorage.getItem('userEmail')
      const data = await getUserPlaylists(userEmail)
      setPlaylists(data)
    } catch (err) {
      console.error('Error cargando playlists:', err)
    } finally {
      setLoadingPlaylists(false)
    }
  }

  const onToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isPlaying) {
      pause()
    } else {
      play(song)
    }
  }

  const handleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isAddingFavorite) return

    try {
      setIsAddingFavorite(true)
      
      const userEmail = user?.correo || localStorage.getItem('userEmail')
      if (!userEmail) {
        alert('Debes iniciar sesión para agregar favoritos')
        return
      }
      
      const songTitle = song?.title || song?.titulo
      
      if (isFavorite) {
        await removeFromFavorites(userEmail, songTitle)
        setIsFavorite(false)
        console.log('💔 Removido de favoritos:', songTitle)
      } else {
        await addToFavorites(userEmail, songTitle)
        setIsFavorite(true)
        console.log('💖 Agregado a favoritos:', songTitle)
      }
      
      window.dispatchEvent(new Event('favorites-updated'))
    } catch (error) {
      console.error('Error al gestionar favoritos:', error)
      alert('No se pudo actualizar favoritos. Verifica que la canción exista en el sistema.')
    } finally {
      setIsAddingFavorite(false)
    }
  }

  const handleAddToPlaylistClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowPlaylistMenu(!showPlaylistMenu)
    if (!showPlaylistMenu) {
      await loadPlaylists()
    }
  }

  const handleAddToPlaylist = async (e, playlistId, playlistName) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const songTitle = song?.title || song?.titulo
      await addSongToPlaylist(playlistId, songTitle)
      alert(`✅ Canción agregada a "${playlistName}"`)
      setShowPlaylistMenu(false)
      window.dispatchEvent(new Event('playlists-updated'))
    } catch (err) {
      console.error('Error agregando a playlist:', err)
      alert('❌ No se pudo agregar la canción a la playlist')
    }
  }

  const handleStartRadio = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowRadioModal(true)
  }

  return (
    <div
      className={`SongCard ${isHovered ? 'SongCard--hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Contenedor de imagen con overlay */}
      <div className="SongCard__imageContainer">
        {/* Skeleton loader */}
        {!imageLoaded && (
          <div className="SongCard__skeleton">
            <div className="SongCard__skeletonShimmer" />
          </div>
        )}

        <img
          src={song?.cover}
          alt={song?.title}
          className={`SongCard__image ${imageLoaded ? 'SongCard__image--loaded' : ''}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = '/logo.png'
            setImageLoaded(true)
          }}
        />

        {/* Overlay oscuro en hover */}
        <div className={`SongCard__overlay ${isHovered || isPlaying ? 'SongCard__overlay--visible' : ''}`} />

        {/* Badge de género */}
        <div className={`SongCard__badge ${isHovered ? 'SongCard__badge--visible' : ''}`}>
          {song?.genre || 'Music'}
        </div>

        {/* Botón de reproducción */}
        <button
          className={`SongCard__playButton ${isHovered || isPlaying ? 'SongCard__playButton--visible' : ''} ${isPlaying ? 'SongCard__playButton--active' : ''}`}
          onClick={onToggle}
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          <div className="SongCard__playButtonInner">
            {isPlaying ? (
              <>
                <div className="SongCard__pauseBar" />
                <div className="SongCard__pauseBar" />
              </>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>

          {/* Ondas de audio animadas cuando está reproduciendo */}
          {isPlaying && (
            <div className="SongCard__audioWaves" />
          )}
        </button>

        {/* Indicador de reproducción actual */}
        {isPlaying && (
          <div className="SongCard__nowPlayingIndicator">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
          </div>
        )}
      </div>

      {/* Información de la canción */}
      <div className="SongCard__info">
        <h4 className="SongCard__title">{song?.title || 'Título'}</h4>
        <p className="SongCard__artist">{song?.artist || 'Artista'}</p>

        {/* Botones de acción secundarios */}
        <div className={`SongCard__actions ${isHovered ? 'SongCard__actions--visible' : ''}`}>
          <button 
            className={`SongCard__actionButton ${isFavorite ? 'SongCard__actionButton--liked' : ''}`}
            aria-label="Me gusta"
            onClick={handleLike}
            disabled={isAddingFavorite}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          <div className="SongCard__playlistDropdown">
            <button 
              className={`SongCard__actionButton ${showPlaylistMenu ? 'SongCard__actionButton--active' : ''}`}
              aria-label="Agregar a playlist"
              onClick={handleAddToPlaylistClick}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            {showPlaylistMenu && (
              <div className="SongCard__playlistMenu" onClick={(e) => e.stopPropagation()}>
                <div className="SongCard__playlistMenuHeader">
                  Agregar a playlist
                </div>
                <div className="SongCard__playlistMenuContent">
                  {loadingPlaylists ? (
                    <div className="SongCard__playlistMenuLoading">
                      <i className="fas fa-spinner fa-spin"></i> Cargando...
                    </div>
                  ) : playlists.length === 0 ? (
                    <div className="SongCard__playlistMenuEmpty">
                      No tienes playlists aún
                    </div>
                  ) : (
                    playlists.map(playlist => (
                      <button
                        key={playlist.id}
                        className="SongCard__playlistMenuItem"
                        onClick={(e) => handleAddToPlaylist(e, playlist.id, playlist.nombre)}
                      >
                        <i className="fas fa-list-music"></i>
                        {playlist.nombre}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            className="SongCard__actionButton SongCard__actionButton--radio" 
            aria-label="Iniciar Radio"
            onClick={handleStartRadio}
            title="Reproducir canciones similares"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="2" />
              <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
            </svg>
          </button>
        </div>
      </div>

      {/* Efecto de brillo en hover */}
      <div className={`SongCard__shine ${isHovered ? 'SongCard__shine--visible' : ''}`} />

      {/* Modal de Radio */}
      <RadioModal 
        isOpen={showRadioModal} 
        onClose={() => setShowRadioModal(false)} 
        baseSong={song} 
      />
    </div>
  )
}
