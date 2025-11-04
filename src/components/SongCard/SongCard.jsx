import React from 'react'
import './SongCard.css'
import usePlayer from '../../hooks/usePlayer'

export default function SongCard({song}){
  const { current, playing, play, pause } = usePlayer()
  const isCurrent = current?.id === song?.id
  const isPlaying = isCurrent && playing

  const onToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if(isPlaying){
      pause()
    } else {
      play(song)
    }
  }
  return (
    <div className="SongCard song-card">
      <div className="SongCard__media">
        <img
          className="SongCard__cover"
          src={song?.cover}
          alt={song?.title}
          onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='/logo.png' }}
        />
        <button className={`SongCard__overlay ${isPlaying ? 'is-playing' : ''}`} onClick={onToggle} aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>
          {isPlaying ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>
      <div className="SongCard__info info">
        <h4 className="SongCard__title">{song?.title || 'Título'}</h4>
        <p className="SongCard__artist">{song?.artist || 'Artista'}</p>
      </div>
    </div>
  )
}
