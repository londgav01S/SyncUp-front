import React, { useState, useEffect } from 'react'
import axios from '../../api/axiosConfig'
import { FaUsers, FaShieldAlt, FaUserCheck, FaEye, FaTrash, FaTimes, FaHeart, FaUserFriends, FaMusic, FaFilePdf } from 'react-icons/fa'
import jsPDF from 'jspdf'
import './ManageUsers.css'

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    // Filtrar usuarios por búsqueda
    if (searchTerm.trim() === '') {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(user =>
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.correo.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUsers(filtered)
    }
  }, [searchTerm, users])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get('/usuarios/todos')
      const usersData = Array.isArray(response.data) ? response.data : []
      setUsers(usersData)
      setFilteredUsers(usersData)
      console.log('👥 Usuarios cargados:', usersData.length)
    } catch (err) {
      console.error('Error cargando usuarios:', err)
      setError('No se pudieron cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  const handleDeleteUser = async (user) => {
    // Proteger al admin principal
    if (user.correo === 'admin@gmail.com') {
      alert('No se puede eliminar al administrador principal del sistema')
      return
    }

    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar al usuario "${user.nombre}" (${user.correo})?\n\nEsta acción no se puede deshacer.`
    )
    
    if (!confirmDelete) return

    try {
      await axios.delete('/usuarios', {
        params: { correo: user.correo }
      })
      alert(`Usuario "${user.nombre}" eliminado correctamente`)
      fetchUsers() // Recargar lista
    } catch (err) {
      console.error('Error eliminando usuario:', err)
      alert('No se pudo eliminar el usuario: ' + (err.response?.data?.message || err.message))
    }
  }

  const getInitials = (nombre) => {
    const parts = nombre.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return nombre.substring(0, 2).toUpperCase()
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Configuración
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    let yPosition = margin

    // Header
    doc.setFillColor(28, 43, 58) // --primary
    doc.rect(0, 0, pageWidth, 40, 'F')
    
    doc.setTextColor(250, 248, 244) // --text-light
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('SyncUp - Gestión de Usuarios', margin, 25)
    
    // Fecha
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const fecha = new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    doc.text(`Generado: ${fecha}`, margin, 35)

    yPosition = 55

    // Estadísticas
    doc.setTextColor(68, 75, 84) // --text
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumen', margin, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Total de usuarios: ${stats.total}`, margin, yPosition)
    yPosition += 6
    doc.text(`Administradores: ${stats.admins}`, margin, yPosition)
    yPosition += 6
    doc.text(`Usuarios regulares: ${stats.regularUsers}`, margin, yPosition)
    yPosition += 15

    // Tabla de usuarios
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Lista de Usuarios', margin, yPosition)
    yPosition += 10

    // Headers de tabla
    doc.setFillColor(245, 245, 245)
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F')
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 100, 100)
    doc.text('Nombre', margin + 2, yPosition)
    doc.text('Correo', margin + 50, yPosition)
    doc.text('Rol', margin + 110, yPosition)
    doc.text('Favoritos', margin + 135, yPosition)
    doc.text('Seguidores', margin + 160, yPosition)
    yPosition += 8

    // Datos de usuarios
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(68, 75, 84)
    
    filteredUsers.forEach((user, index) => {
      // Nueva página si es necesario
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        yPosition = margin
      }

      const isAdmin = user.correo === 'admin@gmail.com' || user.role === 'admin'
      const nombre = user.nombre.length > 20 ? user.nombre.substring(0, 17) + '...' : user.nombre
      const correo = user.correo.length > 25 ? user.correo.substring(0, 22) + '...' : user.correo

      // Alternar color de fila
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250)
        doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 7, 'F')
      }

      doc.text(nombre, margin + 2, yPosition)
      doc.text(correo, margin + 50, yPosition)
      doc.text(isAdmin ? 'Admin' : 'Usuario', margin + 110, yPosition)
      doc.text((user.listaFavoritos?.length || 0).toString(), margin + 140, yPosition)
      doc.text((user.seguidores?.length || 0).toString(), margin + 165, yPosition)
      
      yPosition += 7
    })

    // Footer
    const totalPages = doc.internal.pages.length - 1
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
    }

    // Guardar PDF
    const filename = `usuarios_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename)
  }

  const stats = {
    total: users.length,
    admins: users.filter(u => u.correo === 'admin@gmail.com' || u.role === 'admin').length,
    regularUsers: users.filter(u => u.correo !== 'admin@gmail.com' && u.role !== 'admin').length
  }

  if (loading) {
    return (
      <div className="ManageUsersPage">
        <div className="ManageUsers__loading">
          <div className="ManageUsers__spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="ManageUsersPage">
        <div className="ManageUsers__empty">
          <p style={{ color: '#ff6b6b' }}>{error}</p>
          <button onClick={fetchUsers} style={{ marginTop: 16 }}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="ManageUsersPage">
      {/* Header */}
      <div className="ManageUsers__header">
        <h1 className="ManageUsers__title">Gestión de Usuarios</h1>
        <p className="ManageUsers__subtitle">Administra todos los usuarios registrados en la plataforma</p>
      </div>

      {/* Stats */}
      <div className="ManageUsers__stats">
        <div className="ManageUsers__statCard">
          <div className="ManageUsers__statIcon ManageUsers__statIcon--users">
            <FaUsers />
          </div>
          <div className="ManageUsers__statContent">
            <div className="ManageUsers__statValue">{stats.total}</div>
            <div className="ManageUsers__statLabel">Total Usuarios</div>
          </div>
        </div>

        <div className="ManageUsers__statCard">
          <div className="ManageUsers__statIcon ManageUsers__statIcon--admins">
            <FaShieldAlt />
          </div>
          <div className="ManageUsers__statContent">
            <div className="ManageUsers__statValue">{stats.admins}</div>
            <div className="ManageUsers__statLabel">Administradores</div>
          </div>
        </div>

        <div className="ManageUsers__statCard">
          <div className="ManageUsers__statIcon ManageUsers__statIcon--active">
            <FaUserCheck />
          </div>
          <div className="ManageUsers__statContent">
            <div className="ManageUsers__statValue">{stats.regularUsers}</div>
            <div className="ManageUsers__statLabel">Usuarios Regulares</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="ManageUsers__filters">
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ManageUsers__searchInput"
        />
        <button
          onClick={exportToPDF}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#e04a2f'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
          title="Exportar lista a PDF"
        >
          <FaFilePdf /> Exportar PDF
        </button>
      </div>

      {/* Table */}
      <div className="ManageUsers__tableContainer">
        <table className="ManageUsers__table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Favoritos</th>
              <th>Seguidores</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="ManageUsers__empty">
                  {searchTerm ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios registrados'}
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.correo}>
                  <td>
                    <div className="ManageUsers__userInfo">
                      <div className="ManageUsers__userAvatar">
                        {getInitials(user.nombre)}
                      </div>
                      <div>
                        <div className="ManageUsers__userName">{user.nombre}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="ManageUsers__userEmail">{user.correo}</div>
                  </td>
                  <td>
                    <span className={`ManageUsers__badge ${user.correo === 'admin@gmail.com' || user.role === 'admin' ? 'ManageUsers__badge--admin' : 'ManageUsers__badge--user'}`}>
                      {user.correo === 'admin@gmail.com' || user.role === 'admin' ? <><FaShieldAlt /> Admin</> : 'Usuario'}
                    </span>
                  </td>
                  <td>{user.listaFavoritos?.length || 0}</td>
                  <td>{user.seguidores?.length || 0}</td>
                  <td>
                    <div className="ManageUsers__actions">
                      <button
                        className="ManageUsers__actionBtn ManageUsers__actionBtn--view"
                        onClick={() => handleViewUser(user)}
                        title="Ver detalles"
                      >
                        <FaEye /> Ver
                      </button>
                      {user.correo !== 'admin@gmail.com' && (
                        <button
                          className="ManageUsers__actionBtn ManageUsers__actionBtn--delete"
                          onClick={() => handleDeleteUser(user)}
                          title="Eliminar usuario"
                        >
                          <FaTrash /> Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de detalles */}
      {showModal && selectedUser && (
        <div className="ManageUsers__modal" onClick={() => setShowModal(false)}>
          <div className="ManageUsers__modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="ManageUsers__modalHeader">
              <h2 className="ManageUsers__modalTitle">Detalles del Usuario</h2>
              <button className="ManageUsers__modalClose" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="ManageUsers__modalSection">
              <h3 className="ManageUsers__modalSectionTitle">
                <FaUsers /> Información Personal
              </h3>
              <div className="ManageUsers__detailRow">
                <span className="ManageUsers__detailLabel">Nombre:</span>
                <span className="ManageUsers__detailValue">{selectedUser.nombre}</span>
              </div>
              <div className="ManageUsers__detailRow">
                <span className="ManageUsers__detailLabel">Correo:</span>
                <span className="ManageUsers__detailValue">{selectedUser.correo}</span>
              </div>
              <div className="ManageUsers__detailRow">
                <span className="ManageUsers__detailLabel">Rol:</span>
                <span className="ManageUsers__detailValue">
                  {selectedUser.correo === 'admin@gmail.com' || selectedUser.role === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              </div>
            </div>

            <div className="ManageUsers__modalSection">
              <h3 className="ManageUsers__modalSectionTitle">
                <FaMusic /> Actividad Musical
              </h3>
              <div className="ManageUsers__detailRow">
                <span className="ManageUsers__detailLabel">
                  <FaHeart style={{ color: 'var(--accent)', marginRight: 4 }} />
                  Canciones Favoritas:
                </span>
                <span className="ManageUsers__detailValue">
                  {selectedUser.listaFavoritos?.length || 0}
                </span>
              </div>
              <div className="ManageUsers__detailRow">
                <span className="ManageUsers__detailLabel">Playlists:</span>
                <span className="ManageUsers__detailValue">
                  {selectedUser.listasDeReproduccion?.length || 0}
                </span>
              </div>
            </div>

            <div className="ManageUsers__modalSection">
              <h3 className="ManageUsers__modalSectionTitle">
                <FaUserFriends /> Red Social
              </h3>
              <div className="ManageUsers__detailRow">
                <span className="ManageUsers__detailLabel">Seguidores:</span>
                <span className="ManageUsers__detailValue">
                  {selectedUser.seguidores?.length || 0}
                </span>
              </div>
              <div className="ManageUsers__detailRow">
                <span className="ManageUsers__detailLabel">Siguiendo:</span>
                <span className="ManageUsers__detailValue">
                  {selectedUser.seguidos?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
