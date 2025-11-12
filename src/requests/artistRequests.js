import axios from '../api/axiosConfig'

export const getArtistsRequest = () => axios.get('/artistas')
export const getArtistRequest = (id) => axios.get(`/artistas/${id}`)
export const createArtistRequest = (payload) => axios.post('/artistas', payload)

export default {
  getArtistsRequest,
  getArtistRequest,
  createArtistRequest
}
