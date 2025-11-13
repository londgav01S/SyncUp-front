import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { getPlaylist, updatePlaylistName, deletePlaylist, removeSongFromPlaylist } from '../../api/playlistService'
import SongCard from '../../components/SongCard/SongCard'
import './PlaylistDetail.css'

export default function PlaylistDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    loadPlaylist()
  }, [id])

  const loadPlaylist = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPlaylist(id)
      setPlaylist(data)
      setEditName(data.nombre)
    } catch (err) {
      console.error('Error cargando playlist:', err)
      setError('No se pudo cargar la playlist')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateName = async () => {
    if (!editName.trim() || editName === playlist.nombre) {
      setIsEditing(false)
      return
    }

    try {
      await updatePlaylistName(id, editName.trim())
      setPlaylist({ ...playlist, nombre: editName.trim() })
      setIsEditing(false)
      alert('✅ Nombre actualizado')
    } catch (err) {
      console.error('Error actualizando nombre:', err)
      alert('❌ No se pudo actualizar el nombre')
    }
  }

  const handleDeletePlaylist = async () => {
    if (window.confirm(`¿Eliminar la playlist "${playlist.nombre}"?`)) {
      try {
        await deletePlaylist(id)
        alert('✅ Playlist eliminada')
        navigate('/user/playlists')
      } catch (err) {
        console.error('Error eliminando playlist:', err)
        alert('❌ No se pudo eliminar la playlist')
      }
    }
  }

  const handleRemoveSong = async (tituloCancion) => {
    if (window.confirm(`¿Eliminar "${tituloCancion}" de la playlist?`)) {
      try {
        await removeSongFromPlaylist(id, tituloCancion)
        await loadPlaylist()
        alert('✅ Canción eliminada de la playlist')
        window.dispatchEvent(new Event('playlists-updated'))
      } catch (err) {
        console.error('Error eliminando canción:', err)
        alert('❌ No se pudo eliminar la canción')
      }
    }
  }

  const adaptSong = (song) => ({
    id: song.id,
    title: song.titulo,
    artist: song.artista?.nombre || 'Desconocido',
    album: song.album?.nombre || '',
    cover: song.URLPortadaCancion || song.album?.URLPortadaAlbum || song.artista?.urlfotoArtista || '',
    url: song.URLCancion || song.url || song.urlCancion, // Campo crítico para reproducción
    duration: song.duracion || 0,
    genre: song.genero || '',
    year: song.anio || '',
    // Mantener datos originales
    ...song
  })

  if (loading) {
    return (
      <div className="PlaylistDetail__loading">
        <i className="fas fa-spinner fa-spin"></i>
        Cargando playlist...
      </div>
    )
  }

  if (error || !playlist) {
    return (
      <div className="PlaylistDetail__error">
        <i className="fas fa-exclamation-circle"></i>
        <h3>{error || 'Playlist no encontrada'}</h3>
        <button onClick={() => navigate('/user/playlists')}>
          Volver a Playlists
        </button>
      </div>
    )
  }

  const songs = playlist.canciones || []
  const isOwner = user?.correo === playlist.creador?.correo

  return (
    <div className="PlaylistDetail">
      {/* Header */}
      <div className="PlaylistDetail__header">
        <div className="PlaylistDetail__cover">
          <img 
            src={playlist.imagen || 'https://via.placeholder.com/300x300/1DB954/ffffff?text=Playlist'} 
            alt={playlist.nombre}
          />
        </div>
        
        <div className="PlaylistDetail__info">
          <span className="PlaylistDetail__type">PLAYLIST</span>
          
          {isEditing ? (
            <div className="PlaylistDetail__edit-name">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleUpdateName}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                autoFocus
                maxLength={50}
              />
            </div>
          ) : (
            <h1 className="PlaylistDetail__title" onClick={() => isOwner && setIsEditing(true)}>
              {playlist.nombre}
              {isOwner && <i className="fas fa-pen edit-icon"></i>}
            </h1>
          )}

          <p className="PlaylistDetail__meta">
            {playlist.creador && (
              <span>Por {playlist.creador.nombre || playlist.creador.correo}</span>
            )}
            <span className="separator">•</span>
            <span>{songs.length} {songs.length === 1 ? 'canción' : 'canciones'}</span>
          </p>

          <div className="PlaylistDetail__actions">
            <button className="PlaylistDetail__play-btn">
              <i className="fas fa-play"></i>
              Reproducir
            </button>
            {isOwner && (
              <button 
                className="PlaylistDetail__delete-btn"
                onClick={handleDeletePlaylist}
              >
                <i className="fas fa-trash"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Songs List */}
      <div className="PlaylistDetail__songs">
        {songs.length === 0 ? (
          <div className="PlaylistDetail__empty">
            <i className="fas fa-music"></i>
            <h3>Esta playlist está vacía</h3>
            <p>Agrega canciones desde cualquier SongCard usando el botón "+", o desde la búsqueda</p>
          </div>
        ) : (
          <div className="PlaylistDetail__songs-grid">
            {songs.map((song, index) => (
              <div key={index} className="PlaylistDetail__song-item">
                <SongCard song={adaptSong(song)} />
                {isOwner && (
                  <button
                    className="PlaylistDetail__remove-btn"
                    onClick={() => handleRemoveSong(song.titulo)}
                    title="Eliminar de playlist"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
