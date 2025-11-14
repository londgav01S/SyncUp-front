import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { getPlaylist, updatePlaylistName, deletePlaylist, removeSongFromPlaylist, addSongToPlaylist } from '../../api/playlistService'
import { getSongs } from '../../api/songService'
import SongCard from '../../components/SongCard/SongCard'
import usePlayer from '../../hooks/usePlayer'
import { FaPlay, FaPause, FaTrash, FaPlus, FaSearch, FaTimes, FaMusic, FaBrain } from 'react-icons/fa'
import './PlaylistDetail.css'

export default function PlaylistDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const { current, playing, play, pause, setPlayQueue } = usePlayer()
  
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [allSongs, setAllSongs] = useState([])
  const [fullSongs, setFullSongs] = useState([]) // Canciones completas de la playlist
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingSongs, setLoadingSongs] = useState(false)

  useEffect(() => {
    loadPlaylist()
  }, [id])

  // Escuchar actualizaciones de playlists desde otros componentes
  useEffect(() => {
    const handlePlaylistUpdate = () => {
      console.log('🔄 Playlist actualizada, recargando...')
      loadPlaylist()
    }
    
    window.addEventListener('playlists-updated', handlePlaylistUpdate)
    return () => window.removeEventListener('playlists-updated', handlePlaylistUpdate)
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
        const allSongsResponse = await getSongs()
        const allSongsData = allSongsResponse.data || []
        
        // Buscar los datos completos de cada canción por título
        const completeSongs = data.canciones
          .map(c => {
            const titulo = c.titulo || c
            return allSongsData.find(s => s.titulo === titulo)
          })
          .filter(s => s !== undefined)
        
        setFullSongs(completeSongs)
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

  const loadAllSongs = async () => {
    try {
      setLoadingSongs(true)
      const response = await getSongs()
      setAllSongs(response.data || [])
    } catch (err) {
      console.error('Error cargando canciones:', err)
    } finally {
      setLoadingSongs(false)
    }
  }

  const handleOpenAddModal = () => {
    setShowAddModal(true)
    loadAllSongs()
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

  const handleAddSongToPlaylist = async (song) => {
    try {
      const songTitle = song.titulo || song.title
      await addSongToPlaylist(id, songTitle)
      await loadPlaylist()
      alert(`✅ "${songTitle}" agregada a la playlist`)
      window.dispatchEvent(new Event('playlists-updated'))
    } catch (err) {
      console.error('Error agregando canción:', err)
      alert('❌ No se pudo agregar la canción')
    }
  }

  const handlePlayPlaylist = () => {
    if (fullSongs.length === 0) return
    const adaptedSongs = fullSongs.map(adaptSong)
    setPlayQueue(adaptedSongs)
    play(adaptedSongs[0])
  }

  const handleTogglePlaylist = () => {
    if (fullSongs.length === 0) return
    
    const isPlaylistPlaying = fullSongs.some(song => {
      const adapted = adaptSong(song)
      return current?.id === adapted.id && playing
    })

    if (isPlaylistPlaying) {
      pause()
    } else {
      handlePlayPlaylist()
    }
  }

  const adaptSong = (song) => ({
    id: song.id,
    title: song.titulo,
    titulo: song.titulo,
    artist: song.artista?.nombre || 'Desconocido',
    artista: song.artista,
    album: song.album?.nombre || '',
    albumObj: song.album,
    cover: song.URLPortadaCancion || song.album?.URLPortadaAlbum || song.artista?.urlfotoArtista || '/logo.png',
    url: song.URLCancion || song.url || song.urlCancion,
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

  const songs = fullSongs
  const isOwner = user?.correo === playlist.creador?.correo

  const isPlaylistPlaying = songs.some(song => {
    const adapted = adaptSong(song)
    return current?.id === adapted.id && playing
  })

  const filteredSongs = allSongs.filter(song => {
    const searchLower = searchQuery.toLowerCase()
    const titulo = (song.titulo || '').toLowerCase()
    const artista = (song.artista?.nombre || '').toLowerCase()
    const album = (song.album?.nombre || '').toLowerCase()
    return titulo.includes(searchLower) || artista.includes(searchLower) || album.includes(searchLower)
  })

  return (
    <div className="PlaylistDetail">
      {/* Header */}
      <div className="PlaylistDetail__header">
        <div className="PlaylistDetail__coverContainer">
          <div className="PlaylistDetail__cover">
            <img 
              src={playlist.imagen || 'https://via.placeholder.com/300x300/1DB954/ffffff?text=Playlist'} 
              alt={playlist.nombre}
            />
            <div className="PlaylistDetail__coverOverlay">
              <FaMusic />
            </div>
          </div>
        </div>
        
        <div className="PlaylistDetail__info">
          <div className="PlaylistDetail__badge">
            <FaBrain />
            PLAYLIST
          </div>
          
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
              <span className="PlaylistDetail__creator">
                <i className="fas fa-user"></i>
                {playlist.creador.nombre || playlist.creador.correo}
              </span>
            )}
            <span className="separator">•</span>
            <span className="PlaylistDetail__count">
              <i className="fas fa-music"></i>
              {songs.length} {songs.length === 1 ? 'canción' : 'canciones'}
            </span>
          </p>

          <div className="PlaylistDetail__actions">
            <button 
              className="PlaylistDetail__play-btn"
              onClick={handleTogglePlaylist}
              disabled={songs.length === 0}
            >
              {isPlaylistPlaying ? <FaPause /> : <FaPlay />}
              {isPlaylistPlaying ? 'Pausar' : 'Reproducir'}
            </button>
            {isOwner && (
              <>
                <button 
                  className="PlaylistDetail__add-btn"
                  onClick={handleOpenAddModal}
                  title="Agregar canciones"
                >
                  <FaPlus />
                </button>
                <button 
                  className="PlaylistDetail__delete-btn"
                  onClick={handleDeletePlaylist}
                  title="Eliminar playlist"
                >
                  <FaTrash />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Songs List */}
      <div className="PlaylistDetail__songs">
        {songs.length === 0 ? (
          <div className="PlaylistDetail__empty">
            <div className="PlaylistDetail__emptyIcon">
              <FaMusic />
            </div>
            <h3>Esta playlist está vacía</h3>
            <p>Agrega canciones usando el botón "+" en la parte superior</p>
            {isOwner && (
              <button 
                className="PlaylistDetail__emptyBtn"
                onClick={handleOpenAddModal}
              >
                <FaPlus /> Agregar Canciones
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="PlaylistDetail__songsHeader">
              <h2>Canciones ({songs.length})</h2>
            </div>
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
                      <FaTimes />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add Songs Modal */}
      {showAddModal && (
        <div className="PlaylistDetail__modalOverlay" onClick={() => setShowAddModal(false)}>
          <div className="PlaylistDetail__modal" onClick={(e) => e.stopPropagation()}>
            <div className="PlaylistDetail__modalHeader">
              <h2>Agregar Canciones</h2>
              <button 
                className="PlaylistDetail__modalClose"
                onClick={() => setShowAddModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="PlaylistDetail__modalSearch">
              <FaSearch />
              <input
                type="text"
                placeholder="Buscar canciones por título, artista o álbum..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div className="PlaylistDetail__modalContent">
              {loadingSongs ? (
                <div className="PlaylistDetail__modalLoading">
                  <i className="fas fa-spinner fa-spin"></i>
                  Cargando canciones...
                </div>
              ) : filteredSongs.length === 0 ? (
                <div className="PlaylistDetail__modalEmpty">
                  <FaSearch />
                  <p>No se encontraron canciones</p>
                </div>
              ) : (
                <div className="PlaylistDetail__modalGrid">
                  {filteredSongs.map((song, index) => (
                    <div key={index} className="PlaylistDetail__modalSong">
                      <img 
                        src={song.URLPortadaCancion || song.album?.URLPortadaAlbum || '/logo.png'}
                        alt={song.titulo}
                        className="PlaylistDetail__modalSongCover"
                      />
                      <div className="PlaylistDetail__modalSongInfo">
                        <h4>{song.titulo}</h4>
                        <p>{song.artista?.nombre || 'Desconocido'}</p>
                      </div>
                      <button
                        className="PlaylistDetail__modalSongAdd"
                        onClick={() => handleAddSongToPlaylist(song)}
                        title="Agregar a playlist"
                      >
                        <FaPlus />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
