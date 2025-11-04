import axios from './axiosConfig'

export const login = (credentials) => axios.post('/auth/login', credentials)
export const register = (data) => axios.post('/auth/register', data)
export const getProfile = () => axios.get('/user/profile')
