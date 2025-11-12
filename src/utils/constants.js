// In Vite use import.meta.env; in other environments process.env may exist during SSR/build.
// Avoid referencing `process` directly in the browser where it's undefined.
const viteEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {}
const nodeEnv = (typeof process !== 'undefined' && process.env) ? process.env : {}

// Base URL sin sufijo /api porque los controladores backend usan rutas como /usuarios, /general, etc.
// Si en el futuro se agrega un prefijo global (ej. server.servlet.context-path=/api), simplemente vuelve a añadirlo aquí.
// En desarrollo usamos proxy de Vite en "/api" para evitar CORS; en prod se puede
// configurar VITE_API_BASE a la URL real del backend.
export const API_BASE_URL = (
	(viteEnv.DEV ? '/api' : (viteEnv.REACT_APP_API_BASE || viteEnv.VITE_API_BASE || nodeEnv.REACT_APP_API_BASE))
	|| 'http://localhost:8080'
)
