import React, { createContext, useRef, useState } from 'react'

export const PlayerContext = createContext()

export function PlayerProvider({ children }){
  const [current, setCurrent] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [playedSeconds, setPlayedSeconds] = useState(0)
  const [played, setPlayed] = useState(0) // 0..1

  // Controller will be set by Player component to expose seek methods
  const controllerRef = useRef({
    seekToSeconds: () => {},
    seekToFraction: () => {},
  })

  const play = (song) => { setCurrent(song); setPlaying(true) }
  const pause = () => setPlaying(false)

  const setProgress = ({ playedSeconds: ps, played: pf }) => {
    if (typeof ps === 'number') setPlayedSeconds(ps)
    if (typeof pf === 'number') setPlayed(pf)
  }

  const setController = (api) => {
    controllerRef.current = { ...controllerRef.current, ...api }
  }

  return (
    <PlayerContext.Provider value={{
      current, playing, play, pause,
      duration, setDuration,
      playedSeconds, played, setProgress,
      controller: controllerRef.current,
      setController,
    }}>
      {children}
    </PlayerContext.Provider>
  )
}
