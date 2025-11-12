import React, { useState, useEffect, useContext } from 'react'
import { getFollowers, followUser, unfollowUser, getUserByCorreo } from '../../api/userService'
import { AuthContext } from '../../context/AuthContext'
import './Friends.css'

export default function Friends() {
  const { user } = useContext(AuthContext)
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('followers') // 'followers' | 'following' | 'search'

  useEffect(() => {
    if (user?.correo) {
      loadFollowers()
      loadUserInfo()
    }
  }, [user])

  const loadFollowers = async () => {
    try {
      setLoading(true)
      const userEmail = user?.correo || localStorage.getItem('userEmail')
      const data = await getFollowers(userEmail)
      console.log('👥 Seguidores recibidos del backend:', data)
      setFollowers(data)
    } catch (err) {
      console.error('Error cargando seguidores:', err)
      setError('No se pudieron cargar los seguidores')
    } finally {
      setLoading(false)
    }
  }

  const loadUserInfo = async () => {
    try {
      const userEmail = user?.correo || localStorage.getItem('userEmail')
      const response = await getUserByCorreo(userEmail)
      console.log('👤 Info del usuario completa:', response.data)
      console.log('📋 Usuarios seguidos:', response.data?.seguidos)
      // El backend devuelve 'seguidos' como lista de usuarios que sigue
      const seguidos = response.data?.seguidos || []
      setFollowing(seguidos)
      console.log('✅ Estado following actualizado:', seguidos)
    } catch (err) {
      console.error('Error cargando información del usuario:', err)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchEmail.trim()) return

    try {
      setLoading(true)
      setError(null)
      const response = await getUserByCorreo(searchEmail.trim())
      setSearchResult(response.data)
    } catch (err) {
      console.error('Error buscando usuario:', err)
      setError('Usuario no encontrado')
      setSearchResult(null)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (followEmail) => {
    try {
      const userEmail = user?.correo || localStorage.getItem('userEmail')
      await followUser(userEmail, followEmail)
      alert('✅ Ahora sigues a este usuario')
      // Recargar ambas listas para actualizar contadores
      await loadUserInfo()
      await loadFollowers()
    } catch (err) {
      console.error('Error al seguir:', err)
      alert('No se pudo seguir al usuario')
    }
  }

  const handleUnfollow = async (unfollowEmail) => {
    try {
      const userEmail = user?.correo || localStorage.getItem('userEmail')
      await unfollowUser(userEmail, unfollowEmail)
      alert('✅ Dejaste de seguir a este usuario')
      // Recargar ambas listas para actualizar contadores
      await loadUserInfo()
      await loadFollowers()
    } catch (err) {
      console.error('Error al dejar de seguir:', err)
      alert('No se pudo dejar de seguir')
    }
  }

  const isFollowing = (email) => {
    const result = following.some(u => (u.correo || u) === email)
    console.log(`🔍 ¿Siguiendo a ${email}?`, result, 'Lista:', following)
    return result
  }

  return (
    <div className="FriendsPage" style={{ padding: 'var(--spacing-lg)' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ 
          fontSize: 32, 
          fontWeight: 700, 
          color: 'var(--primary)', 
          marginBottom: 'var(--spacing-sm)' 
        }}>
          👥 Amigos y Seguidores
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>
          Conecta con otros amantes de la música
        </p>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--spacing-sm)', 
        borderBottom: '2px solid var(--border-color)',
        marginBottom: 'var(--spacing-lg)'
      }}>
        <button
          onClick={() => setActiveTab('followers')}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            background: activeTab === 'followers' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'followers' ? '#fff' : 'var(--text)',
            border: 'none',
            borderBottom: activeTab === 'followers' ? '3px solid var(--accent)' : 'none',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition-fast)'
          }}
        >
          Seguidores ({followers.length})
        </button>
        <button
          onClick={() => setActiveTab('following')}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            background: activeTab === 'following' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'following' ? '#fff' : 'var(--text)',
            border: 'none',
            borderBottom: activeTab === 'following' ? '3px solid var(--accent)' : 'none',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition-fast)'
          }}
        >
          Siguiendo ({following.length})
        </button>
        <button
          onClick={() => setActiveTab('search')}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            background: activeTab === 'search' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'search' ? '#fff' : 'var(--text)',
            border: 'none',
            borderBottom: activeTab === 'search' ? '3px solid var(--accent)' : 'none',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition-fast)'
          }}
        >
          🔍 Buscar
        </button>
      </div>

      {/* Content */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-muted)' }}>
          Cargando...
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div>
          <form onSubmit={handleSearch} style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Buscar por correo electrónico..."
                style={{
                  flex: 1,
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: 14,
                  background: 'var(--bg)',
                  color: 'var(--text)'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-lg)',
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Buscar
              </button>
            </div>
          </form>

          {error && <p style={{ color: '#ff6b6b', marginBottom: 'var(--spacing-md)' }}>{error}</p>}

          {searchResult && (
            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-md)',
              padding: 'var(--spacing-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                  {searchResult.nombre}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                  {searchResult.correo}
                </p>
              </div>
              {searchResult.correo !== user?.correo && (
                <button
                  onClick={() => isFollowing(searchResult.correo) 
                    ? handleUnfollow(searchResult.correo) 
                    : handleFollow(searchResult.correo)
                  }
                  style={{
                    padding: 'var(--spacing-sm) var(--spacing-lg)',
                    background: isFollowing(searchResult.correo) ? 'var(--bg)' : 'var(--accent)',
                    color: isFollowing(searchResult.correo) ? 'var(--text)' : '#fff',
                    border: isFollowing(searchResult.correo) ? '1px solid var(--border-color)' : 'none',
                    borderRadius: 'var(--border-radius-full)',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {isFollowing(searchResult.correo) ? 'Dejar de seguir' : 'Seguir'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Followers Tab */}
      {activeTab === 'followers' && (
        <div>
          {followers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-muted)' }}>
              <p>Aún no tienes seguidores</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
              {followers.map(follower => (
                <div
                  key={follower.correo}
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: 'var(--spacing-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                      {follower.nombre}
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                      {follower.correo}
                    </p>
                  </div>
                  <button
                    onClick={() => isFollowing(follower.correo) 
                      ? handleUnfollow(follower.correo) 
                      : handleFollow(follower.correo)
                    }
                    style={{
                      padding: 'var(--spacing-sm) var(--spacing-lg)',
                      background: isFollowing(follower.correo) ? 'var(--bg)' : 'var(--accent)',
                      color: isFollowing(follower.correo) ? 'var(--text)' : '#fff',
                      border: isFollowing(follower.correo) ? '1px solid var(--border-color)' : 'none',
                      borderRadius: 'var(--border-radius-full)',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {isFollowing(follower.correo) ? 'Dejar de seguir' : 'Seguir de vuelta'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Following Tab */}
      {activeTab === 'following' && (
        <div>
          {following.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-muted)' }}>
              <p>No sigues a nadie todavía</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
              {following.map((followed, index) => {
                // El backend puede devolver objetos Usuario o solo strings/IDs
                const displayName = followed?.nombre || followed?.correo || followed || `Usuario ${index + 1}`
                const displayEmail = followed?.correo || followed || ''
                
                return (
                  <div
                    key={displayEmail || index}
                    style={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius-md)',
                      padding: 'var(--spacing-lg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                        {displayName}
                      </h3>
                      <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                        {displayEmail}
                      </p>
                    </div>
                    {displayEmail && (
                      <button
                        onClick={() => handleUnfollow(displayEmail)}
                        style={{
                          padding: 'var(--spacing-sm) var(--spacing-lg)',
                          background: 'var(--bg)',
                          color: 'var(--text)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--border-radius-full)',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Dejar de seguir
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
