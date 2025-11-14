import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axiosConfig'
import './SearchBar.css'
import songsData from '../../data/songs.json'

function highlight(text, query){
  if(!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if(idx === -1) return text
  return (
    <span>
      {text.substring(0, idx)}
      <strong>{text.substring(idx, idx + query.length)}</strong>
      {text.substring(idx + query.length)}
    </span>
  )
}

export default function AutocompleteSearch({ placeholder = 'Buscar canciones, artistas, playlists...', submitPath = '/user' }){
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const containerRef = useRef(null)
  const debounceRef = useRef(null)
  const itemsRef = useRef([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef(null)
  const navDebounceRef = useRef(null)

  useEffect(()=>{
    return ()=>{
      if(debounceRef.current) clearTimeout(debounceRef.current)
      if(navDebounceRef.current) clearTimeout(navDebounceRef.current)
    }
  }, [])

  // Try to load songs from backend once; fallback to local JSON on error or empty result
  useEffect(()=>{
    let mounted = true
    axios.get('/canciones')
      .then(res=>{
        if(!mounted) return
        console.log('🎵 Canciones del backend:', res.data)
        if(Array.isArray(res.data) && res.data.length > 0){
          // Log primera canción para ver estructura
          console.log('📊 Estructura de primera canción:', res.data[0])
          setSuggestions([])
          setApiSongs(res.data)
          setApiAvailable(true)
        } else {
          console.log('⚠️ Backend no devolvió canciones, usando datos locales')
          setApiAvailable(false)
        }
      }).catch((err)=>{
        console.error('❌ Error al cargar canciones del backend:', err.message)
        if(mounted) setApiAvailable(false)
      })
    return ()=>{ mounted = false }
  }, [])

  // store API songs if available
  const [apiAvailable, setApiAvailable] = useState(false)
  const [apiSongs, setApiSongs] = useState([])

  useEffect(()=>{
    if(debounceRef.current) clearTimeout(debounceRef.current)
    if(!query || query.trim().length < 1){ setSuggestions([]); setOpen(false); return }
    debounceRef.current = setTimeout(()=>{
      const q = query.trim().toLowerCase()
      const source = apiAvailable && Array.isArray(apiSongs) && apiSongs.length ? apiSongs : songsData
      
      // Adaptarse a campos del backend (titulo, artista.nombre) o locales (title, artist)
      const res = source.filter(s => {
        const title = s.titulo || s.title || ''
        const artist = s.artista?.nombre || s.artist || ''
        return title.toLowerCase().includes(q) || artist.toLowerCase().includes(q)
      })
      
      setSuggestions(res.slice(0, 8))
      setActiveIndex(-1)
      setOpen(true)
    }, 200)

    // Auto-navigate to advanced search page when user starts typing (debounced 400ms)
    if(navDebounceRef.current) clearTimeout(navDebounceRef.current)
    if(query && query.trim().length >= 1){
      navDebounceRef.current = setTimeout(()=>{
        const encoded = encodeURIComponent(query.trim())
        nav(`/search?search=${encoded}`, { replace: true })
      }, 400)
    }
  }, [query, apiAvailable, apiSongs, nav])

  useEffect(()=>{
    const onDocClick = (e)=>{
      if(!containerRef.current) return
      if(!containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return ()=> document.removeEventListener('click', onDocClick)
  }, [])

  const onSelect = (song)=>{
    setQuery('')
    setOpen(false)
    // try to focus back to input (harmless if navigation unmounts component)
    try { inputRef.current?.focus() } catch(e) {}
    // navigate to song details route if exists
    nav(`/songs/${song.id}`)
  }

  const onKeyDown = (e) => {
    if(e.key === 'ArrowDown'){
      e.preventDefault()
      if(!open && suggestions.length){ setOpen(true); setActiveIndex(0); return }
      // circular: next index, wrap to 0
      setActiveIndex(i => {
        const len = suggestions.length
        if(len === 0) return -1
        return i < 0 ? 0 : (i + 1) % len
      })
      return
    }
    if(e.key === 'ArrowUp'){
      e.preventDefault()
      // circular: previous index, wrap to last
      setActiveIndex(i => {
        const len = suggestions.length
        if(len === 0) return -1
        if(i <= 0) return len - 1
        return i - 1
      })
      return
    }
    if(e.key === 'Escape'){
      setOpen(false)
      setActiveIndex(-1)
      return
    }
    if(e.key === 'Enter'){
      e.preventDefault()
      if(open && activeIndex >= 0 && suggestions[activeIndex]){
        onSelect(suggestions[activeIndex])
        return
      }
      if(query && query.trim().length){
        const encoded = encodeURIComponent(query.trim())
        setQuery('')
        setOpen(false)
        try { inputRef.current?.focus() } catch(e) {}
        nav(`/search?search=${encoded}`)
      }
    }
  }

  // keep active item visible
  useEffect(()=>{
    if(activeIndex >= 0 && itemsRef.current[activeIndex]){
      itemsRef.current[activeIndex].scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  return (
    <div className="SearchBar" ref={containerRef} style={{maxWidth:420}}>
      <div className="SearchBar__wrapper">
        <button
          type="button"
          className="SearchBar__iconBtn"
          aria-label="Abrir búsqueda avanzada"
          title="Abrir búsqueda avanzada"
          onClick={() => {
            try {
              const baseQuery = query && query.trim() ? `search=${encodeURIComponent(query.trim())}&` : ''
              nav(`/search?${baseQuery}`)
            } catch(e) {
              nav('/search')
            }
          }}
        >
          <svg className="SearchBar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        <input
          className="SearchBar__input"
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={e=>setQuery(e.target.value)}
          ref={inputRef}
          onFocus={()=>{ if(suggestions.length) setOpen(true) }}
          onKeyDown={onKeyDown}
          aria-label="Buscar"
        />
      </div>

      {open && suggestions.length > 0 && (
        <div className="SearchBar__suggestions" role="listbox" aria-label="Sugerencias">
          {suggestions.map((s, idx)=> {
            // Adaptarse a campos del backend o locales
            const title = s.titulo || s.title || 'Sin título'
            const artist = s.artista?.nombre || s.artist || 'Artista desconocido'
            const cover = s.URLPortadaCancion || s.album?.URLPortadaAlbum || s.cover || 'https://via.placeholder.com/48x48/1A3C55/00C8C2?text=♪'
            
            // Debug: ver qué cover se está usando
            if (idx === 0) {
              console.log('🖼️ Cover seleccionado:', cover, 'de canción:', s)
            }
            
            return (
              <button
                key={s.id}
                ref={el => itemsRef.current[idx] = el}
                role="option"
                aria-selected={activeIndex === idx}
                className={`SearchBar__suggestion ${activeIndex === idx ? 'SearchBar__suggestion--active' : ''}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(-1)}
                onClick={() => onSelect(s)}
              >
                <img 
                  src={cover} 
                  alt={title} 
                  className="SearchBar__suggestionImg"
                  onError={(e) => {
                    console.error('❌ Error cargando imagen:', cover)
                    e.target.onerror = null
                    e.target.src = 'https://via.placeholder.com/48x48/1A3C55/00C8C2?text=♪'
                  }}
                />
                <div className="SearchBar__suggestionInfo">
                  <div className="SearchBar__suggestionTitle">{highlight(title, query)}</div>
                  <div className="SearchBar__suggestionArtist">{highlight(artist, query)}</div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
