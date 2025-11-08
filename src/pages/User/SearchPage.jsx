import React, { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AdvancedSearchFilters from '../../components/SearchBar/AdvancedSearchFilters'
import SongCard from '../../components/SongCard/SongCard'
import songs from '../../data/songs.json'
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

  const filtered = useMemo(()=>{
    const hasAny = q || artistParam || genreParam || yearFrom || yearTo
    if(!hasAny) return []

    const yFrom = yearFrom ? parseInt(yearFrom, 10) : null
    const yTo = yearTo ? parseInt(yearTo, 10) : null

    const query = (q || '').trim().toLowerCase()

    return songs.filter(s => {
      const title = (s.title||'').toLowerCase()
      const artist = (s.artist||'').toLowerCase()
      const genre = (s.genre||'').toLowerCase()
      const year = s.year || s.anio || null

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
  }, [q, artistParam, genreParam, yearFrom, yearTo, op])

  return (
    <div className="SearchPage">
      <div className="SearchPage__header">
        <h1 className="SearchPage__title">Búsqueda Avanzada</h1>
        <p className="SearchPage__subtitle">Encuentra tus canciones favoritas usando filtros avanzados</p>
      </div>

      <AdvancedSearchFilters submitPath="/search" />

      <div className="SearchPage__results">
        {filtered.length === 0 && (q || artistParam || genreParam || yearFrom || yearTo) ? (
          <div className="SearchPage__empty">
            <div className="SearchPage__emptyIcon">🔍</div>
            <h3>No se encontraron resultados</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : filtered.length > 0 ? (
          <>
            <div className="SearchPage__resultsHeader">
              <h2 className="SearchPage__resultsTitle">
                {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'} encontrados
              </h2>
            </div>
            <div className="SearchPage__grid">
              {filtered.map(song => (
                <Link key={song.id} to={`/songs/${song.id}`} style={{textDecoration:'none', color:'inherit'}}>
                  <SongCard song={song} />
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="SearchPage__empty">
            <div className="SearchPage__emptyIcon">🎵</div>
            <h3>Comienza tu búsqueda</h3>
            <p>Usa los filtros de arriba para encontrar canciones</p>
          </div>
        )}
      </div>
    </div>
  )
}
