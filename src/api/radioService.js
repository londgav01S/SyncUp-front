import axios from './axiosConfig'

/**
 * Adapta una canción del backend al formato del frontend
 */
function adaptSongForPlayer(song) {
  const adapted = {
    id: song.id || song._id,
    title: song.titulo,
    artist: song.artista?.nombre || 'Desconocido',
    album: song.album?.nombre || '',
    cover: song.URLPortadaCancion || song.album?.URLPortadaAlbum || song.artista?.urlfotoArtista || '',
    url: song.URLCancion || song.url || song.urlCancion, // Intentar múltiples variantes
    duration: song.duracion || 0,
    genre: song.genero || '',
    year: song.anio || '',
    // Mantener datos originales por si acaso
    titulo: song.titulo,
    artista: song.artista,
    genero: song.genero,
    anio: song.anio,
    URLCancion: song.URLCancion,
    URLPortadaCancion: song.URLPortadaCancion
  }
  
  console.log('🔄 Canción adaptada:', {
    titulo: adapted.title,
    url: adapted.url,
    URLCancion: song.URLCancion,
    urlCancion: song.urlCancion,
    original_url: song.url
  })
  
  return adapted
}

/**
 * Obtiene canciones similares a una canción específica
 * Usa el endpoint del backend o implementa lógica client-side
 * @param {string} songTitle - Título de la canción base
 * @param {number} limit - Cantidad máxima de canciones similares
 */
export const getSimilarSongs = async (songTitle, limit = 20) => {
  try {
    // Intentar endpoint del backend primero
    const response = await axios.get('/canciones/similares', {
      params: { titulo: songTitle, limite: limit }
    })
    const songs = response.data || []
    console.log('✅ Canciones similares desde backend:', songs.length)
    return songs.map(adaptSongForPlayer)
  } catch (error) {
    console.warn('⚠️ Backend no disponible, usando lógica client-side:', error.message)
    
    // Fallback: lógica client-side basada en todas las canciones
    try {
      const allSongsResponse = await axios.get('/canciones')
      const allSongs = allSongsResponse.data || []
      
      // Encontrar la canción base
      const baseSong = allSongs.find(s => s.titulo === songTitle)
      if (!baseSong) {
        console.error('❌ Canción base no encontrada:', songTitle)
        return []
      }
      
      // Filtrar canciones similares
      const similar = allSongs
        .filter(song => song.titulo !== songTitle) // Excluir la misma canción
        .map(song => ({
          song,
          score: calculateSimilarityScore(baseSong, song)
        }))
        .sort((a, b) => b.score - a.score) // Ordenar por score descendente
        .slice(0, limit)
        .map(item => item.song)
      
      console.log('✅ Canciones similares (client-side):', similar.length)
      return similar.map(adaptSongForPlayer)
    } catch (fallbackError) {
      console.error('❌ Error obteniendo canciones similares:', fallbackError)
      return []
    }
  }
}

/**
 * Calcula score de similitud entre dos canciones
 * Mayor score = más similar
 */
function calculateSimilarityScore(song1, song2) {
  let score = 0
  
  // Mismo género: +50 puntos
  if (song1.genero === song2.genero) {
    score += 50
  }
  
  // Mismo artista: +40 puntos
  if (song1.artista?.nombre === song2.artista?.nombre) {
    score += 40
  }
  
  // Mismo álbum: +30 puntos
  if (song1.album?.nombre === song2.album?.nombre) {
    score += 30
  }
  
  // Años cercanos: hasta +20 puntos
  if (song1.anio && song2.anio) {
    const yearDiff = Math.abs(song1.anio - song2.anio)
    score += Math.max(0, 20 - yearDiff * 2)
  }
  
  return score
}

/**
 * Iniciar radio desde una canción
 * Obtiene canciones similares y las prepara para reproducción
 * @param {string} songTitle - Título de la canción inicial
 */
export const startRadio = async (songTitle) => {
  try {
    const similarSongs = await getSimilarSongs(songTitle, 50)
    console.log(`🎵 Radio iniciada desde "${songTitle}" con ${similarSongs.length} canciones`)
    return similarSongs
  } catch (error) {
    console.error('Error iniciando radio:', error)
    throw error
  }
}
