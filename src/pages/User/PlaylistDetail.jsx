import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { getPlaylist, updatePlaylistName, deletePlaylist, removeSongFromPlaylist } from '../../api/playlistService'
import { getSong } from '../../api/songService'
import usePlayer from '../../hooks/usePlayer'
import SongCard from '../../components/SongCard/SongCard'
import './PlaylistDetail.css'

export default function PlaylistDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const { play } = usePlayer()
  
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [fullSongs, setFullSongs] = useState([])
  const [loadingSongs, setLoadingSongs] = useState(false)

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
      
      // Cargar datos completos de las canciones
      if (data.canciones && data.canciones.length > 0) {
        await loadFullSongData(data.canciones)
      } else {
        setFullSongs([])
      }
    } catch (err) {
      console.error('Error cargando playlist:', err)
      setError('No se pudo cargar la playlist')
    } finally {
      setLoading(false)
    }
  }

  const loadFullSongData = async (songs) => {
    try {
      setLoadingSongs(true)
      const promises = songs.map(song => 
        getSong(song.id)
          .then(response => response.data)
          .catch(err => {
            console.error(`Error cargando canción ${song.id}:`, err)
            return null
          })
      )
      
      const results = await Promise.all(promises)
      const validSongs = results.filter(song => song !== null)
      setFullSongs(validSongs)
    } catch (err) {
      console.error('Error cargando datos de canciones:', err)
      setFullSongs([])
    } finally {
      setLoadingSongs(false)
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

  const handlePlayAll = () => {
    if (fullSongs.length === 0) return
    
    const adaptedSongs = fullSongs.map(song => adaptSong(song))
    play(adaptedSongs[0], adaptedSongs)
  }

  const adaptSong = (song) => {
    const svgCover = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2345B6B3;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%231C2B3A;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad)' width='300' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='32' font-weight='bold' fill='white' opacity='0.9'%3E♪%3C/text%3E%3C/svg%3E`
    
    return {
      id: song.id,
      title: song.titulo || 'Sin título',
      artist: song.artista?.nombre || 'Artista desconocido',
      album: song.album?.nombre || song.album?.titulo || '',
      cover: song.URLPortadaCancion || song.album?.URLPortadaAlbum || song.artista?.urlfotoArtista || svgCover,
      url: song.URLCancion || song.url || song.urlCancion,
      duration: song.duracion || 0,
      genre: song.genero || '',
      year: song.anio || '',
      titulo: song.titulo,
      // Mantener datos originales
      ...song
    }
  }

  if (loading || loadingSongs) {
    return (
      <div className="PlaylistDetail__loading">
        <i className="fas fa-spinner fa-spin"></i>
        {loadingSongs ? 'Cargando canciones...' : 'Cargando playlist...'}
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

  const songs = fullSongs
  const isOwner = user?.correo === playlist.correoCreador || user?.correo === playlist.creador?.correo

  return (
    <div className="PlaylistDetail">
      {/* Header */}
      <div className="PlaylistDetail__header">
        <div className="PlaylistDetail__cover">
          <img 
            src={playlist.imagen || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23F25C43' width='300' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='32' font-weight='bold' fill='white'%3E♫ ${encodeURIComponent(playlist.nombre || 'Playlist')}%3C/text%3E%3C/svg%3E`} 
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
            {playlist.correoCreador && (
              <span>Por {playlist.correoCreador}</span>
            )}
            <span className="separator">•</span>
            <span>{fullSongs.length} {fullSongs.length === 1 ? 'canción' : 'canciones'}</span>
          </p>

          <div className="PlaylistDetail__actions">
            <button 
              className="PlaylistDetail__play-btn"
              onClick={handlePlayAll}
              disabled={fullSongs.length === 0}
            >
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
