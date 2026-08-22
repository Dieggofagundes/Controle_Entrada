export function EmptyState({ titulo, descricao }: { titulo: string; descricao?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-white/50 px-6 py-14 text-center">
      <p className="font-display text-base font-semibold text-navy">{titulo}</p>
      {descricao && <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{descricao}</p>}
    </div>
  )
}
