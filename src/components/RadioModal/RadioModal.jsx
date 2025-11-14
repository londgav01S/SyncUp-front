import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getSimilarSongs } from '../../api/radioService'
import SongCard from '../SongCard/SongCard'
import ImageWithFallback from '../ImageWithFallback'
import './RadioModal.css'

export default function RadioModal({ isOpen, onClose, baseSong }) {
  const [radioQueue, setRadioQueue] = useState([])
  const [loading, setLoading] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [currentPlayingSong, setCurrentPlayingSong] = useState(null)

  useEffect(() => {
    if (isOpen && baseSong) {
      loadRadioQueue()
    }
  }, [isOpen, baseSong])

  // Escuchar cambios en el player para destacar canción actual
  useEffect(() => {
    const handlePlayerUpdate = () => {
      if (window.PlayerContext?.current && window.PlayerContext?.isRadioMode) {
        setCurrentPlayingSong(window.PlayerContext.current)
        // Encontrar índice de la canción actual en la cola
        const currentIdx = radioQueue.findIndex(song => 
          song.id === window.PlayerContext.current.id || 
          song.titulo === window.PlayerContext.current.title
        )
        if (currentIdx !== -1) {
          setCurrentIndex(currentIdx)
        }
      }
    }

    const interval = setInterval(handlePlayerUpdate, 1000)
    return () => clearInterval(interval)
  }, [radioQueue])

  const loadRadioQueue = async (isRegenerate = false) => {
    try {
      if (isRegenerate) {
        setRegenerating(true)
      } else {
        setLoading(true)
      }
      const songTitle = baseSong.title || baseSong.titulo
      console.log('📻 Cargando radio para:', songTitle)
      const similar = await getSimilarSongs(songTitle, 30)
      console.log('🎵 Canciones similares recibidas:', similar.length)
      console.log('🔍 Primera canción:', similar[0])
      setRadioQueue(similar)
      setCurrentIndex(0)
    } catch (err) {
      console.error('Error cargando radio:', err)
      alert('❌ Error al cargar la radio. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
      setRegenerating(false)
    }
  }

  const adaptSong = (song) => ({
    title: song.titulo,
    artist: song.artista?.nombre || 'Desconocido',
    album: song.album?.nombre || '',
    cover: song.URLPortadaCancion || song.album?.URLPortadaAlbum || '',
    duration: song.duracion || 0,
    genre: song.genero || '',
    year: song.anio || ''
  })

  if (!isOpen) return null

  return createPortal(
    <>
      <div className="RadioModal__overlay" onClick={(e) => {
        e.stopPropagation()
        onClose()
      }} />
      <div className={`RadioModal ${isCollapsed ? 'RadioModal--collapsed' : ''}`}>
        {/* Header */}
        <div className="RadioModal__header">
          <div className="RadioModal__header-content">
            <div className="RadioModal__icon">
              <i className="fas fa-broadcast-tower"></i>
            </div>
            <div>
              <h2 className="RadioModal__title">Radio</h2>
              <p className="RadioModal__subtitle">
                Basado en: <strong>{baseSong?.title || baseSong?.titulo}</strong>
              </p>
            </div>
          </div>
          <div className="RadioModal__header-actions">
            <button 
              className="RadioModal__collapse-btn" 
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsCollapsed(!isCollapsed)
              }}
              title={isCollapsed ? 'Expandir radio' : 'Contraer radio'}
            >
              <i className={`fas ${isCollapsed ? 'fa-expand' : 'fa-compress'}`}></i>
            </button>
            <button className="RadioModal__close" onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Queue Info */}
        <div className="RadioModal__info">
          <div className="RadioModal__info-item">
            <i className="fas fa-music"></i>
            <span>{radioQueue.length} canciones en cola</span>
          </div>
          <div className="RadioModal__info-item">
            <i className="fas fa-random"></i>
            <span>Modo aleatorio activado</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="RadioModal__loading">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Buscando canciones similares...</p>
          </div>
        )}

        {/* Queue List */}
        {!loading && radioQueue.length === 0 && (
          <div className="RadioModal__empty">
            <i className="fas fa-inbox"></i>
            <h3>No se encontraron canciones similares</h3>
            <p>Intenta con otra canción</p>
          </div>
        )}

        {!loading && radioQueue.length > 0 && (
          <div className="RadioModal__queue">
            <div className="RadioModal__queue-header">
              <h3>Cola de Reproducción</h3>
              <button 
                className="RadioModal__shuffle-btn"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('🔄 Regenerando radio...')
                  loadRadioQueue(true)
                }}
                disabled={regenerating}
                title="Regenerar cola"
              >
                <i className={`fas ${regenerating ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
                {regenerating ? 'Regenerando...' : 'Regenerar'}
              </button>
            </div>
            
            <div className="RadioModal__queue-list">
              {radioQueue.map((song, index) => {
                const isCurrentSong = currentPlayingSong && (
                  song.id === currentPlayingSong.id ||
                  song.titulo === currentPlayingSong.title ||
                  song.titulo === currentPlayingSong.titulo
                )
                
                return (
                <div 
                  key={`${song.id || index}-${song.titulo}`}
                  className={`RadioModal__queue-item ${isCurrentSong ? 'RadioModal__queue-item--current' : ''}`}
                >
                  <div className="RadioModal__queue-number">
                    {isCurrentSong ? (
                      <i className="fas fa-play" style={{ color: 'var(--accent)' }}></i>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="RadioModal__queue-song">
                    <img 
                      src={song.URLPortadaCancion || song.album?.URLPortadaAlbum || song.artista?.urlfotoArtista}
                      alt={song.titulo}
                      className="RadioModal__queue-cover"
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Cdefs%3E%3ClinearGradient id='grad-${index}' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2345B6B3;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%231C2B3A;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad-${index})' width='48' height='48'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='20' font-weight='bold' fill='white' opacity='0.9'%3E♪%3C/text%3E%3C/svg%3E`
                      }}
                    />
                    <div className="RadioModal__queue-info">
                      <h4>{song.titulo}</h4>
                      <p>{song.artista?.nombre || 'Desconocido'}</p>
                    </div>
                  </div>

                  <div className="RadioModal__queue-meta">
                    <span className="RadioModal__queue-genre">{song.genero}</span>
                    <span className="RadioModal__queue-year">{song.anio}</span>
                  </div>
                </div>
              )
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="RadioModal__actions">
          <button 
            className="RadioModal__btn RadioModal__btn--secondary"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
          >
            Cerrar
          </button>
          <button 
            className="RadioModal__btn RadioModal__btn--primary"
            onClick={(e) => {
              e.stopPropagation()
              console.log('🎵 Iniciar radio con cola:', radioQueue.length, 'canciones')
              console.log('🔍 Canción base:', baseSong?.title || baseSong?.titulo)
              console.log('🎧 Adaptando canciones para el player...')
              
              // Adaptar canciones para el player
              const adaptedQueue = radioQueue.map((song, idx) => ({
                id: song.id || idx,
                title: song.titulo || 'Sin título',
                artist: song.artista?.nombre || 'Artista desconocido',
                album: song.album?.nombre || song.album?.titulo || '',
                cover: song.URLPortadaCancion || song.album?.URLPortadaAlbum || song.artista?.urlfotoArtista,
                url: song.URLCancion || song.url || song.urlCancion,
                duration: song.duracion || 0,
                genre: song.genero || '',
                year: song.anio || '',
                titulo: song.titulo,
                ...song
              }))
              
              console.log('✅ Cola adaptada:', adaptedQueue.length, 'canciones')
              console.log('🎯 Primera canción adaptada:', adaptedQueue[0])
              
              // Disparar evento para el player
              window.dispatchEvent(new CustomEvent('radio-started', { 
                detail: { 
                  baseSong, 
                  queue: adaptedQueue 
                }
              }))
              
              // Usar PlayerContext si está disponible
              if (window.PlayerContext?.startRadioMode) {
                const adaptedBaseSong = {
                  id: baseSong.id,
                  title: baseSong.title || baseSong.titulo,
                  artist: baseSong.artist || baseSong.artista?.nombre,
                  ...baseSong
                }
                window.PlayerContext.startRadioMode(adaptedBaseSong, adaptedQueue)
              }
              onClose()
            }}
            disabled={radioQueue.length === 0 || loading || regenerating}
          >
            <i className="fas fa-play"></i>
            Reproducir Radio
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
