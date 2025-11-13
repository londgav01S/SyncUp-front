import React, { useMemo, useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AdvancedSearchFilters from '../../components/SearchBar/AdvancedSearchFilters'
import SongCard from '../../components/SongCard/SongCard'
import { getSongs } from '../../api/songService'
import { getArtists } from '../../api/artistService'
import { getAlbums } from '../../api/albumService'
import staticArtists from '../../data/artists.json'
import staticAlbums from '../../data/albums.json'
import staticSongs from '../../data/songs.json'
import './SearchPage.css'

export default function SearchPage(){
  const location = useLocation()
  const params = useMemo(()=> new URLSearchParams(location.search), [location.search])
  const q = params.get('search') || ''
  const artistParam = params.get('artist') || ''
  const genreParam = params.get('genre') || ''
  const yearFrom = params.get('yearFrom') || ''
  const yearTo = params.get('yearTo') || ''
  const op = (params.get('op') || 'and').toLowerCase()

  const [allSongs, setAllSongs] = useState([])
  const [allArtists, setAllArtists] = useState([])
  const [allAlbums, setAllAlbums] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Adapt backend song to SongCard format
  const adaptSong = (s) => ({
    id: s.id || `${s.titulo}-${s.artista?.nombre || 'NA'}`,
    title: s.titulo || s.title,
    artist: s.artista?.nombre || s.artist,
    cover: (
      s.URLPortadaCancion ||
      s.urlPortadaCancion ||
      s.album?.urlPortadaAlbum ||
      s.album?.URLPortadaAlbum ||
      s.artista?.urlfotoArtista ||
      s.cover ||
      ''
    ).toString().trim() || '/placeholder-song.svg',
    url: s.URLCancion || s.url || s.urlCancion, // Campo crítico para reproducción
    genre: s.genero || s.genre || 'Music',
    year: s.anio || s.year,
    // Mantener datos originales
    ...s
  })

  const adaptArtist = (a) => ({
    id: a.id,
    nombre: a.nombre,
    nacionalidad: a.nacionalidad,
    genero: a.generoPrincipal || a.genero,
    foto: (a.URLFotoArtista || a.urlFotoArtista || '').trim() || '/placeholder-artist.svg'
  })

  const adaptAlbum = (al) => ({
    id: al.id,
    titulo: al.titulo,
    artista: al.artista?.nombre || al.artista,
    anio: al.anio,
    genero: al.genero,
    portada: (al.URLPortadaAlbum || al.urlPortadaAlbum || '').trim() || '/placeholder-album.svg'
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Canciones: backend + estáticas
        const resSongs = await getSongs()
        const backendSongs = Array.isArray(resSongs.data) ? resSongs.data : []
        const combinedSongs = [...backendSongs.map(adaptSong), ...staticSongs.map(adaptSong)]
        setAllSongs(combinedSongs)
        console.log('🎵 Total canciones (backend + static):', combinedSongs.length)

        // Artistas: backend + estáticos
        const resArtists = await getArtists()
        const backendArtists = Array.isArray(resArtists.data) ? resArtists.data : []
        const combinedArtists = [...backendArtists.map(adaptArtist), ...staticArtists.map(adaptArtist)]
        setAllArtists(combinedArtists)
        console.log('🎤 Total artistas (backend + static):', combinedArtists.length)

        // Álbumes: backend + estáticos
        const resAlbums = await getAlbums()
        const backendAlbums = Array.isArray(resAlbums.data) ? resAlbums.data : []
        const combinedAlbums = [...backendAlbums.map(adaptAlbum), ...staticAlbums.map(adaptAlbum)]
        setAllAlbums(combinedAlbums)
        console.log('💿 Total álbumes (backend + static):', combinedAlbums.length)
      } catch (err) {
        console.error('❌ Error al cargar datos para búsqueda:', err)
        setError(err?.response?.data?.message || 'No se pudieron cargar los datos')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    
    const handler = () => fetchData()
    window.addEventListener('songs-updated', handler)
    window.addEventListener('albums-updated', handler)
    return () => {
      window.removeEventListener('songs-updated', handler)
      window.removeEventListener('albums-updated', handler)
    }
  }, [])

  const { filteredSongs, filteredArtists, filteredAlbums } = useMemo(()=>{
    const hasAny = q || artistParam || genreParam || yearFrom || yearTo
    if(!hasAny) return { filteredSongs: [], filteredArtists: [], filteredAlbums: [] }

    const yFrom = yearFrom ? parseInt(yearFrom, 10) : null
    const yTo = yearTo ? parseInt(yearTo, 10) : null
    const query = (q || '').trim().toLowerCase()

    // Filtrar canciones
    const songs = allSongs.filter(s => {
      const title = (s.title||'').toLowerCase()
      const artist = (s.artist||'').toLowerCase()
      const genre = (s.genre||'').toLowerCase()
      const year = s.year || null

      const matchQuery = query ? (title.includes(query) || artist.includes(query)) : false
      const matchArtist = artistParam ? artist.includes(artistParam.toLowerCase()) : false
      const matchGenre = genreParam ? genre === genreParam.toLowerCase() : false
      const matchYearFrom = yFrom ? (year !== null && Number(year) >= yFrom) : false
      const matchYearTo = yTo ? (year !== null && Number(year) <= yTo) : false

      if(op === 'or'){
        return (
          (query ? matchQuery : false) ||
          (artistParam ? matchArtist : false) ||
          (genreParam ? matchGenre : false) ||
          (yFrom ? matchYearFrom : false) ||
          (yTo ? matchYearTo : false)
        )
      }

      if(query && !matchQuery) return false
      if(artistParam && !matchArtist) return false
      if(genreParam && !matchGenre) return false
      if(yFrom && !matchYearFrom) return false
      if(yTo && !matchYearTo) return false
      return true
    })

    // Filtrar artistas
    const artists = allArtists.filter(a => {
      const nombre = (a.nombre||'').toLowerCase()
      const genero = (a.genero||'').toLowerCase()
      const matchQuery = query ? nombre.includes(query) : false
      const matchGenre = genreParam ? genero === genreParam.toLowerCase() : false

      if(op === 'or'){
        return (query ? matchQuery : false) || (genreParam ? matchGenre : false)
      }
      if(query && !matchQuery) return false
      if(genreParam && !matchGenre) return false
      return true
    })

    // Filtrar álbumes
    const albums = allAlbums.filter(al => {
      const titulo = (al.titulo||'').toLowerCase()
      const artistaName = (al.artista||'').toLowerCase()
      const genero = (al.genero||'').toLowerCase()
      const year = al.anio || null

      const matchQuery = query ? (titulo.includes(query) || artistaName.includes(query)) : false
      const matchArtist = artistParam ? artistaName.includes(artistParam.toLowerCase()) : false
      const matchGenre = genreParam ? genero === genreParam.toLowerCase() : false
      const matchYearFrom = yFrom ? (year !== null && Number(year) >= yFrom) : false
      const matchYearTo = yTo ? (year !== null && Number(year) <= yTo) : false

      if(op === 'or'){
        return (
          (query ? matchQuery : false) ||
          (artistParam ? matchArtist : false) ||
          (genreParam ? matchGenre : false) ||
          (yFrom ? matchYearFrom : false) ||
          (yTo ? matchYearTo : false)
        )
      }

      if(query && !matchQuery) return false
      if(artistParam && !matchArtist) return false
      if(genreParam && !matchGenre) return false
      if(yFrom && !matchYearFrom) return false
      if(yTo && !matchYearTo) return false
      return true
    })

    return { filteredSongs: songs, filteredArtists: artists, filteredAlbums: albums }
  }, [allSongs, allArtists, allAlbums, q, artistParam, genreParam, yearFrom, yearTo, op])

  const totalResults = filteredSongs.length + filteredArtists.length + filteredAlbums.length

  return (
    <div className="SearchPage">
      <div className="SearchPage__header">
        <h1 className="SearchPage__title">Búsqueda Avanzada</h1>
        <p className="SearchPage__subtitle">Encuentra tus canciones favoritas usando filtros avanzados</p>
      </div>

      <AdvancedSearchFilters submitPath="/search" />

      <div className="SearchPage__results">
        {loading ? (
          <div className="SearchPage__empty">
            <div className="SearchPage__emptyIcon">⏳</div>
            <h3>Cargando datos...</h3>
          </div>
        ) : error ? (
          <div className="SearchPage__empty">
            <div className="SearchPage__emptyIcon">❌</div>
            <h3>Error al cargar datos</h3>
            <p>{error}</p>
          </div>
        ) : totalResults === 0 && (q || artistParam || genreParam || yearFrom || yearTo) ? (
          <div className="SearchPage__empty">
            <div className="SearchPage__emptyIcon">🔍</div>
            <h3>No se encontraron resultados</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : totalResults > 0 ? (
          <>
            <div className="SearchPage__resultsHeader">
              <h2 className="SearchPage__resultsTitle">
                {totalResults} {totalResults === 1 ? 'resultado' : 'resultados'} encontrados
              </h2>
            </div>

            {/* Artistas */}
            {filteredArtists.length > 0 && (
              <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h3 style={{ 
                  fontSize: 20, 
                  fontWeight: 600, 
                  color: 'var(--text)', 
                  marginBottom: 'var(--spacing-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  🎤 Artistas ({filteredArtists.length})
                </h3>
                <div className="SearchPage__grid">
                  {filteredArtists.map(artist => (
                    <div key={artist.id} style={{
                      background: 'var(--card-bg)',
                      borderRadius: 'var(--border-radius-md)',
                      padding: 'var(--spacing-md)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 'var(--spacing-sm)',
                      transition: 'var(--transition-fast)',
                      cursor: 'pointer'
                    }}>
                      <img 
                        src={artist.foto} 
                        alt={artist.nombre}
                        onError={(e) => { e.currentTarget.src = '/placeholder-artist.svg' }}
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid var(--accent)'
                        }}
                      />
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', textAlign: 'center' }}>
                        {artist.nombre}
                      </h4>
                      <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>
                        {artist.genero} • {artist.nacionalidad}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Álbumes */}
            {filteredAlbums.length > 0 && (
              <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h3 style={{ 
                  fontSize: 20, 
                  fontWeight: 600, 
                  color: 'var(--text)', 
                  marginBottom: 'var(--spacing-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  💿 Álbumes ({filteredAlbums.length})
                </h3>
                <div className="SearchPage__grid">
                  {filteredAlbums.map(album => (
                    <div key={album.id} style={{
                      background: 'var(--card-bg)',
                      borderRadius: 'var(--border-radius-md)',
                      padding: 'var(--spacing-md)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--spacing-sm)',
                      transition: 'var(--transition-fast)',
                      cursor: 'pointer'
                    }}>
                      <img 
                        src={album.portada} 
                        alt={album.titulo}
                        onError={(e) => { e.currentTarget.src = '/placeholder-album.svg' }}
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          borderRadius: 'var(--border-radius-sm)',
                          objectFit: 'cover'
                        }}
                      />
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                        {album.titulo}
                      </h4>
                      <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                        {album.artista} • {album.anio}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {album.genero}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Canciones */}
            {filteredSongs.length > 0 && (
              <section>
                <h3 style={{ 
                  fontSize: 20, 
                  fontWeight: 600, 
                  color: 'var(--text)', 
                  marginBottom: 'var(--spacing-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  🎵 Canciones ({filteredSongs.length})
                </h3>
                <div className="SearchPage__grid">
                  {filteredSongs.map(song => (
                    <Link key={song.id} to={`/songs/${song.id}`} style={{textDecoration:'none', color:'inherit'}}>
                      <SongCard song={song} />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="SearchPage__empty">
            <div className="SearchPage__emptyIcon">🎵</div>
            <h3>Comienza tu búsqueda</h3>
            <p>Usa los filtros de arriba para encontrar canciones, artistas y álbumes</p>
          </div>
        )}
      </div>
    </div>
  )
}
