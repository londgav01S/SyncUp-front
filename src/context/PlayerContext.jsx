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

  // Controller will be set by Player component to expose seek methods
  const controllerRef = useRef({
    seekToSeconds: () => {},
    seekToFraction: () => {},
  })

  const play = (song) => {
    console.log('🎮 PlayerContext.play() called:', {
      songId: song?.id,
      songTitle: song?.title,
      hasUrl: !!song?.url,
      url: song?.url
    })
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

  const value = useMemo(() => ({
    current, playing, play, pause,
    duration, setDuration,
    playedSeconds, played, setProgress,
    controller: controllerRef.current,
    setController,
    volume, setVolume,
    muted, setMuted,
  }), [current, playing, duration, playedSeconds, played, volume, muted])

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  )
}
