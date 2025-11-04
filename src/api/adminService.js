import axios from './axiosConfig'

export const getDashboardMetrics = () => axios.get('/admin/metrics')
export const getUsers = () => axios.get('/admin/users')
export const uploadMassive = (formData) => axios.post('/admin/upload', formData)
