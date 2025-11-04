import axios from '../api/axiosConfig'

export const getDashboardMetricsRequest = () => axios.get('/admin/metrics')
export const getUsersRequest = () => axios.get('/admin/users')
export const uploadMassiveRequest = (formData) => axios.post('/admin/upload', formData)

export default {
  getDashboardMetricsRequest,
  getUsersRequest,
  uploadMassiveRequest
}
