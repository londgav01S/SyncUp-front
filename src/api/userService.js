import axios from './axiosConfig'

export const login = (credentials) => axios.post('/auth/login', credentials)
export const register = (data) => axios.post('/auth/register', data)
export const getProfile = () => axios.get('/user/profile')
// Backend expects RequestParam (nombre, correo, contrasena) at POST /usuarios
export const createUser = ({ nombre, correo, contrasena }) => {
	// Send as query params with POST so Spring @RequestParam picks them up
	return axios.post('/usuarios', null, { params: { nombre, correo, contrasena } })
}

// Fetch user by correo (backend exposes GET /usuarios?correo=...)
export const getUserByCorreo = (correo) => {
	return axios.get('/usuarios', { params: { correo } })
}
