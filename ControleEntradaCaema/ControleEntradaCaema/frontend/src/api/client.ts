import axios from 'axios'

export const TOKEN_KEY = 'caema.token'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export function extrairMensagemErro(error: unknown, padrao = 'Ocorreu um erro. Tente novamente.'): string {
  if (axios.isAxiosError(error)) {
    const mensagem = error.response?.data?.mensagem
    if (mensagem) return mensagem
    if (error.code === 'ERR_NETWORK') {
      return 'Nao foi possivel conectar ao servidor. Verifique sua internet e tente novamente.'
    }
  }
  return padrao
}
