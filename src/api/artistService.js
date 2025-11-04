import axios from './axiosConfig'

export const getArtists = () => axios.get('/artists')
export const getArtist = (id) => axios.get(`/artists/${id}`)
