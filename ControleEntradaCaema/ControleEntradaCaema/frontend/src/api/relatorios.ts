import { apiClient } from './client'
import type { RelatorioResumo } from '../types'

export const relatoriosApi = {
  resumo: () => apiClient.get<RelatorioResumo>('/admin/relatorios/resumo').then((r) => r.data),

  exportarVisitantesCsv: async (inicio?: string, fim?: string) => {
    const response = await apiClient.get('/admin/relatorios/visitantes/exportar', {
      params: { inicio, fim },
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url

    const disposition = response.headers['content-disposition'] as string | undefined
    const match = disposition?.match(/filename="(.+)"/)
    link.download = match?.[1] ?? 'relatorio-visitantes.csv'

    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
