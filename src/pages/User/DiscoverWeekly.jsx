import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { PlayerContext } from '../../context/PlayerContext'
import { getFavorites } from '../../api/favoriteService'
import { getSongs } from '../../api/songService'
import SongCard from '../../components/SongCard/SongCard'
import { FaHeadphones, FaPlay, FaSync, FaMusic, FaHeart, FaCheckCircle, FaExclamationTriangle, FaBrain } from 'react-icons/fa'
import { MdMusicNote } from 'react-icons/md'
import './DiscoverWeekly.css'

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
      {/* Hero Section */}
      <div className="DiscoverWeekly__hero">
        <div className="DiscoverWeekly__heroContent">
          <div className="DiscoverWeekly__icon">
            <FaHeadphones size={48} />
          </div>
          <h1 className="DiscoverWeekly__title" style={{ color: '#FAF8F4' }}>Descubrimiento Semanal</h1>
          <p className="DiscoverWeekly__subtitle" style={{ color: '#FAF8F4' }}>
            Playlist personalizada basada en tus gustos musicales
          </p>

          <div className="DiscoverWeekly__stats">
            <div className="DiscoverWeekly__stat">
              <span className="DiscoverWeekly__statValue" style={{ color: '#FAF8F4' }}>{stats.total}</span>
              <span className="DiscoverWeekly__statLabel" style={{ color: '#FAF8F4' }}>Canciones nuevas</span>
            </div>
            <div className="DiscoverWeekly__stat">
              <span className="DiscoverWeekly__statValue" style={{ color: '#FAF8F4' }}>{stats.genres.length}</span>
              <span className="DiscoverWeekly__statLabel" style={{ color: '#FAF8F4' }}>Géneros</span>
            </div>
            <div className="DiscoverWeekly__stat">
              <span className="DiscoverWeekly__statValue" style={{ color: '#FAF8F4' }}>{stats.artists.length}</span>
              <span className="DiscoverWeekly__statLabel" style={{ color: '#FAF8F4' }}>Artistas favoritos</span>
            </div>
          </div>

          <div className="DiscoverWeekly__actions">
            <button 
              className="DiscoverWeekly__btn DiscoverWeekly__btn--primary"
              onClick={handlePlayAll}
            >
              <FaPlay style={{ fontSize: 14 }} /> Reproducir todo
            </button>
            <button 
              className="DiscoverWeekly__btn DiscoverWeekly__btn--secondary"
              onClick={generateRecommendations}
            >
              <FaSync style={{ fontSize: 14 }} /> Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Algoritmo Info */}
      <div className="DiscoverWeekly__algorithm">
        <h3 className="DiscoverWeekly__algorithmTitle">
          <FaBrain style={{ marginRight: 8, color: 'var(--accent)' }} /> ¿Cómo generamos tus recomendaciones?
        </h3>
        <ul className="DiscoverWeekly__algorithmList">
          <li className="DiscoverWeekly__algorithmItem">
            <FaCheckCircle className="DiscoverWeekly__algorithmIcon" />
            Analizamos tus canciones favoritas
          </li>
          <li className="DiscoverWeekly__algorithmItem">
            <FaCheckCircle className="DiscoverWeekly__algorithmIcon" />
            Buscamos canciones del mismo género y artistas similares
          </li>
          <li className="DiscoverWeekly__algorithmItem">
            <FaCheckCircle className="DiscoverWeekly__algorithmIcon" />
            Priorizamos álbumes y épocas que te gustan
          </li>
          <li className="DiscoverWeekly__algorithmItem">
            <FaCheckCircle className="DiscoverWeekly__algorithmIcon" />
            Añadimos variedad para que descubras música nueva
          </li>
        </ul>
      </div>

      {/* Recommendations Grid */}
      <div className="DiscoverWeekly__section">
        <div className="DiscoverWeekly__sectionHeader">
          <div>
            <h2 className="DiscoverWeekly__sectionTitle">Tus Recomendaciones</h2>
            <p className="DiscoverWeekly__sectionSubtitle">
              Seleccionadas especialmente para ti
            </p>
          </div>
        </div>

        <div className="DiscoverWeekly__grid">
          {recommendations.map(song => (
            <Link 
              key={song.id}
              to={`/songs/${song.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <SongCard song={song} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
