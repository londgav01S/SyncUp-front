import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { updateUser, deleteUser, getUserByCorreo } from '../../api/userService'
import { getFavorites } from '../../api/favoriteService'
import './Profile.css'

export default function Profile() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  // Estados
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    correo: '',
    nombre: '',
    nuevaContrasena: '',
    confirmarContrasena: ''
  })
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Cargar datos del usuario
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.correo) {
        navigate('/auth/login')
        return
      }

      try {
        setLoading(true)
        const response = await getUserByCorreo(user.correo)
        setUserData(response.data)
        setFormData({
          correo: response.data.correo || '',
          nombre: response.data.nombre || '',
          nuevaContrasena: '',
          confirmarContrasena: ''
        })

        // Cargar cantidad de favoritos
        const favorites = await getFavorites(user.correo)
        setFavoritesCount(favorites.length)
      } catch (err) {
        console.error('Error cargando datos del usuario:', err)
        setErrorMessage('Error al cargar tus datos')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user, navigate])

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Guardar cambios
  const handleSave = async (e) => {
    e.preventDefault()
    
    // Verificar que estamos en modo edición
    if (!editMode) {
      console.warn('⚠️ Intento de guardar sin estar en modo edición')
      return
    }
    
    setSuccessMessage('')
    setErrorMessage('')

    console.log('📝 Guardando cambios:', {
      editMode,
      correo: formData.correo,
      correoOriginal: userData.correo,
      nombre: formData.nombre,
      nombreOriginal: userData.nombre,
      tieneNuevaContrasena: !!formData.nuevaContrasena
    })

    // Validar correo
    if (formData.correo && formData.correo.trim() === '') {
      setErrorMessage('❌ El correo no puede estar vacío')
      return
    }

    // Validar contraseñas si se están cambiando
    if (formData.nuevaContrasena || formData.confirmarContrasena) {
      if (formData.nuevaContrasena !== formData.confirmarContrasena) {
        setErrorMessage('❌ Las contraseñas no coinciden')
        return
      }
      if (formData.nuevaContrasena.length < 6) {
        setErrorMessage('❌ La contraseña debe tener al menos 6 caracteres')
        return
      }
    }

    try {
      setLoading(true)
      
      const correoParaActualizar = formData.correo !== userData.correo ? formData.correo : null
      const nombreParaActualizar = formData.nombre !== userData.nombre ? formData.nombre : null
      const contrasenaParaActualizar = formData.nuevaContrasena || null
      
      console.log('🔄 Llamando a updateUser:', {
        correoActual: user.correo,
        nuevoCorreo: correoParaActualizar,
        nombre: nombreParaActualizar,
        nuevaContrasena: contrasenaParaActualizar ? '***' : null
      })

      const usuarioActualizado = await updateUser(
        user.correo,
        correoParaActualizar,
        nombreParaActualizar,
        contrasenaParaActualizar
      )

      console.log('✅ Usuario actualizado')
      setSuccessMessage('Perfil actualizado correctamente')
      
      // Si cambió el correo, actualizar el usuario en AuthContext
      if (correoParaActualizar && logout) {
        alert('Has cambiado tu correo. Por favor inicia sesión nuevamente.')
        logout()
        navigate('/auth/login')
        return
      }
      
      setEditMode(false)
      setFormData(prev => ({
        ...prev,
        nuevaContrasena: '',
        confirmarContrasena: ''
      }))

      // Recargar datos
      const nuevoCorreo = correoParaActualizar || user.correo
      const response = await getUserByCorreo(nuevoCorreo)
      setUserData(response.data)
      setFormData({
        correo: response.data.correo || '',
        nombre: response.data.nombre || '',
        nuevaContrasena: '',
        confirmarContrasena: ''
      })
    } catch (err) {
      console.error('❌ Error actualizando perfil:', err)
      setErrorMessage(`Error al actualizar el perfil: ${err.response?.data?.mensaje || err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Cancelar edición
  const handleCancel = () => {
    setEditMode(false)
    setFormData({
      correo: userData.correo || '',
      nombre: userData.nombre || '',
      nuevaContrasena: '',
      confirmarContrasena: ''
    })
    setSuccessMessage('')
    setErrorMessage('')
  }

  // Activar modo edición
  const handleEdit = (e) => {
    e.preventDefault() // Prevenir submit del formulario
    setSuccessMessage('')
    setErrorMessage('')
    setEditMode(true)
    console.log('✏️ Modo edición activado')
  }

  // Eliminar cuenta
  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    try {
      setLoading(true)
      await deleteUser(user.correo)
      alert('Tu cuenta ha sido eliminada exitosamente')
      logout()
      navigate('/')
    } catch (err) {
      console.error('Error eliminando cuenta:', err)
      setErrorMessage('Error al eliminar la cuenta')
      setShowDeleteConfirm(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !userData) {
    return (
      <div className="ProfilePage">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!user || !userData) {
    return null
  }

  const initials = userData.nombre
    ? userData.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div className="ProfilePage">
      {/* Header con avatar */}
      <div className="Profile__header">
        <div className="Profile__avatar">{initials}</div>
        <div className="Profile__info">
          <h1 className="Profile__name">{userData.nombre}</h1>
          <p className="Profile__email">{userData.correo}</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="Profile__stats">
        <div className="Profile__stat">
          <p className="Profile__statValue">{favoritesCount}</p>
          <p className="Profile__statLabel">Canciones favoritas</p>
        </div>
        <div className="Profile__stat">
          <p className="Profile__statValue">{userData.seguidos?.length || 0}</p>
          <p className="Profile__statLabel">Siguiendo</p>
        </div>
        <div className="Profile__stat">
          <p className="Profile__statValue">{userData.seguidores?.length || 0}</p>
          <p className="Profile__statLabel">Seguidores</p>
        </div>
      </div>

      {/* Mensajes */}
      {successMessage && (
        <div className="Profile__alert Profile__alert--success">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="Profile__alert Profile__alert--error">
          {errorMessage}
        </div>
      )}

      {/* Editar perfil */}
      <div className="Profile__section">
        <h2 className="Profile__sectionTitle">
          Información de la cuenta
          {process.env.NODE_ENV === 'development' && (
            <small style={{ marginLeft: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              (Modo edición: {editMode ? 'ACTIVO' : 'INACTIVO'})
            </small>
          )}
        </h2>
        
        <form className="Profile__form" onSubmit={handleSave}>
          <div className="Profile__formGroup">
            <label className="Profile__label">Correo electrónico</label>
            <input
              type="email"
              name="correo"
              className="Profile__input"
              value={formData.correo}
              onChange={handleChange}
              disabled={!editMode}
              required
            />
            {editMode && (
              <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Si cambias tu correo, deberás iniciar sesión nuevamente
              </small>
            )}
          </div>

          <div className="Profile__formGroup">
            <label className="Profile__label">Nombre</label>
            <input
              type="text"
              name="nombre"
              className="Profile__input"
              value={formData.nombre}
              onChange={handleChange}
              disabled={!editMode}
              required
            />
          </div>

          <div className="Profile__formGroup">
            <label className="Profile__label">Contraseña {editMode && '(opcional)'}</label>
            <input
              type="password"
              name="nuevaContrasena"
              className="Profile__input"
              value={formData.nuevaContrasena}
              onChange={handleChange}
              placeholder={editMode ? "Dejar en blanco para no cambiar" : "••••••••"}
              disabled={!editMode}
            />
          </div>

          {editMode && formData.nuevaContrasena && (
            <div className="Profile__formGroup">
              <label className="Profile__label">Confirmar contraseña</label>
              <input
                type="password"
                name="confirmarContrasena"
                className="Profile__input"
                value={formData.confirmarContrasena}
                onChange={handleChange}
                placeholder="Confirmar nueva contraseña"
              />
            </div>
          )}

          <div className="Profile__actions">
            {!editMode ? (
              <button
                type="button"
                className="Profile__btn Profile__btn--primary"
                onClick={handleEdit}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Editar perfil
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  className="Profile__btn Profile__btn--primary"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  className="Profile__btn Profile__btn--secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </form>
      </div>

      {/* Zona de peligro */}
      <div className="Profile__dangerZone">
        <h3 className="Profile__dangerTitle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L1 21h22L12 2zm0 4l8.5 15h-17L12 6zm-1 6h2v4h-2v-4zm0 5h2v2h-2v-2z" />
          </svg>
          Zona de peligro
        </h3>
        <p className="Profile__dangerText">
          Una vez que elimines tu cuenta, no hay vuelta atrás. Todos tus datos, favoritos, playlists y conexiones serán eliminados permanentemente.
        </p>
        
        {showDeleteConfirm ? (
          <div>
            <p style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '1rem' }}>
              ¿Estás seguro? Esta acción no se puede deshacer.
            </p>
            <div className="Profile__actions">
              <button
                className="Profile__btn Profile__btn--danger"
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}
              </button>
              <button
                className="Profile__btn Profile__btn--secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            className="Profile__btn Profile__btn--danger"
            onClick={handleDeleteAccount}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Eliminar mi cuenta
          </button>
        )}
      </div>
    </div>
  )
}
