import React from 'react'
import { useNavigate } from 'react-router-dom'
import './PlaylistCard.css'

export default function PlaylistCard({ playlist, onDelete }) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/playlists/${playlist.id}`)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (window.confirm(`¿Eliminar la playlist "${playlist.nombre}"?`)) {
      onDelete(playlist.id)
    }
  }

  // Calcular cantidad de canciones
  const songCount = playlist.canciones?.length || 0
  
  // Imagen por defecto para playlists
  const defaultImage = 'https://via.placeholder.com/300x300/1DB954/ffffff?text=Playlist'
  const coverImage = playlist.imagen || defaultImage

  return (
    <div className="PlaylistCard" onClick={handleClick}>
      <div className="PlaylistCard__cover">
        <img 
          src={coverImage} 
          alt={playlist.nombre}
          onError={(e) => { e.target.src = defaultImage }}
        />
        <div className="PlaylistCard__overlay">
          <button className="PlaylistCard__play-btn">
            <i className="fas fa-play"></i>
          </button>
        </div>
      </div>
      
      <div className="PlaylistCard__info">
        <h3 className="PlaylistCard__title" title={playlist.nombre}>
          {playlist.nombre}
        </h3>
        <p className="PlaylistCard__subtitle">
          {songCount} {songCount === 1 ? 'canción' : 'canciones'}
        </p>
        {playlist.creador && (
          <p className="PlaylistCard__creator">
            Por {playlist.creador.nombre || playlist.creador.correo}
          </p>
        )}
      </div>

      {onDelete && (
        <button 
          className="PlaylistCard__delete-btn"
          onClick={handleDelete}
          title="Eliminar playlist"
        >
          <i className="fas fa-trash"></i>
        </button>
      )}
    </div>
  )
}
