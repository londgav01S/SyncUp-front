import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { getUserPlaylists, createPlaylist, deletePlaylist } from '../../api/playlistService'
import PlaylistCard from '../../components/PlaylistCard/PlaylistCard'
import './Playlists.css'

export default function Playlists() {
  const { user } = useContext(AuthContext)
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('')

  useEffect(() => {
    if (user?.correo) {
      loadPlaylists()
    }
  }, [user])

  const loadPlaylists = async () => {
    try {
      setLoading(true)
      setError(null)
      const userEmail = user?.correo || localStorage.getItem('userEmail')
      const data = await getUserPlaylists(userEmail)
      setPlaylists(data)
    } catch (err) {
      console.error('Error cargando playlists:', err)
      setError('No se pudieron cargar las playlists')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlaylist = async (e) => {
    e.preventDefault()
    if (!newPlaylistName.trim()) {
      alert('Por favor ingresa un nombre para la playlist')
      return
    }

    try {
      setLoading(true)
      const userEmail = user?.correo || localStorage.getItem('userEmail')
      await createPlaylist({
        nombre: newPlaylistName.trim(),
        correoCreador: userEmail
      })
      setNewPlaylistName('')
      setNewPlaylistDesc('')
      setShowCreateModal(false)
      await loadPlaylists()
      window.dispatchEvent(new Event('playlists-updated'))
      alert('✅ Playlist creada exitosamente')
    } catch (err) {
      console.error('Error creando playlist:', err)
      alert('❌ No se pudo crear la playlist')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePlaylist = async (playlistId) => {
    try {
      setLoading(true)
      await deletePlaylist(playlistId)
      await loadPlaylists()
      alert('✅ Playlist eliminada')
    } catch (err) {
      console.error('Error eliminando playlist:', err)
      alert('❌ No se pudo eliminar la playlist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="PlaylistsPage">
      {/* Header */}
      <div className="PlaylistsPage__header">
        <div>
          <h1 className="PlaylistsPage__title">Mis Playlists</h1>
          <p className="PlaylistsPage__subtitle">
            {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
          </p>
        </div>
        <button 
          className="PlaylistsPage__create-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="fas fa-plus"></i>
          Nueva Playlist
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="PlaylistsPage__loading">
          <i className="fas fa-spinner fa-spin"></i>
          Cargando...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="PlaylistsPage__error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && playlists.length === 0 && (
        <div className="PlaylistsPage__empty">
          <i className="fas fa-list-music"></i>
          <h3>No tienes playlists aún</h3>
          <p>Crea tu primera playlist para organizar tu música favorita</p>
          <button 
            className="PlaylistsPage__create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus"></i>
            Crear Playlist
          </button>
        </div>
      )}

      {/* Playlists Grid */}
      {!loading && !error && playlists.length > 0 && (
        <div className="PlaylistsPage__grid">
          {playlists.map(playlist => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onDelete={handleDeletePlaylist}
            />
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="PlaylistsPage__modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="PlaylistsPage__modal" onClick={(e) => e.stopPropagation()}>
            <div className="PlaylistsPage__modal-header">
              <h2>Crear Nueva Playlist</h2>
              <button 
                className="PlaylistsPage__modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleCreatePlaylist} className="PlaylistsPage__modal-form">
              <div className="PlaylistsPage__form-group">
                <label htmlFor="playlistName">Nombre *</label>
                <input
                  id="playlistName"
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Ej: Mis favoritas 2024"
                  maxLength={50}
                  required
                  autoFocus
                />
              </div>

              <div className="PlaylistsPage__form-group">
                <label htmlFor="playlistDesc">Descripción (opcional)</label>
                <textarea
                  id="playlistDesc"
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Describe tu playlist..."
                  maxLength={200}
                  rows={3}
                />
              </div>

              <div className="PlaylistsPage__modal-actions">
                <button 
                  type="button"
                  className="PlaylistsPage__btn-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="PlaylistsPage__btn-create"
                  disabled={loading}
                >
                  {loading ? 'Creando...' : 'Crear Playlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
