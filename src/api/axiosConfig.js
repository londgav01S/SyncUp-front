import axios from 'axios'
import { API_BASE_URL } from '../utils/constants'

// Nota: No forzamos 'Content-Type' en requests GET para evitar preflight OPTIONS innecesario
// que termina en 404 si el backend no define ese verbo. Solo lo añadiremos cuando el body exista.
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

// Interceptor para añadir Content-Type solo en métodos con cuerpo
axiosInstance.interceptors.request.use(cfg => {
  const method = (cfg.method || 'get').toLowerCase()
  if (['post','put','patch'].includes(method) && !cfg.headers['Content-Type']) {
    cfg.headers['Content-Type'] = 'application/json'
  }
  return cfg
})

export default axiosInstance
