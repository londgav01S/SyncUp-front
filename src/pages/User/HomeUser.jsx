import React from 'react'
import { Link } from 'react-router-dom'
import songs from '../../data/songs.json'
import SongCard from '../../components/SongCard/SongCard'

export default function HomeUser(){
  return (
    <div className="HomeUserPage" style={{padding:20}}>
      <h2>Recomendadas</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16}}>
        {songs.slice(0,12).map(s => (
          <Link key={s.id} to={`/songs/${s.id}`} style={{textDecoration:'none',color:'inherit'}}>
            <SongCard song={s} />
          </Link>
        ))}
      </div>
    </div>
  )
}
