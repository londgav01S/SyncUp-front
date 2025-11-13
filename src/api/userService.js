import axios from './axiosConfig'

export const login = (credentials) => axios.post('/auth/login', credentials)
export const register = (data) => axios.post('/auth/register', data)
export const getProfile = () => axios.get('/user/profile')

// Backend expects RequestParam (nombre, correo, contrasena) at POST /usuarios
export const createUser = ({ nombre, correo, contrasena }) => {
	// Send as query params with POST so Spring @RequestParam picks them up
	return axios.post('/usuarios', null, { params: { nombre, correo, contrasena } })
}

// Fetch user by correo (backend exposes GET /usuarios?correo=...)
export const getUserByCorreo = (correo) => {
	return axios.get('/usuarios', { params: { correo } })
}

/**
 * Seguir a un usuario
 * @param {string} userEmail - Correo del usuario que sigue
 * @param {string} followEmail - Correo del usuario a seguir
 */
export const followUser = async (userEmail, followEmail) => {
  try {
    const response = await axios.get('/usuarios/seguir', {
      params: {
        correoUsuario: userEmail,
        correoSeguir: followEmail
      }
    })
    console.log('✅ Usuario seguido correctamente')
    return response.data
  } catch (error) {
    console.error('❌ Error al seguir usuario:', error)
    throw error
  }
}

/**
 * Dejar de seguir a un usuario
 * @param {string} userEmail - Correo del usuario que deja de seguir
 * @param {string} unfollowEmail - Correo del usuario a dejar de seguir
 */
export const unfollowUser = async (userEmail, unfollowEmail) => {
  try {
    const response = await axios.get('/usuarios/unseguir', {
      params: {
        correoUsuario: userEmail,
        correoUnseguir: unfollowEmail
      }
    })
    console.log('✅ Dejaste de seguir al usuario')
    return response.data
  } catch (error) {
    console.error('❌ Error al dejar de seguir:', error)
    throw error
  }
}

/**
 * Obtener lista de seguidores de un usuario
 * @param {string} userEmail - Correo del usuario
 */
export const getFollowers = async (userEmail) => {
  try {
    const response = await axios.get('/usuarios/seguidores', {
      params: { correoUsuario: userEmail }
    })
    console.log('👥 Seguidores obtenidos:', response.data)
    return response.data || []
  } catch (error) {
    console.error('❌ Error al obtener seguidores:', error)
    throw error
  }
}

/**
 * Actualizar datos del usuario
 * @param {string} correo - Correo actual del usuario
 * @param {string} nuevoCorreo - Nuevo correo (opcional)
 * @param {string} nombre - Nuevo nombre (opcional)
 * @param {string} nuevaContrasena - Nueva contraseña (opcional)
 */
export const updateUser = async (correo, nuevoCorreo, nombre, nuevaContrasena) => {
  try {
    const params = { correo }
    if (nuevoCorreo && nuevoCorreo !== correo) params.nuevoCorreo = nuevoCorreo
    if (nombre) params.nombre = nombre
    if (nuevaContrasena) params.nuevaContrasena = nuevaContrasena

    const response = await axios.put('/usuarios', null, { params })
    console.log('✅ Usuario actualizado correctamente')
    return response.data
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error)
    throw error
  }
}

/**
 * Eliminar cuenta de usuario
 * @param {string} correo - Correo del usuario a eliminar
 */
export const deleteUser = async (correo) => {
  try {
    await axios.delete('/usuarios', {
      params: { correo }
    })
    console.log('✅ Usuario eliminado correctamente')
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error)
    throw error
  }
}
