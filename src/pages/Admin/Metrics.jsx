import React, { useState, useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'
import { getSongs } from '../../api/songService'
import { getArtists } from '../../api/artistService'
import { getAlbums } from '../../api/albumService'
import axios from '../../api/axiosConfig'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { FaMusic, FaMicrophone, FaCompactDisc, FaUsers, FaFilePdf, FaHourglassHalf } from 'react-icons/fa'
import './Metrics.css'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

export default function Metrics() {
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [metrics, setMetrics] = useState({
    totalSongs: 0,
    totalArtists: 0,
    totalAlbums: 0,
    totalUsers: 0,
    songsByGenre: {},
    songsByYear: {},
    topArtists: [],
    albumsByYear: {}
  })

  const metricsRef = useRef(null)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      setLoading(true)

      // Cargar datos en paralelo
      const [songsRes, artistsRes, albumsRes] = await Promise.all([
        getSongs(),
        getArtists(),
        getAlbums()
      ])

      const songs = Array.isArray(songsRes.data) ? songsRes.data : []
      const artists = Array.isArray(artistsRes.data) ? artistsRes.data : []
      const albums = Array.isArray(albumsRes.data) ? albumsRes.data : []

      // Intentar obtener total de usuarios
      let totalUsers = 0
      try {
        const usersRes = await axios.get('/usuarios/todos')
        totalUsers = Array.isArray(usersRes.data) ? usersRes.data.length : 0
      } catch (err) {
        console.warn('No se pudo obtener el total de usuarios')
      }

      // Calcular métricas de canciones por género
      const songsByGenre = {}
      songs.forEach(song => {
        const genre = song.genero || 'Sin género'
        songsByGenre[genre] = (songsByGenre[genre] || 0) + 1
      })

      // Calcular canciones por año
      const songsByYear = {}
      songs.forEach(song => {
        const year = song.anio || 'Desconocido'
        songsByYear[year] = (songsByYear[year] || 0) + 1
      })

      // Calcular álbumes por año
      const albumsByYear = {}
      albums.forEach(album => {
        const year = album.anio || 'Desconocido'
        albumsByYear[year] = (albumsByYear[year] || 0) + 1
      })

      // Top artistas con más canciones
      const artistSongCount = {}
      songs.forEach(song => {
        const artistName = song.artista?.nombre || 'Desconocido'
        artistSongCount[artistName] = (artistSongCount[artistName] || 0) + 1
      })

      const topArtists = Object.entries(artistSongCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }))

      setMetrics({
        totalSongs: songs.length,
        totalArtists: artists.length,
        totalAlbums: albums.length,
        totalUsers,
        songsByGenre,
        songsByYear,
        topArtists,
        albumsByYear
      })
    } catch (err) {
      console.error('Error cargando métricas:', err)
      alert('Error al cargar métricas')
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = async () => {
    if (!metricsRef.current) return

    try {
      setExporting(true)

      // Capturar el contenido del panel
      const canvas = await html2canvas(metricsRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pdfWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Si la imagen es más alta que la página, dividir en múltiples páginas
      let heightLeft = imgHeight
      let position = 10

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
      }

      const today = new Date().toISOString().split('T')[0]
      pdf.save(`metricas-${today}.pdf`)
    } catch (err) {
      console.error('Error exportando a PDF:', err)
      alert('Error al exportar a PDF')
    } finally {
      setExporting(false)
    }
  }

  // Configuración de gráficos
  const genreChartData = {
    labels: Object.keys(metrics.songsByGenre),
    datasets: [
      {
        label: 'Canciones por Género',
        data: Object.values(metrics.songsByGenre),
        backgroundColor: [
          '#F25C43',
          '#45B6B3',
          '#1C2B3A',
          '#FFB74D',
          '#9C27B0',
          '#4CAF50',
          '#FF5722',
          '#2196F3',
          '#FFC107',
          '#E91E63'
        ],
        borderWidth: 0
      }
    ]
  }

  const yearChartData = {
    labels: Object.keys(metrics.songsByYear).sort(),
    datasets: [
      {
        label: 'Canciones',
        data: Object.keys(metrics.songsByYear).sort().map(year => metrics.songsByYear[year]),
        backgroundColor: '#F25C43',
        borderColor: '#F25C43',
        borderWidth: 2
      },
      {
        label: 'Álbumes',
        data: Object.keys(metrics.songsByYear).sort().map(year => metrics.albumsByYear[year] || 0),
        backgroundColor: '#45B6B3',
        borderColor: '#45B6B3',
        borderWidth: 2
      }
    ]
  }

  const topArtistsData = {
    labels: metrics.topArtists.map(a => a.name),
    datasets: [
      {
        label: 'Número de Canciones',
        data: metrics.topArtists.map(a => a.count),
        backgroundColor: '#45B6B3',
        borderColor: '#1C2B3A',
        borderWidth: 1
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#1C2B3A',
          font: { size: 12, weight: 500 }
        }
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#444B54' },
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: {
        ticks: { color: '#444B54' },
        grid: { color: 'rgba(0,0,0,0.05)' }
      }
    }
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#1C2B3A',
          font: { size: 11 },
          padding: 10
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="MetricsPage">
        <div className="Metrics__loading">
          <div className="spinner"></div>
          <p>Cargando métricas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="MetricsPage">
      {/* Header */}
      <div className="Metrics__header">
        <div>
          <h1 className="Metrics__title">📊 Panel de Métricas</h1>
          <p className="Metrics__subtitle">Estadísticas y análisis del sistema</p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="Metrics__exportBtn"
          title="Exportar a PDF"
        >
          {exporting ? (
            <>
              <FaHourglassHalf style={{ marginRight: '8px' }} />
              Exportando...
            </>
          ) : (
            <>
              <FaFilePdf style={{ marginRight: '8px' }} />
              Exportar PDF
            </>
          )}
        </button>
      </div>

      {/* Contenido para exportar */}
      <div ref={metricsRef} className="Metrics__content">
        {/* Cards de resumen */}
        <div className="Metrics__cards">
          <div className="Metrics__card Metrics__card--primary">
            <div className="Metrics__cardIcon">
              <FaMusic style={{ fontSize: 32 }} />
            </div>
            <div className="Metrics__cardInfo">
              <div className="Metrics__cardValue">{metrics.totalSongs}</div>
              <div className="Metrics__cardLabel">Canciones</div>
            </div>
          </div>

          <div className="Metrics__card Metrics__card--secondary">
            <div className="Metrics__cardIcon">
              <FaMicrophone style={{ fontSize: 32 }} />
            </div>
            <div className="Metrics__cardInfo">
              <div className="Metrics__cardValue">{metrics.totalArtists}</div>
              <div className="Metrics__cardLabel">Artistas</div>
            </div>
          </div>

          <div className="Metrics__card Metrics__card--accent">
            <div className="Metrics__cardIcon">
              <FaCompactDisc style={{ fontSize: 32 }} />
            </div>
            <div className="Metrics__cardInfo">
              <div className="Metrics__cardValue">{metrics.totalAlbums}</div>
              <div className="Metrics__cardLabel">Álbumes</div>
            </div>
          </div>

          <div className="Metrics__card Metrics__card--users">
            <div className="Metrics__cardIcon">
              <FaUsers style={{ fontSize: 32 }} />
            </div>
            <div className="Metrics__cardInfo">
              <div className="Metrics__cardValue">{metrics.totalUsers}</div>
              <div className="Metrics__cardLabel">Usuarios</div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="Metrics__charts">
          {/* Canciones por género - Pie Chart */}
          {Object.keys(metrics.songsByGenre).length > 0 && (
            <div className="Metrics__chartCard">
              <h3 className="Metrics__chartTitle">Canciones por Género</h3>
              <div className="Metrics__chartContainer">
                <Pie data={genreChartData} options={pieOptions} />
              </div>
            </div>
          )}

          {/* Top 10 Artistas - Bar Chart */}
          {metrics.topArtists.length > 0 && (
            <div className="Metrics__chartCard">
              <h3 className="Metrics__chartTitle">Top 10 Artistas con Más Canciones</h3>
              <div className="Metrics__chartContainer">
                <Bar data={topArtistsData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Canciones y Álbumes por Año - Line Chart */}
          {Object.keys(metrics.songsByYear).length > 0 && (
            <div className="Metrics__chartCard Metrics__chartCard--full">
              <h3 className="Metrics__chartTitle">Canciones y Álbumes por Año</h3>
              <div className="Metrics__chartContainer">
                <Line data={yearChartData} options={chartOptions} />
              </div>
            </div>
          )}
        </div>

        {/* Tabla de detalles */}
        <div className="Metrics__table">
          <h3 className="Metrics__tableTitle">Distribución por Género</h3>
          <table>
            <thead>
              <tr>
                <th>Género</th>
                <th>Cantidad</th>
                <th>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(metrics.songsByGenre)
                .sort((a, b) => b[1] - a[1])
                .map(([genre, count]) => (
                  <tr key={genre}>
                    <td>{genre}</td>
                    <td>{count}</td>
                    <td>
                      {((count / metrics.totalSongs) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
