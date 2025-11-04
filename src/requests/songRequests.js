import axios from '../api/axiosConfig'

export const getSongRequest = (id) => axios.get(`/songs/${id}`)
export const searchSongsRequest = (query) => axios.get('/songs', { params: { q: query } })
export const createSongRequest = (payload) => axios.post('/songs', payload)

export default {
  getSongRequest,
  searchSongsRequest,
  createSongRequest
}
