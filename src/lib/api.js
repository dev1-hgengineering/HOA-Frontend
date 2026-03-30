import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
})

const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/invite', '/accept', '/pending']

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const onPublicPage = publicPaths.some((p) => window.location.pathname.startsWith(p))
    if (error.response?.status === 401 && !onPublicPage) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
