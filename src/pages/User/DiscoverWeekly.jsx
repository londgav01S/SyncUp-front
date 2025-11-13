import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { PlayerContext } from '../../context/PlayerContext'
import { getFavorites } from '../../api/favoriteService'
import { getSongs } from '../../api/songService'
import SongCard from '../../components/SongCard/SongCard'
import { FaHeadphones, FaPlay, FaSync, FaMusic, FaHeart, FaCheckCircle, FaExclamationTriangle, FaBrain, FaStar, FaFire, FaCompactDisc } from 'react-icons/fa'
import { MdMusicNote } from 'react-icons/md'
import './DiscoverWeekly.css'

// Featured Song Card - Tarjeta destacada horizontal grande
function FeaturedSongCard({ song, onPlay }) {
  return (
    <div className="Discover__featuredSong">
      <div className="Discover__featuredBg" style={{ backgroundImage: `url(${song.cover})` }} />
      <div className="Discover__featuredOverlay" />
      <div className="Discover__featuredContent">
        <span className="Discover__featuredBadge">
          <FaStar /> Top Match
        </span>
        <h3 className="Discover__featuredTitle">{song.title}</h3>
        <p className="Discover__featuredArtist">{song.artist}</p>
        <p className="Discover__featuredGenre">{song.genre}</p>
        <button 
          className="Discover__featuredPlayBtn"
          onClick={(e) => {
            e.preventDefault()
            onPlay(song)
          }}
        >
          <FaPlay /> Reproducir
        </button>
      </div>
    </div>
  )
}

// Compact Song Row - Fila compacta para lista
function CompactSongRow({ song, index, onPlay }) {
  return (
    <div className="Discover__compactRow">
      <span className="Discover__compactIndex">{index}</span>
      <img src={song.cover} alt={song.title} className="Discover__compactCover" />
      <div className="Discover__compactInfo">
        <h4 className="Discover__compactTitle">{song.title}</h4>
        <p className="Discover__compactArtist">{song.artist}</p>
      </div>
      <span className="Discover__compactGenre">{song.genre}</span>
      <button 
        className="Discover__compactPlay"
        onClick={(e) => {
          e.preventDefault()
          onPlay(song)
        }}
      >
        <FaPlay />
      </button>
    </div>
  )
}

