import React, { useMemo, useRef, useEffect } from 'react'
import ReactPlayer from 'react-player'
import './Player.css'
import usePlayer from '../../hooks/usePlayer'
import { isYouTubeUrl } from '../../utils/helpers'

export default function Player(){
  const { current, playing, pause, play, setDuration, setProgress, controller, setController, playedSeconds, duration, played } = usePlayer()
  const url = current?.url
  const isYT = useMemo(()=> isYouTubeUrl(url), [url])
  const playerRef = useRef(null)

  useEffect(() => {
    // expose controller methods
    setController({
      seekToSeconds: (sec) => playerRef.current?.seekTo(sec, 'seconds'),
      seekToFraction: (f) => playerRef.current?.seekTo(f, 'fraction'),
    })
  }, [setController])

  const onProgress = (state) => {
    // state: {played, playedSeconds, loaded, loadedSeconds}
    setProgress({ playedSeconds: state.playedSeconds, played: state.played })
  }

  return (
    <div className="Player player">
      <div className="Player__controls">
        {current ? (
          <div className="Player__now">
            <span className="Player__meta">{current.title} — {current.artist}</span>
            <button className="Player__btn" onClick={()=> (playing ? pause() : play(current))}>
              {playing ? '⏸' : '▶'}
            </button>
          </div>
        ) : (
          <span className="Player__hint">Selecciona una canción</span>
        )}
        {current && (
          <div className="Player__progress">
            <span className="Player__time">{formatTime(playedSeconds)}</span>
            <input
              className="Player__seek"
              type="range"
              min={0}
              max={Math.max(1, duration)}
              step={1}
              value={Math.min(duration, playedSeconds)}
              style={{"--played": `${Math.min(100, Math.max(0, (played||0)*100))}%`}}
              onChange={(e)=> controller.seekToSeconds(Number(e.target.value))}
            />
            <span className="Player__time">{formatTime(duration)}</span>
          </div>
        )}
      </div>
      {/* Hidden player for audio/video playback */}
      {url && (
        <div style={{position:'absolute',left:-9999,top:-9999}} aria-hidden>
          <ReactPlayer
            ref={playerRef}
            url={url}
            playing={playing}
            controls={false}
            width={0}
            height={0}
            onDuration={(d)=> setDuration(d)}
            onProgress={onProgress}
            config={{ youtube: { playerVars: { modestbranding: 1 }}}}
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
