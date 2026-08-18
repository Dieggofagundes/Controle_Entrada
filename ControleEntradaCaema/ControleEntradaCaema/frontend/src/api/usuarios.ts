import { apiClient } from './client'
import type { Funcao, Perfil, StatusUsuario, Usuario } from '../types'

export interface CriarUsuarioPayload {
  matricula: string
  senha: string
  nomeCompleto: string
  nomeGuerra: string
  email?: string
  funcao: Funcao
  perfil: Perfil
}

export interface AtualizarUsuarioPayload {
  nomeCompleto: string
  nomeGuerra: string
  email?: string
  funcao: Funcao
  perfil: Perfil
  status: StatusUsuario
}

export const usuariosApi = {
  meuPerfil: () => apiClient.get<Usuario>('/usuarios/me').then((r) => r.data),

  alterarMinhaSenha: (senhaAtual: string, novaSenha: string) =>
    apiClient.put('/usuarios/me/senha', { senhaAtual, novaSenha }).then((r) => r.data),

  listarTodos: () => apiClient.get<Usuario[]>('/admin/usuarios').then((r) => r.data),

  listarPendentes: () => apiClient.get<Usuario[]>('/admin/usuarios/pendentes').then((r) => r.data),

  criar: (payload: CriarUsuarioPayload) =>
    apiClient.post<Usuario>('/admin/usuarios', payload).then((r) => r.data),

  aprovar: (id: string, funcao: Funcao, perfil: Perfil) =>
    apiClient.put<Usuario>(`/admin/usuarios/${id}/aprovar`, { funcao, perfil }).then((r) => r.data),

  rejeitar: (id: string) => apiClient.put(`/admin/usuarios/${id}/rejeitar`).then((r) => r.data),

  atualizar: (id: string, payload: AtualizarUsuarioPayload) =>
    apiClient.put<Usuario>(`/admin/usuarios/${id}`, payload).then((r) => r.data),

  resetarSenha: (id: string, novaSenha: string) =>
    apiClient.put(`/admin/usuarios/${id}/senha`, { novaSenha }).then((r) => r.data),

  alterarStatus: (id: string, status: StatusUsuario) =>
    apiClient.put(`/admin/usuarios/${id}/status/${status}`).then((r) => r.data),

  excluir: (id: string) => apiClient.delete(`/admin/usuarios/${id}`).then((r) => r.data),
}