export default function DiscoverWeekly() {
  const { user } = useContext(AuthContext)
  const { playSong } = useContext(PlayerContext)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({ total: 0, genres: [], artists: [] })

  useEffect(() => {
    if (user?.correo) {
      generateRecommendations()
    }
  }, [user])

  const generateRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)

      const userEmail = user?.correo || localStorage.getItem('userEmail')
      
      // Obtener favoritos del usuario
      const favorites = await getFavorites(userEmail)
      console.log('📊 Favoritos del usuario:', favorites)

      if (favorites.length === 0) {
        setRecommendations([])
        setLoading(false)
        return
      }

      // Obtener todas las canciones disponibles
      const allSongsResponse = await getSongs()
      const allSongs = Array.isArray(allSongsResponse.data) ? allSongsResponse.data : []
      console.log('🎵 Total de canciones disponibles:', allSongs.length)

      // Algoritmo de recomendación
      const recommended = recommendSongs(favorites, allSongs)
      
      // Adaptar formato para SongCard
      const adaptedRecommendations = recommended.map(song => ({
        id: song.id,
        title: song.titulo,
        artist: song.artista?.nombre || 'Artista desconocido',
        cover: (
          song.URLPortadaCancion ||
          song.urlPortadaCancion ||
          song.album?.urlPortadaAlbum ||
          song.album?.URLPortadaAlbum ||
          song.artista?.urlfotoArtista ||
          ''
        ).toString().trim() || '/placeholder-song.svg',
        url: song.URLCancion || song.url || song.urlCancion,
        genre: song.genero || 'Music',
        year: song.anio,
        album: song.album?.titulo,
        ...song
      }))

      setRecommendations(adaptedRecommendations)

      // Calcular estadísticas
      const genres = [...new Set(favorites.map(s => s.genero).filter(Boolean))]
      const artists = [...new Set(favorites.map(s => s.artista?.nombre).filter(Boolean))]
      setStats({
        total: adaptedRecommendations.length,
        genres,
        artists
      })

      console.log('✅ Recomendaciones generadas:', adaptedRecommendations.length)
    } catch (err) {
      console.error('Error generando recomendaciones:', err)
      setError('No se pudieron generar las recomendaciones')
    } finally {
      setLoading(false)
    }
  }

  // Algoritmo de recomendación basado en favoritos
  const recommendSongs = (favorites, allSongs) => {
    const favoriteSongIds = new Set(favorites.map(f => f.id))
    const favoriteGenres = favorites.map(f => f.genero).filter(Boolean)
    const favoriteArtists = favorites.map(f => f.artista?.nombre).filter(Boolean)
    const favoriteYears = favorites.map(f => f.anio).filter(Boolean)

    // Calcular score para cada canción
    const scoredSongs = allSongs
      .filter(song => !favoriteSongIds.has(song.id)) // Excluir favoritos
      .map(song => {
        let score = 0

        // +3 puntos si es del mismo género que alguno de tus favoritos
        if (favoriteGenres.includes(song.genero)) {
          score += 3
        }

        // +5 puntos si es del mismo artista
        if (favoriteArtists.includes(song.artista?.nombre)) {
          score += 5
        }

        // +2 puntos si es del mismo álbum que algún favorito
        const favoriteAlbums = favorites.map(f => f.album?.titulo).filter(Boolean)
        if (favoriteAlbums.includes(song.album?.titulo)) {
          score += 2
        }

        // +1 punto si es de una década similar
        const songDecade = Math.floor(song.anio / 10) * 10
        const hasSimilarDecade = favoriteYears.some(year => Math.floor(year / 10) * 10 === songDecade)
        if (hasSimilarDecade) {
          score += 1
        }

        // Bonus aleatorio para variedad (0-0.5 puntos)
        score += Math.random() * 0.5

        return { ...song, score }
      })
      .filter(song => song.score > 0) // Solo canciones con al menos 1 criterio
      .sort((a, b) => b.score - a.score) // Ordenar por score descendente
      .slice(0, 30) // Top 30 recomendaciones

    console.log('🎯 Canciones recomendadas (top 5):', scoredSongs.slice(0, 5).map(s => ({
      titulo: s.titulo,
      score: s.score
    })))

    return scoredSongs
  }

  const handlePlayAll = () => {
    if (recommendations.length > 0) {
      playSong(recommendations[0])
      // TODO: Agregar resto de canciones a la cola
    }
  }

  if (loading) {
    return (
      <div className="DiscoverWeeklyPage">
        <div className="DiscoverWeekly__loading">
          <div className="DiscoverWeekly__spinner"></div>
          <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>
            Generando tus recomendaciones personalizadas...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="DiscoverWeeklyPage">
        <div className="DiscoverWeekly__empty">
          <div className="DiscoverWeekly__emptyIcon">
            <FaExclamationTriangle size={64} color="var(--accent)" />
          </div>
          <h2 className="DiscoverWeekly__emptyTitle">Error</h2>
          <p className="DiscoverWeekly__emptyText">{error}</p>
          <button onClick={generateRecommendations} className="DiscoverWeekly__emptyLink">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="DiscoverWeeklyPage">
        <div className="DiscoverWeekly__empty">
          <div className="DiscoverWeekly__emptyIcon">
            <MdMusicNote size={64} color="var(--text-muted)" />
          </div>
          <h2 className="DiscoverWeekly__emptyTitle">Aún no hay recomendaciones</h2>
          <p className="DiscoverWeekly__emptyText">
            Agrega algunas canciones a tus favoritos y volveremos con recomendaciones personalizadas para ti
          </p>
          <Link to="/favorites" className="DiscoverWeekly__emptyLink">
            Ir a Favoritos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="DiscoverWeeklyPage">
      {/* Header compacto */}
      <div className="Discover__header">
        <div className="Discover__headerIcon">
          <FaBrain />
        </div>
        <div>
          <h1 className="Discover__headerTitle">Descubrimiento Semanal</h1>
          <p className="Discover__headerSubtitle">
            {stats.total} canciones seleccionadas para ti
          </p>
        </div>
        <div className="Discover__headerActions">
          <button 
            className="Discover__btn Discover__btn--play"
            onClick={handlePlayAll}
          >
            <FaPlay /> Reproducir todo
          </button>
          <button 
            className="Discover__btn Discover__btn--refresh"
            onClick={generateRecommendations}
          >
            <FaSync />
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="Discover__bentoGrid">
        {/* Canción destacada (top recommendation) */}
        <div className="Discover__bentoItem Discover__bentoItem--featured">
          <FeaturedSongCard song={recommendations[0]} onPlay={playSong} />
        </div>

        {/* Stats Card */}
        <div className="Discover__bentoItem Discover__bentoItem--stats">
          <div className="Discover__statsCard">
            <h3 className="Discover__statsTitle">Tus gustos</h3>
            <div className="Discover__statsGrid">
              <div className="Discover__statBox">
                <div className="Discover__statIcon"><FaMusic /></div>
                <div className="Discover__statValue">{stats.total}</div>
                <div className="Discover__statLabel">Nuevas</div>
              </div>
              <div className="Discover__statBox">
                <div className="Discover__statIcon"><FaCompactDisc /></div>
                <div className="Discover__statValue">{stats.genres.length}</div>
                <div className="Discover__statLabel">Géneros</div>
              </div>
              <div className="Discover__statBox">
                <div className="Discover__statIcon"><FaHeadphones /></div>
                <div className="Discover__statValue">{stats.artists.length}</div>
                <div className="Discover__statLabel">Artistas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 10 Recommendations List */}
        <div className="Discover__bentoItem Discover__bentoItem--topList">
          <div className="Discover__topList">
            <h3 className="Discover__topListTitle">
              <FaFire /> Top 10 para ti
            </h3>
            <div className="Discover__topListRows">
              {recommendations.slice(0, 10).map((song, idx) => (
                <CompactSongRow 
                  key={song.id}
                  song={song}
                  index={idx + 1}
                  onPlay={playSong}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Cómo funciona el algoritmo */}
        <div className="Discover__bentoItem Discover__bentoItem--algorithm">
          <div className="Discover__algorithmCard">
            <h3 className="Discover__algorithmTitle">
              <FaBrain /> ¿Cómo funciona?
            </h3>
            <ul className="Discover__algorithmList">
              <li>
                <FaCheckCircle />
                <span>Analizamos tus favoritos</span>
              </li>
              <li>
                <FaCheckCircle />
                <span>Buscamos similares por género</span>
              </li>
              <li>
                <FaCheckCircle />
                <span>Priorizamos tus artistas</span>
              </li>
              <li>
                <FaCheckCircle />
                <span>Añadimos variedad</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Grid completo de recomendaciones */}
      <div className="Discover__section">
        <div className="Discover__sectionHeader">
          <h2 className="Discover__sectionTitle">
            <FaStar /> Todas tus recomendaciones
          </h2>
          <span className="Discover__sectionCount">{recommendations.length} canciones</span>
        </div>

        <div className="Discover__grid">
          {recommendations.map(song => (
            <div key={song.id} className="Discover__gridItem">
              <Link 
                to={`/songs/${song.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <SongCard song={song} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
