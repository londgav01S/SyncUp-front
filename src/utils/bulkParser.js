// bulkParser.js
// Formato esperado del archivo de texto:
// Secciones encabezadas por [ARTISTAS], [ALBUMES], [CANCIONES]
// Columnas separadas por '|' y comentario con '#' al inicio de línea.
//
// [ARTISTAS]
// nombre|nacionalidad|generoPrincipal|generoSecundario|URLFotoArtista
// [ALBUMES]
// titulo|anio|nombreArtista|genero|URLPortadaAlbum
// [CANCIONES]
// titulo|nombreArtista|tituloAlbum|genero|anio|duracion(segundos)|URLCancion
//
// Las secciones pueden venir en cualquier orden; el flujo de creación en el front será
// ARTISTAS -> ALBUMES -> CANCIONES para respetar dependencias.

export function parseBulkText(text) {
  const lines = text.split(/\r?\n/)
  let section = null
  const result = { artistas: [], albumes: [], canciones: [] }

  for (let raw of lines) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    if (/^\[ARTISTAS\]$/i.test(line)) { section = 'ARTISTAS'; continue }
    if (/^\[ALBUMES\]$/i.test(line)) { section = 'ALBUMES'; continue }
    if (/^\[CANCIONES\]$/i.test(line)) { section = 'CANCIONES'; continue }

    const parts = line.split('|').map(p => p.trim())
    switch (section) {
      case 'ARTISTAS': {
        const [nombre, nacionalidad, generoPrincipal, generoSecundario, URLFotoArtista] = parts
        if (!nombre) break
        result.artistas.push({ nombre, nacionalidad, generoPrincipal, generoSecundario, URLFotoArtista })
        break
      }
      case 'ALBUMES': {
        const [titulo, anio, nombreArtista, genero, URLPortadaAlbum] = parts
        if (!titulo) break
        result.albumes.push({ titulo, anio: parseInt(anio, 10) || new Date().getFullYear(), nombreArtista, genero, URLPortadaAlbum })
        break
      }
      case 'CANCIONES': {
        const [titulo, nombreArtista, tituloAlbum, genero, anio, duracion, URLCancion] = parts
        if (!titulo) break
        result.canciones.push({
          titulo,
          nombreArtista,
          tituloAlbum,
          genero,
          anio: parseInt(anio, 10) || new Date().getFullYear(),
          duracion: parseFloat(duracion) || 0,
          URLCancion
        })
        break
      }
      default:
        // Línea fuera de secciones definidas
        break
    }
  }
  return result
}

export function validateBulkData(data) {
  const errors = []
  data.artistas.forEach((a,i)=>{
    if (!a.nombre || !a.nacionalidad || !a.generoPrincipal || !a.URLFotoArtista) {
      errors.push(`Artista fila ${i+1} incompleta: nombre/nacionalidad/generoPrincipal/URLFotoArtista requeridos`)
    }
  })
  data.albumes.forEach((a,i)=>{
    if (!a.titulo || !a.nombreArtista || !a.genero || !a.URLPortadaAlbum) {
      errors.push(`Álbum fila ${i+1} incompleta: titulo/nombreArtista/genero/URLPortadaAlbum requeridos`)
    }
  })
  data.canciones.forEach((c,i)=>{
    if (!c.titulo || !c.nombreArtista || !c.tituloAlbum || !c.genero || !c.URLCancion) {
      errors.push(`Canción fila ${i+1} incompleta: titulo/nombreArtista/tituloAlbum/genero/URLCancion requeridos`)
    }
  })
  return errors
}
