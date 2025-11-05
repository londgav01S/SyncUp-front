import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import data from '../../data/songs.json'
import usePlayer from '../../hooks/usePlayer'
import './SongDetails.css'

export default function SongDetails(){
  const { id } = useParams()
  const song = useMemo(() => data.find(s => String(s.id) === String(id)), [id])
  const {
    current,
    playing,
    play,
    pause,
    playedSeconds,
    duration,
    controller,
    setVolume, // reservado por si se necesita
  } = usePlayer()

  // Estados UI locales
  const [seeking, setSeeking] = useState(false)
  const [tempSeekValue, setTempSeekValue] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)

  if(!song){
    return (
      <div className="SongDetails song-details">
        <div className="SongDetails__error">
          <h2>⚠️ Canción no encontrada</h2>
          <Link className="SongDetails__btn SongDetails__btn--secondary" to="/">Volver al inicio</Link>
        </div>
      </div>
    )
  }

  const isCurrent = current?.id === song.id
  const isPlaying = isCurrent && playing
  
  const onToggle = () => {
    console.log('🎛️ SongDetails Toggle:', { isPlaying, songTitle: song?.title })
    isPlaying ? pause() : play(song)
  }

  // Auto reproducir al entrar
  useEffect(() => {
    console.log('🎵 SongDetails useEffect:', {
      songId: song?.id,
      songTitle: song?.title,
      isCurrent,
      playing,
      currentId: current?.id,
      hasUrl: !!song?.url,
      url: song?.url
    })
    // Si no es la canción actual, o si es la actual pero no está reproduciendo, iniciar
    if (song) {
      if (!isCurrent) {
        console.log('▶️ Playing (not current):', song.title)
        play(song)
      } else if (!playing) {
        console.log('▶️ Playing (current but paused):', song.title)
        play(song)
      } else {
        console.log('✅ Already playing:', song.title)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.id])

  // Valores para el progreso
  const displaySeconds = seeking ? tempSeekValue : (isCurrent ? playedSeconds : 0)
  const displayDuration = isCurrent ? duration : (song.duration || 0)
  const progressPercent = displayDuration > 0 ? Math.min(100, Math.max(0, (displaySeconds / displayDuration) * 100)) : 0

  // Handlers de seek
  const handleSeekMouseDown = () => setSeeking(true)
  const handleSeekChange = (e) => setTempSeekValue(Number(e.target.value))
  const handleSeekMouseUp = (e) => {
    setSeeking(false)
    const value = Number(e.target.value)
    if(isCurrent && controller?.seekToSeconds){
      controller.seekToSeconds(value)
    }
  }

  // Relacionadas por género (fallback 4 cualquiera)
  const related = useMemo(() => {
    const same = data.filter(s => s.genre === song.genre && s.id !== song.id).slice(0,4)
    if (same.length < 4) {
      const others = data.filter(s => s.id !== song.id && !same.some(x => x.id === s.id))
      return [...same, ...others.slice(0, 4 - same.length)]
    }
    return same
  }, [song])

  return (
    <div className="SongDetails song-details">
      {/* Hero con background blur */}
      <section className="SongDetails__hero">
        <div className="SongDetails__heroBg">
          <img src={song.cover} alt="" onError={(e)=>{ e.currentTarget.src='/logo.png' }} />
          <div className="SongDetails__heroOverlay" />
        </div>

        <div className="SongDetails__heroContent">
          {/* Izquierda: cover con overlay de play y badge de reproduciendo */}
          <div className="SongDetails__left">
            <div className="SongDetails__coverWrap">
              <img className="SongDetails__cover" src={song.cover} alt={song.title} onError={(e)=>{ e.currentTarget.src='/logo.png' }} />
              <button className="SongDetails__coverPlay" onClick={onToggle} aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>
                {isPlaying ? (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                ) : (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
              {isPlaying && (
                <div className="SongDetails__nowPlaying">
                  <div className="SongDetails__wave"><span/><span/><span/></div>
                  Reproduciendo
                </div>
              )}
            </div>
          </div>

          {/* Derecha: meta, título, artista y stats */}
          <div className="SongDetails__right">
            <div className="SongDetails__type">CANCIÓN</div>
            <h1 className="SongDetails__title">{song.title}</h1>
            <p className="SongDetails__artist">{song.artist}</p>

            <div className="SongDetails__meta">
              <span>{song.album}</span>
              <span>{song.year}</span>
              <span>{song.genre}</span>
              <span>{formatTime(displayDuration)}</span>
            </div>

            <div className="SongDetails__stats">
              <div className="SongDetails__stat">
                <div className="SongDetails__statValue">1.2M</div>
                <div className="SongDetails__statLabel">Reproducciones</div>
              </div>
              <div className="SongDetails__stat">
                <div className="SongDetails__statValue">45K</div>
                <div className="SongDetails__statLabel">Me gusta</div>
              </div>
              <div className="SongDetails__stat">
                <div className="SongDetails__statValue">8.2K</div>
                <div className="SongDetails__statLabel">En playlists</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tarjeta de controles */}
      <section className="SongDetails__controlsCard">
        <div className="SongDetails__mainControls">
          <button className="SongDetails__ctrl SongDetails__ctrl--secondary" aria-label="Anterior">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
          </button>
          <button className="SongDetails__ctrl SongDetails__ctrl--primary" onClick={onToggle} aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>
            {isPlaying ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
          <button className="SongDetails__ctrl SongDetails__ctrl--secondary" aria-label="Siguiente">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 18h2V6h-2zM6 18l8.5-6L6 6z" /></svg>
          </button>
        </div>

        <div className="SongDetails__progress">
          <span className="SongDetails__time">{formatTime(displaySeconds)}</span>
          <input
            type="range"
            min={0}
            max={Math.max(1, displayDuration)}
            step={0.1}
            value={seeking ? tempSeekValue : Math.min(displayDuration, displaySeconds)}
            onChange={handleSeekChange}
            onMouseDown={handleSeekMouseDown}
            onMouseUp={handleSeekMouseUp}
            onTouchStart={handleSeekMouseDown}
            onTouchEnd={handleSeekMouseUp}
            style={{ '--played': `${progressPercent}%` }}
            aria-label="Barra de progreso"
          />
          <span className="SongDetails__time">{formatTime(displayDuration)}</span>
        </div>

        <div className="SongDetails__actions">
          <button
            className={`SongDetails__btn ${isFavorite ? 'is-active' : ''}`}
            onClick={() => setIsFavorite(v => !v)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
            {isFavorite ? 'Guardado' : 'Me gusta'}
          </button>

          <button className="SongDetails__btn SongDetails__btn--secondary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Agregar a playlist
          </button>

          <button className="SongDetails__btn SongDetails__btn--secondary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
            Compartir
          </button>

          {song.lyrics && (
            <button className="SongDetails__btn SongDetails__btn--secondary" onClick={() => setShowLyrics(v => !v)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
              {showLyrics ? 'Ocultar letra' : 'Letra'}
            </button>
          )}
        </div>
      </section>

      {/* Letra */}
      {showLyrics && song.lyrics && (
        <section className="SongDetails__lyrics">
          <h3 className="SongDetails__lyricsTitle">Letra de la canción</h3>
          <div className="SongDetails__lyricsBody">
            {song.lyrics.split('\n').map((line, i) => (<p key={i}>{line}</p>))}
          </div>
        </section>
      )}

      {/* Relacionadas */}
      <section className="SongDetails__related">
        <h3 className="SongDetails__sectionTitle">Canciones similares</h3>
        <div className="SongDetails__relatedGrid">
          {related.map(r => (
            <Link key={r.id} to={`/songs/${r.id}`} className="SongDetails__relatedCard">
              <img src={r.cover} alt={r.title} onError={(e)=>{ e.currentTarget.src='/logo.png' }} />
              <div className="SongDetails__relatedInfo">
                <h4>{r.title}</h4>
                <p>{r.artist}</p>
              </div>
              <span className="SongDetails__relatedPlay" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

function formatTime(sec){
  if(!sec || isNaN(sec)) return '0:00'
  const m = Math.floor(sec/60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2,'0')}`
}
