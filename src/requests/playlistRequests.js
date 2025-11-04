import axios from '../api/axiosConfig'

export const getPlaylistsRequest = () => axios.get('/playlists')
export const getPlaylistRequest = (id) => axios.get(`/playlists/${id}`)
export const createPlaylistRequest = (payload) => axios.post('/playlists', payload)

export default {
  getPlaylistsRequest,
  getPlaylistRequest,
  createPlaylistRequest
}
