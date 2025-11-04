import axios from '../api/axiosConfig'

export const loginRequest = (credentials) => axios.post('/auth/login', credentials)
export const registerRequest = (data) => axios.post('/auth/register', data)
export const getProfileRequest = () => axios.get('/user/profile')

export default {
  loginRequest,
  registerRequest,
  getProfileRequest
}
