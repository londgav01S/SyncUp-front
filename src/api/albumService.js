import axios from './axiosConfig'

// Backend endpoints are in Spanish: /albumes
export const getAlbums = () => axios.get('/albumes/todos')

export const getAlbumByName = (nombre) => axios.get('/albumes/nombre', { params: { nombre } })

// Create album using artist name instead of ID
export const createAlbum = (payload) => axios.post('/albumes/nombre', payload)

// Alternative: create by artist ID if needed
export const createAlbumById = (payload) => axios.post('/albumes/id', payload)
