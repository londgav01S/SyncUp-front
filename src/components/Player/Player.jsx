import React, { useRef, useEffect, useState, useMemo } from 'react'
import ReactPlayer from 'react-player'
import './Player.css'
import usePlayer from '../../hooks/usePlayer'

export default function Player(){
  const {
    current,
    playing,
    pause,
    play,
    setDuration,
    setProgress,
    setController,
    playedSeconds,
    duration,
    volume,
    setVolume,
    muted,
    setMuted,
    // Radio mode
    isRadioMode,
    radioQueue,
    radioBaseSong,
    exitRadioMode,
    playNextRadioSong,
    // Playback controls
    playNext,
    playPrevious,
    shuffle,
    toggleShuffle,
    loop,
    toggleLoop,
  } = usePlayer()

  // Determinar si el player debe estar visible
  const isPlayerVisible = current !== null

  // Debug: log cuando cambian current o playing
  useEffect(() => {
    console.log('🎬 Player received update:', {
      currentId: current?.id,
      currentTitle: current?.title,
      playing,
      hasUrl: !!current?.url,
      url: current?.url,
      isPlayerVisible
    })
  }, [current, playing, isPlayerVisible])

  // Escuchar evento radio-started
  useEffect(() => {
    const handleRadioStarted = (e) => {
      const { baseSong, queue } = e.detail
      console.log('📻 Evento radio-started recibido en Player', { baseSong, queueLength: queue?.length })
      if (window.PlayerContext?.startRadioMode) {
        window.PlayerContext.startRadioMode(baseSong, queue)
      }
    }
    
    window.addEventListener('radio-started', handleRadioStarted)
    return () => window.removeEventListener('radio-started', handleRadioStarted)
  }, [])

  const playerRef = useRef(null)
  const [seeking, setSeeking] = useState(false)
  const [tempSeekValue, setTempSeekValue] = useState(0)
  const intervalRef = useRef(null)
  const [logs, setLogs] = useState([])
  const [lastState, setLastState] = useState('INIT')
  const [debug] = useState(() => {
    try {
      const qs = new URLSearchParams(window.location.search)
      return qs.get('debugPlayer') === '1' || localStorage.getItem('debugPlayer') === '1'
    } catch { return false }
  })

  const url = current?.url
  const isReadyToLoad = useMemo(() => Boolean(url), [url])

  useEffect(() => {
    // Expose seek controller for other components (SongDetails etc.)
    setController({
      seekToSeconds: (sec) => playerRef.current?.seekTo(sec, 'seconds'),
      seekToFraction: (f) => playerRef.current?.seekTo(f, 'fraction'),
    })
  }, [setController])

  const handleSeekMouseDown = () => setSeeking(true)
  const handleSeekChange = (e) => setTempSeekValue(Number(e.target.value))
  const handleSeekMouseUp = (e) => {
    setSeeking(false)
    const value = Number(e.target.value)
    if (playerRef.current) playerRef.current.seekTo(value, true)
  }

  const toggleMute = () => setMuted(!muted)
  const handleVolumeChange = (e) => {
    const newVolume = Number(e.target.value)
    setVolume(newVolume)
    if (newVolume > 0 && muted) setMuted(false)
  }

  const displaySeconds = seeking ? tempSeekValue : playedSeconds
  const progressPercent = duration > 0 ? (displaySeconds / duration) * 100 : 0

  return (
    <div className={`Player player ${isPlayerVisible ? 'Player--visible' : ''}`}>
      {/* Información de la canción (izquierda) */}
      <div className="Player__songInfo">
        {current && (
          <>
            <img
              src={current.cover}
              alt={current.title}
              className="Player__albumArt"
              onError={(e) => {
                e.currentTarget.src = '/logo.png'
              }}
            />
            <div className="Player__trackDetails">
              <h4 className="Player__trackTitle">{current.title}</h4>
              <p className="Player__trackArtist">
                {current.artist}
                {isRadioMode && (
                  <span className="Player__radioIndicator">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 8, marginRight: 4 }}>
                      <circle cx="12" cy="12" r="2" />
                      <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
                    </svg>
                    Radio: {radioBaseSong?.title || radioBaseSong?.titulo}
                  </span>
                )}
              </p>
            </div>
            <button className="Player__iconButton" aria-label="Me gusta">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Controles centrales */}
      <div className="Player__controls">
        {/* Botones de control */}
        <div className="Player__controlButtons">
          <button 
            className={`Player__controlBtn ${shuffle ? 'Player__controlBtn--active' : ''}`}
            onClick={toggleShuffle}
            aria-label="Aleatorio"
            title={shuffle ? 'Aleatorio activado' : 'Aleatorio desactivado'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
            </svg>
          </button>

          <button 
            className="Player__controlBtn" 
            onClick={playPrevious}
            aria-label="Anterior"
            disabled={!current}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button
            className="Player__playButton"
            onClick={() => (playing ? pause() : current && play(current))}
            aria-label={playing ? 'Pausar' : 'Reproducir'}
          >
            {playing ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button 
            className="Player__controlBtn" 
            onClick={playNext}
            aria-label="Siguiente"
            disabled={!current}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 18h2V6h-2zM6 18l8.5-6L6 6z" />
            </svg>
          </button>

          {isRadioMode ? (
            <button 
              className="Player__controlBtn Player__controlBtn--active" 
              aria-label="Salir de Radio"
              onClick={exitRadioMode}
              title="Salir del modo radio"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="2" />
                <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
              </svg>
            </button>
          ) : (
            <button 
              className={`Player__controlBtn ${loop !== 'off' ? 'Player__controlBtn--active' : ''}`}
              onClick={toggleLoop}
              aria-label="Repetir"
              title={loop === 'off' ? 'Repetir desactivado' : loop === 'one' ? 'Repetir una canción' : 'Repetir todas'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                {loop === 'one' ? (
                  <>
                    <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                    <text x="12" y="16" fontSize="10" textAnchor="middle" fill="currentColor" fontWeight="bold">1</text>
                  </>
                ) : (
                  <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                )}
              </svg>
            </button>
          )}
        </div>

        {/* Barra de progreso */}
        <div className="Player__progressContainer">
          <span className="Player__time">{formatTime(displaySeconds)}</span>
          <div className="Player__seekBarContainer">
            <input
              type="range"
              min={0}
              max={Math.max(1, duration)}
              step={0.1}
              value={seeking ? tempSeekValue : Math.min(duration, playedSeconds)}
              onChange={handleSeekChange}
              onMouseDown={handleSeekMouseDown}
              onMouseUp={handleSeekMouseUp}
              onTouchStart={handleSeekMouseDown}
              onTouchEnd={handleSeekMouseUp}
              className="Player__seek"
              style={{
                '--progress': `${Math.min(100, Math.max(0, progressPercent))}%`,
              }}
              aria-label="Barra de progreso"
            />
          </div>
          <span className="Player__time">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controles de volumen (derecha) */}
      <div className="Player__volumeSection">
        <button className="Player__iconButton" onClick={toggleMute} aria-label="Silenciar">
          {muted || volume === 0 ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          ) : volume > 0.5 ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 9v6h4l5 5V4l-5 5H7z" />
            </svg>
          )}
        </button>

        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={handleVolumeChange}
          className="Player__volumeSlider"
          style={{
            '--volume': `${(muted ? 0 : volume) * 100}%`,
          }}
          aria-label="Control de volumen"
        />
      </div>

      {/* Panel de Debug */}
      {debug && (
        <div style={{ position: 'fixed', bottom: 110, left: 20, zIndex: 9999, width: 340, background: 'rgba(0,0,0,0.8)', color: '#fff', padding: 12, borderRadius: 8, fontSize: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <strong>DEBUG Player</strong>
            <button
              onClick={() => { localStorage.setItem('debugPlayer', '0'); alert('Debug desactivado. Recarga la página.'); }}
              style={{ background: '#444', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}
            >Desactivar</button>
          </div>
          <div>url: {url || '(sin url)'}</div>
          <div>playing: {String(playing)} | state: {lastState}</div>
          <div>dur: {Math.round(duration)}s | cur: {Math.round(playedSeconds)}s</div>
          <div>vol: {Math.round((muted ? 0 : volume) * 100)}% | muted: {String(muted)}</div>
          {isRadioMode && (
            <div style={{ background: '#1DB954', padding: 4, borderRadius: 4, marginTop: 4 }}>
              📻 Radio Mode: {radioQueue?.length || 0} en cola
            </div>
          )}
          {!current && (
            <button
              onClick={() => play({ id: 999, title: 'Debug: Shape of You', artist: 'Ed Sheeran', cover: 'https://picsum.photos/seed/hero-shapeofyou/512/512', url: 'https://www.youtube.com/watch?v=JGwWNGJdvx8' })}
              style={{ marginTop: 8, background: '#F25C43', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: 4, cursor: 'pointer' }}
            >Cargar y reproducir demo</button>
          )}
          <div style={{ marginTop: 8, maxHeight: 140, overflow: 'auto', background: '#111', padding: 8, borderRadius: 4 }}>
            {logs.map((l, i) => (
              <div key={i} style={{ opacity: 0.9 }}>{l}</div>
            ))}
          </div>
          <div style={{ marginTop: 6, opacity: 0.8 }}>Tip: añade ?debugPlayer=1 a la URL o guarda localStorage.debugPlayer=1</div>
        </div>
      )}

      {/* Reproductor visible en debug para ver el iframe */}
      {debug && url && (
        <div style={{ position: 'fixed', bottom: 110, right: 20, zIndex: 9999, background: '#000', padding: 8, borderRadius: 6 }}>
          <ReactPlayer
            ref={playerRef}
            url={url}
            playing={playing}
            controls
            width="320px"
            height="180px"
            volume={muted ? 0 : volume}
            muted={muted}
            onReady={() => setLogs((l) => [...l.slice(-20), 'onReady'])}
            onStart={() => { setLastState('PLAYING'); setLogs((l) => [...l.slice(-20), 'onStart']) }}
            onPlay={() => { setLastState('PLAYING'); setLogs((l) => [...l.slice(-20), 'onPlay']) }}
            onPause={() => { setLastState('PAUSED'); setLogs((l) => [...l.slice(-20), 'onPause']) }}
            onEnded={() => { 
              setLastState('ENDED'); 
              if (isRadioMode) {
                console.log('🔄 Auto-reproduciendo siguiente canción en radio')
                playNextRadioSong()
              } else if (loop === 'one') {
                console.log('🔁 Repitiendo la misma canción')
                if (playerRef.current) {
                  playerRef.current.seekTo(0)
                  play(current)
                }
              } else {
                playNext()
              }
              setLogs((l) => [...l.slice(-20), 'onEnded']) 
            }}
            onBuffer={() => setLogs((l) => [...l.slice(-20), 'onBuffer'])}
            onError={(e) => setLogs((l) => [...l.slice(-20), `onError: ${e?.message || e}`])}
            onDuration={(d) => { setDuration(d); setLogs((l) => [...l.slice(-20), `onDuration: ${Math.round(d)}s`]) }}
            onProgress={(state) => {
              if (!seeking) {
                setProgress({ playedSeconds: state.playedSeconds, played: state.played })
              }
            }}
            config={{
              youtube: {
                playerVars: { modestbranding: 1, rel: 0, playsinline: 1 },
              },
            }}
          />
        </div>
      )}

      {/* Reproductor oculto (audio) cuando no está en modo debug */}
      {!debug && url && (
        <div style={{ position: 'absolute', left: -9999, top: -9999, width: 0, height: 0, overflow: 'hidden' }}>
          <ReactPlayer
            ref={playerRef}
            url={url}
            playing={playing}
            controls={false}
            width="0"
            height="0"
            volume={muted ? 0 : volume}
            muted={muted}
            onReady={() => setLogs((l) => [...l.slice(-20), 'onReady'])}
            onStart={() => { setLastState('PLAYING'); setLogs((l) => [...l.slice(-20), 'onStart']) }}
            onPlay={() => { setLastState('PLAYING'); setLogs((l) => [...l.slice(-20), 'onPlay']) }}
            onPause={() => { setLastState('PAUSED'); setLogs((l) => [...l.slice(-20), 'onPause']) }}
            onEnded={() => { 
              setLastState('ENDED'); 
              if (isRadioMode) {
                console.log('🔄 Auto-reproduciendo siguiente canción en radio')
                playNextRadioSong()
              } else if (loop === 'one') {
                console.log('🔁 Repitiendo la misma canción')
                if (playerRef.current) {
                  playerRef.current.seekTo(0)
                  play(current)
                }
              } else {
                playNext()
              }
              setLogs((l) => [...l.slice(-20), 'onEnded']) 
            }}
            onBuffer={() => setLogs((l) => [...l.slice(-20), 'onBuffer'])}
            onError={(e) => setLogs((l) => [...l.slice(-20), `onError: ${e?.message || e}`])}
            onDuration={(d) => { setDuration(d); setLogs((l) => [...l.slice(-20), `onDuration: ${Math.round(d)}s`]) }}
            onProgress={(state) => {
              if (!seeking) {
                setProgress({ playedSeconds: state.playedSeconds, played: state.played })
              }
            }}
            config={{
              youtube: {
                playerVars: { modestbranding: 1, rel: 0, playsinline: 1 },
              },
            }}
          />
        </div>
      )}
    </div>
  )
}

function formatTime(sec){
  if(!sec || isNaN(sec)) return '0:00'
  const m = Math.floor(sec/60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2,'0')}`
}
