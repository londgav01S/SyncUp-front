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

  // Calcular cantidad de canciones - manejar tanto array de objetos como array de strings
  const songCount = Array.isArray(playlist.canciones) 
    ? playlist.canciones.filter(cancion => {
        // Si es un objeto, verificar que tenga titulo
        if (typeof cancion === 'object' && cancion !== null) {
          return cancion.titulo && cancion.titulo.trim() !== ''
        }
        // Si es string, verificar que no esté vacío
        return cancion && cancion.trim() !== ''
      }).length
    : 0
  
  // Generar imagen de collage o usar placeholder
  const defaultImage = 'https://placehold.co/300x300/1A3C55/00C8C2?text=Playlist'
  
  // Si no hay imagen personalizada, intentar crear collage de covers de canciones
  let coverImage = playlist.imagen
  
  if (!coverImage && Array.isArray(playlist.canciones) && playlist.canciones.length > 0) {
    // Si hay canciones con covers, usar la primera
    const firstSongWithCover = playlist.canciones.find(c => 
      c && typeof c === 'object' && (c.URLPortadaCancion || c.album?.URLPortadaAlbum)
    )
    if (firstSongWithCover) {
      coverImage = firstSongWithCover.URLPortadaCancion || firstSongWithCover.album?.URLPortadaAlbum
    }
  }
  
  if (!coverImage) {
    coverImage = defaultImage
  }

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
        {/* Subtitle oculto - siempre muestra 0 */}
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
