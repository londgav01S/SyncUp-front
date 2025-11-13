import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import songs from '../../data/songs.json'
import SongCard from '../../components/SongCard/SongCard'
import HeroCarousel from '../../components/HeroCarousel/HeroCarousel'
import { getSongs } from '../../api/songService'
import { getFavorites } from '../../api/favoriteService'
import { getUserPlaylists } from '../../api/playlistService'
import { useAuth } from '../../context/AuthContext'
import { FaMusic, FaHeadphones, FaHeart, FaBook, FaClock, FaFire, FaStar, FaPlay } from 'react-icons/fa'
import './HomeUser.css'

// Featured Card Component (Tarjeta destacada grande)
function FeaturedCard({ song }) {
  return (
    <Link to={`/songs/${song.id}`} className="HomeUser__featuredCard">
      <div className="HomeUser__featuredBg" style={{ backgroundImage: `url(${song.cover})` }} />
      <div className="HomeUser__featuredOverlay" />
      <div className="HomeUser__featuredContent">
        <span className="HomeUser__featuredBadge">
          <FaFire /> Destacado
        </span>
        <h3 className="HomeUser__featuredTitle">{song.title}</h3>
        <p className="HomeUser__featuredArtist">{song.artist}</p>
        <button className="HomeUser__featuredPlayBtn">
          <FaPlay /> Reproducir ahora
        </button>
      </div>
    </Link>
  )
}

// Compact Card Component (Tarjeta compacta horizontal)
function CompactCard({ song }) {
  return (
    <Link to={`/songs/${song.id}`} className="HomeUser__compactCard">
      <img src={song.cover} alt={song.title} className="HomeUser__compactCover" />
      <div className="HomeUser__compactInfo">
        <h4 className="HomeUser__compactTitle">{song.title}</h4>
        <p className="HomeUser__compactArtist">{song.artist}</p>
      </div>
      <button className="HomeUser__compactPlay">
        <FaPlay />
      </button>
    </Link>
  )
}

// Mini Card Component (Tarjeta mini cuadrada)
function MiniCard({ song }) {
  return (
    <Link to={`/songs/${song.id}`} className="HomeUser__miniCard">
      <div className="HomeUser__miniCover" style={{ backgroundImage: `url(${song.cover})` }} />
      <div className="HomeUser__miniInfo">
        <h5>{song.title}</h5>
        <p>{song.artist}</p>
      </div>
    </Link>
  )
}

