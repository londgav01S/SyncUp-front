import React, { useState, useContext } from 'react'
import './SongCard.css'
import usePlayer from '../../hooks/usePlayer'
import { addToFavorites, removeFromFavorites } from '../../api/favoriteService'
import { AuthContext } from '../../context/AuthContext'

export default function SongCard({ song }) {
  const { user } = useContext(AuthContext)
  const { current, playing, play, pause } = usePlayer()
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isAddingFavorite, setIsAddingFavorite] = useState(false)

  const isCurrent = current?.id === song?.id
  const isPlaying = isCurrent && playing

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
        // Quitar de favoritos
        await removeFromFavorites(userEmail, songTitle)
        setIsFavorite(false)
        console.log('💔 Removido de favoritos:', songTitle)
      } else {
        // Agregar a favoritos
        await addToFavorites(userEmail, songTitle)
        setIsFavorite(true)
        console.log('💖 Agregado a favoritos:', songTitle)
      }
      
      // Disparar evento para que Favorites se actualice
      window.dispatchEvent(new Event('favorites-updated'))
    } catch (error) {
      console.error('Error al gestionar favoritos:', error)
      alert('No se pudo actualizar favoritos. Verifica que la canción exista en el sistema.')
    } finally {
      setIsAddingFavorite(false)
    }
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

          <button className="SongCard__actionButton" aria-label="Agregar a playlist">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          <button className="SongCard__actionButton" aria-label="Más opciones">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Efecto de brillo en hover */}
      <div className={`SongCard__shine ${isHovered ? 'SongCard__shine--visible' : ''}`} />
    </div>
  )
}
