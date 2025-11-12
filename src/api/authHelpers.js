// Lightweight helpers to access the current authenticated user
// and compose common params for backend calls that require the usuario/correo

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('auth:user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Some endpoints expect nombreUsuario in query params (e.g., /usuarios/like)
export const withNombreUsuario = (params = {}) => {
  const user = getCurrentUser()
  // Backend stores correo in field `usuario`
  const nombreUsuario = user?.usuario || user?.correo || undefined
  return nombreUsuario ? { nombreUsuario, ...params } : params
}

// Some endpoints expect `correo`
export const withCorreo = (params = {}) => {
  const user = getCurrentUser()
  const correo = user?.correo || user?.usuario || undefined
  return correo ? { correo, ...params } : params
}