export default function HomeUser(){
  const { user } = useAuth()
  const [remoteSongs, setRemoteSongs] = useState([])
  const [loadingRemote, setLoadingRemote] = useState(false)
  const [errorRemote, setErrorRemote] = useState(null)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [playlistsCount, setPlaylistsCount] = useState(0)

  // Adapt backend song shape to SongCard expected props
  const adaptSong = (s) => ({
    id: s.id || `${s.titulo}-${s.artista?.nombre || 'NA'}`,
    title: s.titulo,
    artist: s.artista?.nombre,
    cover: (
      s.URLPortadaCancion || 
      s.urlPortadaCancion || 
      s.album?.urlPortadaAlbum ||
      s.album?.URLPortadaAlbum ||
      s.artista?.urlfotoArtista ||
      ''
    ).toString().trim() || '/placeholder-song.svg',
    url: s.URLCancion || s.url || s.urlCancion,
    genre: s.genero || 'Music',
    ...s
  })

  useEffect(() => {
    const fetchRemote = async () => {
      setLoadingRemote(true)
      setErrorRemote(null)
      try {
        const res = await getSongs()
        const data = Array.isArray(res.data) ? res.data : []
        const adapted = data.map(adaptSong)
        setRemoteSongs(adapted)
      } catch (err) {
        console.error('❌ Error al cargar canciones:', err)
        setErrorRemote(err?.response?.data?.message || 'No se pudieron cargar canciones')
      } finally {
        setLoadingRemote(false)
      }
    }
    fetchRemote()
    const handler = () => fetchRemote()
    window.addEventListener('songs-updated', handler)
    return () => window.removeEventListener('songs-updated', handler)
  }, [])

  // Cargar favoritos y playlists si hay usuario
  useEffect(() => {
    if (!user?.correo) return

    const fetchUserData = async () => {
      try {
        const [favorites, playlists] = await Promise.all([
          getFavorites(user.correo),
          getUserPlaylists(user.correo)
        ])
        setFavoritesCount(favorites?.length || 0)
        setPlaylistsCount(playlists?.length || 0)
      } catch (err) {
        console.error('Error al cargar datos del usuario:', err)
      }
    }
    fetchUserData()
  }, [user])

  const useDatabaseSongs = remoteSongs.length > 10
  const displaySongs = useDatabaseSongs ? remoteSongs : songs

  return (
    <div className="HomeUserPage">
      {/* Welcome Section con fecha */}
      <div className="HomeUser__welcome">
        <div>
          <h1 className="HomeUser__welcomeTitle">Descubre tu música</h1>
          <p className="HomeUser__welcomeSubtitle">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        {user && (
          <div className="HomeUser__welcomeStats">
            <div className="HomeUser__miniStat">
              <FaHeadphones />
              <span>{displaySongs.length} canciones</span>
            </div>
            <div className="HomeUser__miniStat">
              <FaHeart />
              <span>{favoritesCount} favoritas</span>
            </div>
          </div>
        )}
      </div>

      {/* Bento Grid Layout - Layout asimétrico moderno */}
      <div className="HomeUser__bentoGrid">
        {/* Tarjeta destacada grande (ocupa 2 columnas) */}
        <div className="HomeUser__bentoItem HomeUser__bentoItem--large">
          {displaySongs[0] && <FeaturedCard song={displaySongs[0]} />}
        </div>

        {/* Stats en formato vertical - Solo mostrar si hay usuario */}
        {user ? (
          <div className="HomeUser__bentoItem HomeUser__bentoItem--tall">
            <div className="HomeUser__statsVertical">
              <h3 className="HomeUser__statsTitle">Tu actividad</h3>
              <div className="HomeUser__statMini">
                <FaHeadphones />
                <div>
                  <div className="HomeUser__statMiniValue">{displaySongs.length}</div>
                  <div className="HomeUser__statMiniLabel">Canciones</div>
                </div>
              </div>
              <div className="HomeUser__statMini">
                <FaHeart />
                <div>
                  <div className="HomeUser__statMiniValue">{favoritesCount}</div>
                  <div className="HomeUser__statMiniLabel">Favoritas</div>
                </div>
              </div>
              <div className="HomeUser__statMini">
                <FaBook />
                <div>
                  <div className="HomeUser__statMiniValue">{playlistsCount}</div>
                  <div className="HomeUser__statMiniLabel">Playlists</div>
                </div>
              </div>
              <div className="HomeUser__statMini">
                <FaClock />
                <div>
                  <div className="HomeUser__statMiniValue">-</div>
                  <div className="HomeUser__statMiniLabel">Tiempo total</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="HomeUser__bentoItem HomeUser__bentoItem--tall">
            <div className="HomeUser__statsVertical">
              <h3 className="HomeUser__statsTitle">Inicia sesión</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                Inicia sesión para ver tus estadísticas, favoritos y playlists personalizadas.
              </p>
              <Link to="/login" className="HomeUser__loginButton">
                Iniciar sesión
              </Link>
            </div>
          </div>
        )}

        {/* Grid de mini cards */}
        <div className="HomeUser__bentoItem HomeUser__bentoItem--mini">
          <div className="HomeUser__miniGrid">
            <h3 className="HomeUser__bentoTitle HomeUser__bentoTitle--inside">Escuchado recientemente</h3>
            {displaySongs.slice(1, 5).map(song => (
              <MiniCard key={song.id} song={song} />
            ))}
          </div>
        </div>

        {/* Compact cards apiladas */}
        <div className="HomeUser__bentoItem HomeUser__bentoItem--stack">
          <div className="HomeUser__compactStack">
            <h3 className="HomeUser__bentoTitle HomeUser__bentoTitle--inside">Tendencias</h3>
            {displaySongs.slice(5, 8).map(song => (
              <CompactCard key={song.id} song={song} />
            ))}
          </div>
        </div>

        {/* Genre tags modernos */}
        <div className="HomeUser__bentoItem HomeUser__bentoItem--wide">
          <div className="HomeUser__genreChips">
            <h3 className="HomeUser__bentoTitle HomeUser__bentoTitle--inside">Explorar géneros</h3>
            {['Indie', 'Pop', 'Electronic', 'Rock', 'Acoustic', 'Jazz'].map((genre) => (
              <button key={genre} className="HomeUser__genreChip">
                <FaMusic />
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sección con scroll horizontal - Nuevos lanzamientos */}
      <section className="HomeUser__section">
        <div className="HomeUser__sectionHeader">
          <h2 className="HomeUser__sectionTitle">
            <FaStar /> Nuevos lanzamientos
          </h2>
          <Link to="/songs" className="HomeUser__sectionLink">Ver todos →</Link>
        </div>
        <div className="HomeUser__horizontalScroll">
          {displaySongs.slice(0, 12).map(song => (
            <div key={song.id} className="HomeUser__scrollCard">
              <Link to={`/songs/${song.id}`} style={{textDecoration:'none',color:'inherit'}}>
                <SongCard song={song} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Sección con scroll horizontal - Recomendados */}
      <section className="HomeUser__section">
        <div className="HomeUser__sectionHeader">
          <h2 className="HomeUser__sectionTitle">
            <FaFire /> Recomendado para ti
          </h2>
          <Link to="/songs" className="HomeUser__sectionLink">Ver todos →</Link>
        </div>
        <div className="HomeUser__horizontalScroll">
          {displaySongs.slice(10, 22).map(song => (
            <div key={song.id} className="HomeUser__scrollCard">
              <Link to={`/songs/${song.id}`} style={{textDecoration:'none',color:'inherit'}}>
                <SongCard song={song} />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
