import axios from '../api/axiosConfig'

export const getArtistsRequest = () => axios.get('/artists')
export const getArtistRequest = (id) => axios.get(`/artists/${id}`)

export default {
  getArtistsRequest,
  getArtistRequest
}
