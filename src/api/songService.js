import axios from './axiosConfig'

export const getSong = (id) => axios.get(`/songs/${id}`)
export const searchSongs = (query) => axios.get('/songs', { params: { q: query } })
export const createSong = (payload) => axios.post('/songs', payload)
