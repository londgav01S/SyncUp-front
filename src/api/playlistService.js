import axios from './axiosConfig'

export const getPlaylists = () => axios.get('/playlists')
export const getPlaylist = (id) => axios.get(`/playlists/${id}`)
export const createPlaylist = (payload) => axios.post('/playlists', payload)
