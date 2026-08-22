import { apiClient } from './client'
import type { Funcao, LoginResponse, Usuario } from '../types'

export interface SolicitarCadastroPayload {
  matricula: string
  senha: string
  nomeCompleto: string
  nomeGuerra: string
  email?: string
  funcao: Funcao
}

export const authApi = {
  login: (matricula: string, senha: string) =>
    apiClient.post<LoginResponse>('/auth/login', { matricula, senha }).then((r) => r.data),

  solicitarCadastro: (payload: SolicitarCadastroPayload) =>
    apiClient.post<Usuario>('/auth/solicitar-cadastro', payload).then((r) => r.data),

  esqueciSenha: (matricula: string) =>
    apiClient.post<{ mensagem: string }>('/auth/esqueci-senha', { matricula }).then((r) => r.data),

  redefinirSenha: (token: string, novaSenha: string) =>
    apiClient.post<{ mensagem: string }>('/auth/redefinir-senha', { token, novaSenha }).then((r) => r.data),
}
