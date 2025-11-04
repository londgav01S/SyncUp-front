import React from 'react'
import './PlaylistCard.css'

export default function PlaylistCard({playlist}){
  return (
    <div className="PlaylistCard playlist-card">
      <img className="PlaylistCard__cover" src={playlist?.cover} alt={playlist?.name} />
      <div className="PlaylistCard__name">{playlist?.name || 'Playlist'}</div>
    </div>
  )
}
