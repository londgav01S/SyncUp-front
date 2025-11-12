import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import songs from '../../data/songs.json'
import SongCard from '../../components/SongCard/SongCard'
import HeroCarousel from '../../components/HeroCarousel/HeroCarousel'
import { getSongs } from '../../api/songService'
import './HomeUser.css'

// Scrollable Row Component
function ScrollableRow({ title, songs }) {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    const container = scrollRef.current
    if (!container) return
    
    const scrollAmount = direction === 'left' ? -400 : 400
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  return (
    <section className="HomeUser__scrollSection">
      <div className="HomeUser__sectionHeader">
        <h2 className="HomeUser__sectionTitle">{title}</h2>
        <div className="HomeUser__sectionNav">
          <button className="HomeUser__navButton" onClick={() => scroll('left')} aria-label="Anterior">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <button className="HomeUser__navButton" onClick={() => scroll('right')} aria-label="Siguiente">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div ref={scrollRef} className="HomeUser__scrollContainer">
        {songs.map((song) => (
          <div key={song.id} className="HomeUser__scrollItem">
            <Link to={`/songs/${song.id}`} style={{textDecoration:'none',color:'inherit'}}>
              <SongCard song={song} />
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function HomeUser(){
  const [remoteSongs, setRemoteSongs] = useState([])
  const [loadingRemote, setLoadingRemote] = useState(false)
  const [errorRemote, setErrorRemote] = useState(null)

  // Adapt backend song shape to SongCard expected props
  const adaptSong = (s) => ({
    id: s.id || `${s.titulo}-${s.artista?.nombre || 'NA'}`,
    title: s.titulo,
    artist: s.artista?.nombre,
    cover: (
      s.URLPortadaCancion || // backend usa campo con P mayúscula
      s.urlPortadaCancion || // por compatibilidad si el back lo envía así
      s.album?.urlPortadaAlbum ||
      s.album?.URLPortadaAlbum ||
      ''
    ).toString().trim() || '/placeholder-song.svg',
    genre: s.genero || 'Music'
  })

  useEffect(() => {
    const fetchRemote = async () => {
      setLoadingRemote(true)
      setErrorRemote(null)
      try {
        const res = await getSongs()
        console.log('📀 Respuesta backend /canciones:', res.data)
        const data = Array.isArray(res.data) ? res.data : []
        console.log('🎵 Total canciones recibidas:', data.length)
        const adapted = data.map(adaptSong)
        console.log('✅ Canciones adaptadas para UI:', adapted)
        setRemoteSongs(adapted)
      } catch (err) {
        console.error('❌ Error al cargar canciones:', err)
        setErrorRemote(err?.response?.data?.message || 'No se pudieron cargar canciones')
      } finally {
        setLoadingRemote(false)
      }
    }
    fetchRemote()
    const handler = () => fetchRemote()
    window.addEventListener('songs-updated', handler)
    return () => window.removeEventListener('songs-updated', handler)
  }, [])

  return (
    <div className="HomeUserPage">
      {/* Welcome Section */}
      <div className="HomeUser__welcome">
        <h1 className="HomeUser__welcomeTitle">
          Bienvenido
        </h1>
        <p className="HomeUser__welcomeSubtitle">
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Sección NEW (canciones desde backend) */}
      <section className="HomeUser__scrollSection">
        <div className="HomeUser__sectionHeader">
          <h2 className="HomeUser__sectionTitle">New</h2>
        </div>
        
        {loadingRemote && (
          <div style={{ padding:'var(--spacing-md)', color:'var(--text-muted)', fontSize:14 }}>Cargando canciones…</div>
        )}
        {errorRemote && !loadingRemote && (
          <div style={{ padding:'var(--spacing-md)', color:'#ff6b6b', fontSize:14 }}>{errorRemote}</div>
        )}
        {!loadingRemote && !errorRemote && (
          <div className="HomeUser__scrollContainer">
            {remoteSongs.map(song => (
              <div key={song.id} className="HomeUser__scrollItem">
                <Link to={`/songs/${song.id}`} style={{textDecoration:'none',color:'inherit'}}>
                  <SongCard song={song} />
                </Link>
              </div>
            ))}
            {remoteSongs.length === 0 && (
              <div style={{ padding:'var(--spacing-md)', opacity:.7, fontSize:14 }}>Sin canciones disponibles</div>
            )}
          </div>
        )}
      </section>

      {/* Quick Access Cards (estático - escuchado recientemente mock) */}
      <div className="HomeUser__quickAccess">
        <h2 className="HomeUser__sectionTitle">Escuchado recientemente</h2>
        <div className="HomeUser__quickGrid">
          {songs.slice(0, 6).map((song) => (
            <Link key={song.id} to={`/songs/${song.id}`} className="HomeUser__quickCard" style={{textDecoration:'none'}}>
              <img src={song.cover} alt={song.title} className="HomeUser__quickImage" />
              <div className="HomeUser__quickInfo">
                <h4 className="HomeUser__quickTitle">{song.title}</h4>
                <p className="HomeUser__quickArtist">{song.artist}</p>
              </div>
              <button className="HomeUser__quickPlayButton" aria-label="Reproducir">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Scrollable Sections */}
      <ScrollableRow title="Tendencias ahora" songs={songs.slice(0, 10)} />
      <ScrollableRow title="Nuevos lanzamientos" songs={songs.slice(5, 15)} />
      <ScrollableRow title="Recomendado para ti" songs={songs.slice(10, 20)} />

      {/* Genre Tags */}
      <div className="HomeUser__genres">
        <h2 className="HomeUser__sectionTitle">Explorar géneros</h2>
        <div className="HomeUser__genreGrid">
          {['Indie', 'Pop', 'Electronic', 'Rock', 'Acoustic', 'Jazz', 'Classical', 'R&B'].map((genre) => (
            <button key={genre} className="HomeUser__genreTag">
              <span className="HomeUser__genreIcon">🎵</span>
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="HomeUser__stats">
        <div className="HomeUser__statCard">
          <div className="HomeUser__statIcon">🎧</div>
          <div className="HomeUser__statValue">2,547</div>
          <div className="HomeUser__statLabel">Canciones reproducidas</div>
        </div>
        <div className="HomeUser__statCard">
          <div className="HomeUser__statIcon">❤️</div>
          <div className="HomeUser__statValue">143</div>
          <div className="HomeUser__statLabel">Canciones favoritas</div>
        </div>
        <div className="HomeUser__statCard">
          <div className="HomeUser__statIcon">📚</div>
          <div className="HomeUser__statValue">18</div>
          <div className="HomeUser__statLabel">Playlists creadas</div>
        </div>
        <div className="HomeUser__statCard">
          <div className="HomeUser__statIcon">⏱️</div>
          <div className="HomeUser__statValue">42h</div>
          <div className="HomeUser__statLabel">Tiempo de escucha</div>
        </div>
      </div>
    </div>
  )
}
