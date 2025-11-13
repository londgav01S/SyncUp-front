import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getSimilarSongs } from '../../api/radioService'
import SongCard from '../SongCard/SongCard'
import './RadioModal.css'

export default function RadioModal({ isOpen, onClose, baseSong }) {
  const [radioQueue, setRadioQueue] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (isOpen && baseSong) {
      loadRadioQueue()
    }
  }, [isOpen, baseSong])

  const loadRadioQueue = async () => {
    try {
      setLoading(true)
      const songTitle = baseSong.title || baseSong.titulo
      console.log('📻 Cargando radio para:', songTitle)
      const similar = await getSimilarSongs(songTitle, 30)
      console.log('🎵 Canciones similares recibidas:', similar.length)
      console.log('🔍 Primera canción:', similar[0])
      setRadioQueue(similar)
      setCurrentIndex(0)
    } catch (err) {
      console.error('Error cargando radio:', err)
    } finally {
      setLoading(false)
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
      <div className="RadioModal">
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
          <button className="RadioModal__close" onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}>
            <i className="fas fa-times"></i>
          </button>
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
                onClick={loadRadioQueue}
                title="Regenerar cola"
              >
                <i className="fas fa-sync-alt"></i>
                Regenerar
              </button>
            </div>
            
            <div className="RadioModal__queue-list">
              {radioQueue.map((song, index) => (
                <div 
                  key={index} 
                  className={`RadioModal__queue-item ${index === currentIndex ? 'RadioModal__queue-item--current' : ''}`}
                >
                  <div className="RadioModal__queue-number">
                    {index === currentIndex ? (
                      <i className="fas fa-play"></i>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="RadioModal__queue-song">
                    <img 
                      src={song.URLPortadaCancion || song.album?.URLPortadaAlbum || song.artista?.urlfotoArtista || 'https://via.placeholder.com/48'} 
                      alt={song.titulo}
                      className="RadioModal__queue-cover"
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
              ))}
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
              console.log('🔍 URLs de las primeras 5 canciones:')
              radioQueue.slice(0, 5).forEach((song, i) => {
                console.log(`  ${i + 1}. ${song.titulo}:`)
                console.log(`     - URLCancion: ${song.URLCancion}`)
                console.log(`     - url: ${song.url}`)
                console.log(`     - Objeto completo:`, song)
              })
              
              window.dispatchEvent(new CustomEvent('radio-started', { 
                detail: { 
                  baseSong, 
                  queue: radioQueue 
                }
              }))
              
              if (window.PlayerContext?.startRadioMode) {
                window.PlayerContext.startRadioMode(baseSong, radioQueue)
              }
              onClose()
            }}
            disabled={radioQueue.length === 0}
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
