import axios from './axiosConfig'

/**
 * Obtener todas las playlists del usuario actual
 * @param {string} userEmail - Correo del usuario
 */
export const getUserPlaylists = async (userEmail) => {
  try {
    const response = await axios.get('/playlists/usuario', {
      params: { correo: userEmail }
    })
    return response.data || []
  } catch (error) {
    console.error('Error obteniendo playlists del usuario:', error)
    throw error
  }
}

/**
 * Obtener una playlist por ID
 * @param {string} playlistId - ID de la playlist
 */
export const getPlaylist = async (playlistId) => {
  try {
    const response = await axios.get(`/playlists/${playlistId}`)
    return response.data
  } catch (error) {
    console.error('Error obteniendo playlist:', error)
    throw error
  }
}

/**
 * Crear una nueva playlist
 * @param {Object} data - Datos de la playlist
 * @param {string} data.nombre - Nombre de la playlist
 * @param {string} data.descripcion - Descripción (opcional)
 * @param {string} data.correoCreador - Correo del usuario creador
 */
export const createPlaylist = async ({ nombre, descripcion, correoCreador }) => {
  try {
    const response = await axios.post('/playlists', null, {
      params: { nombre, descripcion, correoCreador }
    })
    console.log('✅ Playlist creada:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error creando playlist:', error)
    throw error
  }
}

/**
 * Actualizar nombre de playlist
 * @param {string} playlistId - ID de la playlist
 * @param {string} nuevoNombre - Nuevo nombre
 */
export const updatePlaylistName = async (playlistId, nuevoNombre) => {
  try {
    const response = await axios.put(`/playlists/${playlistId}`, null, {
      params: { nombre: nuevoNombre }
    })
    return response.data
  } catch (error) {
    console.error('Error actualizando playlist:', error)
    throw error
  }
}

/**
 * Eliminar una playlist
 * @param {string} playlistId - ID de la playlist
 */
export const deletePlaylist = async (playlistId) => {
  try {
    await axios.delete(`/playlists/${playlistId}`)
    console.log('✅ Playlist eliminada')
  } catch (error) {
    console.error('❌ Error eliminando playlist:', error)
    throw error
  }
}

/**
 * Agregar canción a playlist
 * @param {string} playlistId - ID de la playlist
 * @param {string} tituloCancion - Título de la canción
 */
export const addSongToPlaylist = async (playlistId, tituloCancion) => {
  try {
    const response = await axios.post(`/playlists/${playlistId}/canciones`, null, {
      params: { tituloCancion }
    })
    console.log('✅ Canción agregada a playlist')
    return response.data
  } catch (error) {
    console.error('❌ Error agregando canción:', error)
    throw error
  }
}

/**
 * Eliminar canción de playlist
 * @param {string} playlistId - ID de la playlist
 * @param {string} tituloCancion - Título de la canción a eliminar
 */
export const removeSongFromPlaylist = async (playlistId, tituloCancion) => {
  try {
    await axios.delete(`/playlists/${playlistId}/canciones`, {
      params: { tituloCancion }
    })
    console.log('✅ Canción eliminada de playlist')
  } catch (error) {
    console.error('❌ Error eliminando canción:', error)
    throw error
  }
}

/**
 * Seguir una playlist
 * @param {string} playlistId - ID de la playlist
 * @param {string} userEmail - Correo del usuario
 */
export const followPlaylist = async (playlistId, userEmail) => {
  try {
    const response = await axios.post(`/playlists/${playlistId}/seguir`, null, {
      params: { correoUsuario: userEmail }
    })
    return response.data
  } catch (error) {
    console.error('Error siguiendo playlist:', error)
    throw error
  }
}

/**
 * Dejar de seguir una playlist
 * @param {string} playlistId - ID de la playlist
 * @param {string} userEmail - Correo del usuario
 */
export const unfollowPlaylist = async (playlistId, userEmail) => {
  try {
    await axios.delete(`/playlists/${playlistId}/seguir`, {
      params: { correoUsuario: userEmail }
    })
  } catch (error) {
    console.error('Error dejando de seguir playlist:', error)
    throw error
  }
}
