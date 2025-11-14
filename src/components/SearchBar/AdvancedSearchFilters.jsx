import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import songsData from '../../data/songs.json'
import './SearchBar.css'

// Advanced search filters UI: keyword, artist, genre, year range, AND/OR
export default function AdvancedSearchFilters({ submitPath = '/user' }){
  const nav = useNavigate()
  const location = useLocation()
  const params = useMemo(()=> new URLSearchParams(location.search), [location.search])

  const [keyword, setKeyword] = useState(params.get('search') || '')
  const [artist, setArtist] = useState(params.get('artist') || '')
  const [genre, setGenre] = useState(params.get('genre') || '')
  const [yearFrom, setYearFrom] = useState(params.get('yearFrom') || '')
  const [yearTo, setYearTo] = useState(params.get('yearTo') || '')
  const [op, setOp] = useState(params.get('op') || 'and')

  // derive candidates for artist & genre selects from local songs data
  const artists = useMemo(()=>{
    const seen = new Set()
    songsData.forEach(s => { if(s.artist) seen.add(s.artist) })
    return Array.from(seen).sort()
  }, [])
  const genres = useMemo(()=>{
    const seen = new Set()
    songsData.forEach(s => { if(s.genre) seen.add(s.genre) })
    return Array.from(seen).sort()
  }, [])

  useEffect(()=>{
    // sync local state when URL changes (useful when user navigates back)
    setKeyword(params.get('search') || '')
    setArtist(params.get('artist') || '')
    setGenre(params.get('genre') || '')
    setYearFrom(params.get('yearFrom') || '')
    setYearTo(params.get('yearTo') || '')
    setOp(params.get('op') || 'and')
  }, [location.search])

  // Limpiar la barra de búsqueda principal cuando se abre búsqueda avanzada
  useEffect(() => {
    // Buscar y limpiar el input de AutocompleteSearch en el sidebar
    const autocompleteInput = document.querySelector('.Sidebar__search input[type="search"], .AutocompleteSearch input[type="search"]')
    if (autocompleteInput) {
      autocompleteInput.value = ''
      // Disparar evento para que el componente se actualice
      const event = new Event('input', { bubbles: true })
      autocompleteInput.dispatchEvent(event)
    }
  }, []) // Solo se ejecuta al montar el componente

  const buildQuery = () => {
    const q = new URLSearchParams()
    if(keyword && keyword.trim()) q.set('search', keyword.trim())
    if(artist) q.set('artist', artist)
    if(genre) q.set('genre', genre)
    if(yearFrom) q.set('yearFrom', String(yearFrom))
    if(yearTo) q.set('yearTo', String(yearTo))
    if(op) q.set('op', op)
    return q.toString()
  }

  const onApply = (e) => {
    e.preventDefault()
    const qs = buildQuery()
    nav(qs ? `/search?${qs}` : '/search')
  }

  const onClear = ()=>{
    setKeyword('')
    setArtist('')
    setGenre('')
    setYearFrom('')
    setYearTo('')
    setOp('and')
    nav('/search')
  }

  return (
    <form className="AdvancedSearch" onSubmit={onApply} aria-label="Búsqueda avanzada">
      <div className="AdvancedSearch__row">
        <input
          className="AdvancedSearch__input"
          placeholder="Palabra clave (título, artista...)"
          value={keyword}
          onChange={e=>setKeyword(e.target.value)}
          aria-label="Palabra clave"
        />

        <select className="AdvancedSearch__select" value={artist} onChange={e=>setArtist(e.target.value)} aria-label="Artista">
          <option value="">-- Artista (cualquiera) --</option>
          {artists.map(a=> <option key={a} value={a}>{a}</option>)}
        </select>

        <select className="AdvancedSearch__select" value={genre} onChange={e=>setGenre(e.target.value)} aria-label="Género">
          <option value="">-- Género (cualquiera) --</option>
          {genres.map(g=> <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div className="AdvancedSearch__row">
        <input
          className="AdvancedSearch__inputAdvanced"
          placeholder="Año desde"
          type="number"
          value={yearFrom}
          onChange={e=>setYearFrom(e.target.value)}
          aria-label="Año desde"
        />
        <input
          className="AdvancedSearch__inputAdvanced"
          placeholder="Año hasta"
          type="number"
          value={yearTo}
          onChange={e=>setYearTo(e.target.value)}
          aria-label="Año hasta"
        />

        <div className="AdvancedSearch__op">
          <label>
            <input type="radio" name="op" checked={op==='and'} onChange={()=>setOp('and')} /> AND
          </label>
          <label>
            <input type="radio" name="op" checked={op==='or'} onChange={()=>setOp('or')} /> OR
          </label>
        </div>

        <div className="AdvancedSearch__actions">
          <button type="submit" className="AdvancedSearch__btn">Buscar</button>
          <button type="button" className="AdvancedSearch__btn Secondary" onClick={onClear}>Limpiar</button>
        </div>
      </div>

      {/* NOTE: If you later add a backend endpoint for search (e.g. GET /canciones/search), switch this UI to call it.
          TODO: Implement server-side search in src/api/songService.js when backend exposes it. */}
    </form>
  )
}
