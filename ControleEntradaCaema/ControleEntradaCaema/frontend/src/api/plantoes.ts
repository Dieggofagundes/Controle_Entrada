import { apiClient } from './client'
import type { Funcao, PaginaResposta, Plantao } from '../types'

export interface FiltroPlantoes {
  usuarioId?: string
  inicio?: string
  fim?: string
  pagina?: number
  tamanho?: number
}

export const plantoesApi = {
  atual: () =>
    apiClient.get<Plantao>('/plantoes/atual', { validateStatus: (s) => s === 200 || s === 204 }).then((r) =>
      r.status === 204 ? null : r.data,
    ),

  abrir: (funcao: Funcao, horaAssuncao?: string) =>
    apiClient.post<Plantao>('/plantoes', { funcao, horaAssuncao }).then((r) => r.data),

  concluir: (id: string, horaConclusao?: string) =>
    apiClient.put<Plantao>(`/plantoes/${id}/concluir`, { horaConclusao }).then((r) => r.data),

  meuHistorico: () => apiClient.get<Plantao[]>('/plantoes/meu-historico').then((r) => r.data),

  buscar: (filtro: FiltroPlantoes) =>
    apiClient
      .get<PaginaResposta<Plantao>>('/admin/relatorios/plantoes', { params: filtro })
      .then((r) => r.data),
}
