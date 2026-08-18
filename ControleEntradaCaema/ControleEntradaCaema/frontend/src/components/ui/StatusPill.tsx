interface StatusPillProps {
  aberto: boolean
  textoAberto?: string
  textoFechado?: string
}

/**
 * Elemento de assinatura visual do sistema: um "pulso" para indicar
 * que uma visita/plantao esta em aberto, e um marcador solido quando concluido.
 */
export function StatusPill({ aberto, textoAberto = 'Em aberto', textoFechado = 'Concluido' }: StatusPillProps) {
  if (aberto) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-2.5 py-1 text-xs font-semibold text-warning">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-75" />
          <span className="status-dot relative bg-warning" />
        </span>
        {textoAberto}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success">
      <span className="status-dot bg-success" />
      {textoFechado}
    </span>
  )
}
