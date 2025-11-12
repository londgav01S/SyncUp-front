import axios from './axiosConfig'

// Backend endpoints are in Spanish: /canciones
export const getSongs = () => axios.get('/canciones')

export const getSong = (id) => axios.get(`/canciones/${id}`)

export const searchSongs = (query) => axios.get('/canciones', { params: { q: query } })

// Create song using names (artist name and album title) instead of IDs
export const createSong = (payload) => axios.post('/canciones/por-nombres', payload)

// Alternative: create by IDs if needed
export const createSongByIds = (payload) => axios.post('/canciones', payload)
