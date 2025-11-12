import axios from '../api/axiosConfig'

export const getSongsRequest = () => axios.get('/canciones')
export const getSongRequest = (id) => axios.get(`/canciones/${id}`)
export const searchSongsRequest = (query) => axios.get('/canciones', { params: { q: query } })
export const createSongRequest = (payload) => axios.post('/canciones/por-nombres', payload)
export const createSongByIdsRequest = (payload) => axios.post('/canciones', payload)

export default {
  getSongsRequest,
  getSongRequest,
  searchSongsRequest,
  createSongRequest,
  createSongByIdsRequest
}
