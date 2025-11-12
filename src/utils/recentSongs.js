// Utility to track up to 10 most recently added songs on this device (localStorage)
// Shape stored: { id?, titulo, nombreArtista, tituloAlbum, URLCancion, URLPortadaCancion?, anio?, genero?, ts }

const STORAGE_KEY = 'recent_songs_v1'
const LIMIT = 10

const read = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch (_) { return [] }
}

const write = (list) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, LIMIT))) } catch (_) {}
}

export function getRecentSongs() {
  const list = read()
  // Sort desc by timestamp in case of any disorder
  return list.sort((a,b) => (b.ts||0) - (a.ts||0)).slice(0, LIMIT)
}

export function addRecentSong(songLike) {
  if (!songLike) return
  const now = Date.now()
  const item = {
    id: songLike.id || songLike._id || undefined,
    titulo: songLike.titulo || songLike.title || '',
    nombreArtista: songLike.nombreArtista || songLike.artista?.nombre || songLike.artist || '',
    tituloAlbum: songLike.tituloAlbum || songLike.album?.titulo || songLike.album || '',
    URLCancion: songLike.URLCancion || songLike.url || '',
    URLPortadaCancion: songLike.URLPortadaCancion || songLike.album?.URLPortadaAlbum || songLike.album?.urlPortadaAlbum || songLike.cover || '',
    anio: songLike.anio,
    genero: songLike.genero,
    ts: now,
  }
  const list = read()
  // dedupe by id if available, otherwise by composite key
  const key = (s) => (s.id ? `id:${s.id}` : `k:${(s.titulo||'')}-${(s.nombreArtista||'')}-${(s.tituloAlbum||'')}`)
  const targetKey = key(item)
  const filtered = list.filter(s => key(s) !== targetKey)
  filtered.unshift(item)
  write(filtered.slice(0, LIMIT))
}

export function clearRecentSongs() { try { localStorage.removeItem(STORAGE_KEY) } catch(_) {} }
