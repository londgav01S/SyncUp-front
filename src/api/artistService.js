import axios from './axiosConfig'

// Backend endpoints are in Spanish: /artistas
export const getArtists = () => axios.get('/artistas')

// Backend currently does not expose GET /artistas/{id}; placeholder for future
export const getArtist = (id) => axios.get(`/artistas/${id}`)

export const createArtist = (payload) => axios.post('/artistas', payload)
