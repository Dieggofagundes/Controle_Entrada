import { apiClient } from './client'
import type { PaginaResposta, RegistroVisitante } from '../types'

export interface NovoRegistroPayload {
  nomeVisitante: string
  endereco?: string
  telefone?: string
  cpf: string
  localVisita: string
  numeroCracha?: string
  horaEntrada?: string
}

export interface AtualizarRegistroPayload {
  nomeVisitante: string
  endereco?: string
  telefone?: string
  cpf: string
  localVisita: string
  numeroCracha?: string
}

export interface FiltroRegistros {
  apenasAbertos?: boolean
  cpf?: string
  nome?: string
  localVisita?: string
  inicio?: string
  fim?: string
  pagina?: number
  tamanho?: number
}

export const registrosApi = {
  registrarEntrada: (payload: NovoRegistroPayload) =>
    apiClient.post<RegistroVisitante>('/registros', payload).then((r) => r.data),

  registrarSaida: (id: string, horaSaida?: string) =>
    apiClient.put<RegistroVisitante>(`/registros/${id}/saida`, { horaSaida }).then((r) => r.data),

  atualizar: (id: string, payload: AtualizarRegistroPayload) =>
    apiClient.put<RegistroVisitante>(`/registros/${id}`, payload).then((r) => r.data),

  listarAbertos: () => apiClient.get<RegistroVisitante[]>('/registros/abertos').then((r) => r.data),

  buscar: (filtro: FiltroRegistros) =>
    apiClient.get<PaginaResposta<RegistroVisitante>>('/registros', { params: filtro }).then((r) => r.data),

  buscarAdmin: (filtro: FiltroRegistros) =>
    apiClient
      .get<PaginaResposta<RegistroVisitante>>('/admin/relatorios/visitantes', { params: filtro })
      .then((r) => r.data),

  excluir: (id: string) => apiClient.delete(`/registros/${id}`).then((r) => r.data),
}
