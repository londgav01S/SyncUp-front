import React, { createContext, useRef, useState, useMemo } from 'react'

export const PlayerContext = createContext()

export function PlayerProvider({ children }){
  const [current, setCurrent] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [playedSeconds, setPlayedSeconds] = useState(0)
  const [played, setPlayed] = useState(0) // 0..1
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  
  // Radio mode
  const [isRadioMode, setIsRadioMode] = useState(false)
  const [radioQueue, setRadioQueue] = useState([])
  const [radioBaseSong, setRadioBaseSong] = useState(null)
  
  // Playback controls
  const [shuffle, setShuffle] = useState(false)
  const [loop, setLoop] = useState('off') // 'off', 'one', 'all'
  const [queue, setQueue] = useState([]) // Cola de reproducción normal
  const [history, setHistory] = useState([]) // Historial de reproducción

  // Controller will be set by Player component to expose seek methods
  const controllerRef = useRef({
    seekToSeconds: () => {},
    seekToFraction: () => {},
  })

  const play = (song, newQueue = null) => {
    console.log('🎮 PlayerContext.play() called:', {
      songId: song?.id,
      songTitle: song?.title,
      hasUrl: !!song?.url,
      url: song?.url,
      queueLength: newQueue?.length
    })
    
    // Si se proporciona una nueva cola, actualizarla
    if (newQueue && Array.isArray(newQueue)) {
      setQueue(newQueue)
      setHistory([]) // Limpiar historial al iniciar nueva cola
      console.log('📋 Cola actualizada:', newQueue.length, 'canciones')
    }
    
    setCurrent(song)
    setPlaying(true)
  }
  const pause = () => {
    console.log('⏸️ PlayerContext.pause() called')
    setPlaying(false)
  }

  const setProgress = ({ playedSeconds: ps, played: pf }) => {
    if (typeof ps === 'number') setPlayedSeconds(ps)
    if (typeof pf === 'number') setPlayed(pf)
  }

  const setController = (api) => {
    controllerRef.current = { ...controllerRef.current, ...api }
  }

  const startRadioMode = (baseSong, queue) => {
    console.log('📻 Iniciando modo radio con:', baseSong?.title || baseSong?.titulo)
    console.log('📻 Cola de radio:', queue.length, 'canciones')
    
    // Mezclar cola si shuffle está activado
    let finalQueue = [...queue]
    if (shuffle) {
      console.log('🔀 Mezclando cola de radio...')
      finalQueue = [...queue].sort(() => Math.random() - 0.5)
    }
    
    console.log('🔍 Primera canción de la cola:', finalQueue[0]?.titulo)
    
    setRadioBaseSong(baseSong)
    setRadioQueue(finalQueue)
    setIsRadioMode(true)
    setHistory([]) // Limpiar historial al iniciar radio
    
    if (finalQueue.length > 0) {
      play(finalQueue[0], finalQueue) // Pasar la cola completa al play
    }
  }

  const exitRadioMode = () => {
    console.log('🚪 Saliendo de modo radio')
    setIsRadioMode(false)
    setRadioQueue([])
    setRadioBaseSong(null)
  }

  const playNextRadioSong = () => {
    if (!isRadioMode || radioQueue.length === 0) return
    
    const currentIndex = radioQueue.findIndex(s => 
      s.id === current?.id || 
      s.titulo === current?.title || 
      s.titulo === current?.titulo
    )
    
    let nextIndex = currentIndex + 1
    
    // Si shuffle está activado en radio, elegir canción aleatoria
    if (shuffle && radioQueue.length > 1) {
      const availableIndices = radioQueue
        .map((_, i) => i)
        .filter(i => i !== currentIndex)
      nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
      console.log('🔀 Radio shuffle: saltando a índice', nextIndex)
    }
    
    if (nextIndex < radioQueue.length && nextIndex >= 0) {
      console.log('⏭️ Siguiente en radio:', radioQueue[nextIndex]?.titulo)
      // Agregar a historial
      if (current) {
        setHistory(prev => [...prev, current])
      }
      play(radioQueue[nextIndex], radioQueue)
    } else {
      console.log('🔚 Fin de la cola de radio')
      exitRadioMode()
    }
  }

  const playNext = () => {
    // Si está en modo radio, usar lógica de radio
    if (isRadioMode) {
      playNextRadioSong()
      return
    }

    if (queue.length === 0) return

    const currentIndex = queue.findIndex(s => s.id === current?.id)
    let nextIndex

    if (shuffle) {
      // Aleatorio: elegir índice random
      const availableIndices = queue
        .map((_, i) => i)
        .filter(i => i !== currentIndex)
      if (availableIndices.length === 0) return
      nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
    } else {
      // Secuencial: siguiente en la cola
      nextIndex = currentIndex + 1
      if (nextIndex >= queue.length) {
        if (loop === 'all') {
          nextIndex = 0 // Volver al inicio
        } else {
          return // Fin de la cola
        }
      }
    }

    if (current) {
      setHistory(prev => [...prev, current])
    }
    play(queue[nextIndex])
  }

  const playPrevious = () => {
    // Si está en modo radio, ir al anterior en la cola de radio
    if (isRadioMode) {
      const currentIndex = radioQueue.findIndex(s => s.id === current?.id || s.titulo === current?.title)
      if (currentIndex > 0) {
        play(radioQueue[currentIndex - 1])
      }
      return
    }

    // Si hay historial, reproducir la última canción
    if (history.length > 0) {
      const previous = history[history.length - 1]
      setHistory(prev => prev.slice(0, -1))
      play(previous)
      return
    }

    // Si no hay historial, ir al anterior en la cola
    if (queue.length === 0) return
    const currentIndex = queue.findIndex(s => s.id === current?.id)
    if (currentIndex > 0) {
      play(queue[currentIndex - 1])
    }
  }

  const toggleShuffle = () => {
    setShuffle(prev => !prev)
    console.log('🔀 Shuffle:', !shuffle ? 'activado' : 'desactivado')
  }

  const toggleLoop = () => {
    const modes = ['off', 'one', 'all']
    const currentIndex = modes.indexOf(loop)
    const nextMode = modes[(currentIndex + 1) % modes.length]
    setLoop(nextMode)
    console.log('🔁 Loop:', nextMode)
  }

  const addToQueue = (song) => {
    setQueue(prev => [...prev, song])
    console.log('➕ Agregado a la cola:', song.title)
  }

  const setPlayQueue = (songs) => {
    setQueue(songs)
    console.log('📋 Cola de reproducción actualizada:', songs.length, 'canciones')
  }

  const value = useMemo(() => ({
    current, playing, play, pause,
    duration, setDuration,
    playedSeconds, played, setProgress,
    controller: controllerRef.current,
    setController,
    volume, setVolume,
    muted, setMuted,
    // Radio mode
    isRadioMode, radioQueue, radioBaseSong,
    startRadioMode, exitRadioMode, playNextRadioSong,
    // Playback controls
    playNext, playPrevious,
    shuffle, toggleShuffle,
    loop, toggleLoop,
    queue, addToQueue, setPlayQueue, history,
  }), [current, playing, duration, playedSeconds, played, volume, muted, isRadioMode, radioQueue, radioBaseSong, shuffle, loop, queue, history])

  // Exponer contexto globalmente para RadioModal
  React.useEffect(() => {
    window.PlayerContext = value
    return () => { window.PlayerContext = null }
  }, [value])

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  )
}
