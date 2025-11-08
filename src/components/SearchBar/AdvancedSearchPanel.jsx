import React, { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AdvancedSearchFilters from './AdvancedSearchFilters'
import songs from '../../data/songs.json'
import SongCard from '../SongCard/SongCard'
import './SearchBar.css'

export default function AdvancedSearchPanel(){
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
    <section className="AdvancedSearchPanel">
      <AdvancedSearchFilters submitPath="/user" />

      <div className="AdvancedSearchPanel__results">
        <h3 className="HomeUser__sectionTitle">Resultados avanzados</h3>
        {filtered.length === 0 ? (
          <div style={{padding:20, color:'var(--text-muted)'}}>No se encontraron resultados para los filtros seleccionados.</div>
        ) : (
          <div className="AdvancedSearchPanel__grid">
            {filtered.map(s => (
              <Link key={s.id} to={`/songs/${s.id}`} className="AdvancedSearchPanel__item" style={{textDecoration:'none', color:'inherit'}}>
                <SongCard song={s} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
