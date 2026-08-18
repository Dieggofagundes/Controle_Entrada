import { STATUS_LABEL, type StatusUsuario } from '../../types'

const estilos: Record<StatusUsuario, string> = {
  ATIVO: 'bg-success-bg text-success',
  PENDENTE: 'bg-warning-bg text-warning',
  INATIVO: 'bg-ink-faint/20 text-ink-muted',
  REJEITADO: 'bg-danger-bg text-danger',
}

export function StatusBadgeUsuario({ status }: { status: StatusUsuario }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${estilos[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}
