import axios from './axiosConfig'

/**
 * Agregar una canción a favoritos del usuario
 * @param {string} userName - Nombre del usuario (correo según endpoint)
 * @param {string} songTitle - Título de la canción
 * @returns {Promise} Lista actualizada de favoritos
 */
export const addToFavorites = async (userName, songTitle) => {
  try {
    const response = await axios.get('/usuarios/like', {
      params: {
        nombreUsuario: userName,
        tituloCancion: songTitle
      }
    })
    return response.data
  } catch (error) {
    console.error('Error al agregar a favoritos:', error)
    throw error
  }
}

/**
 * Obtener favoritos del usuario
 * @param {string} email - Correo del usuario
 * @returns {Promise} Objeto usuario con listaFavoritos
 */
export const getFavorites = async (email) => {
  try {
    const response = await axios.get('/usuarios', {
      params: { correo: email }
    })
    return response.data.listaFavoritos || []
  } catch (error) {
    console.error('Error al obtener favoritos:', error)
    throw error
  }
}

/**
 * Exportar favoritos a CSV
 * @param {Array} favorites - Lista de canciones favoritas
 * @param {string} fileName - Nombre del archivo (default: 'mis-favoritos.csv')
 */
export const exportFavoritesToCSV = (favorites, fileName = 'mis-favoritos.csv') => {
  if (!favorites || favorites.length === 0) {
    alert('No hay favoritos para exportar')
    return
  }

  // Definir headers del CSV
  const headers = ['Título', 'Artista', 'Álbum', 'Género', 'Año', 'Duración (min)']
  
  // Convertir favoritos a filas CSV
  const rows = favorites.map(song => [
    song.titulo || song.title || '',
    song.nombreArtista || song.artist || '',
    song.tituloAlbum || song.album || '',
    song.genero || song.genre || '',
    song.anio || song.year || '',
    song.duracion ? (song.duracion / 60).toFixed(2) : (song.duration || '')
  ])

  // Combinar headers y rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  // Crear blob y descargar
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', fileName)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Verificar si una canción está en favoritos
 * @param {Array} favorites - Lista de favoritos
 * @param {string} songId - ID de la canción
 * @returns {boolean}
 */
export const isFavorite = (favorites, songId) => {
  if (!favorites || !Array.isArray(favorites)) return false
  return favorites.some(fav => (fav.id || fav._id) === songId)
}
