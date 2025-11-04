import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import data from '../../data/songs.json'
import usePlayer from '../../hooks/usePlayer'
import './SongDetails.css'

export default function SongDetails(){
  const { id } = useParams()
  const song = data.find(s => String(s.id) === String(id))
  const { current, playing, play, pause, playedSeconds, duration, controller, played } = usePlayer()

  if(!song){
    return <div className="SongDetails song-details">Canción no encontrada</div>
  }

  const isCurrent = current?.id === song.id
  const isPlaying = isCurrent && playing
  const onToggle = () => (isPlaying ? pause() : play(song))

  // Auto reproducir al entrar en detalles si no es la canción actual
  useEffect(() => {
    if(!isCurrent && song){
      play(song)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.id])

  return (
    <div className="SongDetails song-details">
      <div className="SongDetails__card">
        <img className="SongDetails__cover" src={song.cover} alt={song.title} onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='/logo.png' }} />
        <div className="SongDetails__body">
          <h2 className="SongDetails__title">{song.title}</h2>
          <p className="SongDetails__subtitle">{song.artist} • {song.genre} • {song.year}</p>

          <div className="SongDetails__controls">
            <button className="SongDetails__btn" onClick={onToggle}>{isPlaying ? 'Pausar' : 'Reproducir'}</button>
          </div>

          <div className="SongDetails__progress">
            <span className="SongDetails__time">{formatTime(isCurrent ? playedSeconds : 0)}</span>
            <input
              type="range"
              min={0}
              max={Math.max(1, isCurrent ? duration : 0)}
              value={Math.min(isCurrent ? duration : 0, isCurrent ? playedSeconds : 0)}
              step={1}
              style={{"--played": `${isCurrent && duration ? Math.min(100, Math.max(0, (played||0)*100)) : 0}%`}}
              onChange={(e)=> controller.seekToSeconds(Number(e.target.value))}
            />
            <span className="SongDetails__time">{formatTime(isCurrent ? duration : 0)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTime(sec){
  if(!sec || isNaN(sec)) return '0:00'
  const m = Math.floor(sec/60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2,'0')}`
}
