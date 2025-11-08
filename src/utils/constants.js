// In Vite use import.meta.env; in other environments process.env may exist during SSR/build.
// Avoid referencing `process` directly in the browser where it's undefined.
const viteEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {}
const nodeEnv = (typeof process !== 'undefined' && process.env) ? process.env : {}

export const API_BASE_URL = (
	viteEnv.REACT_APP_API_BASE || viteEnv.VITE_API_BASE || nodeEnv.REACT_APP_API_BASE || 'http://localhost:4000/api'
)
