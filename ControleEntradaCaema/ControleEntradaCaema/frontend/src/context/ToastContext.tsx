import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type TipoToast = 'sucesso' | 'erro'

interface Toast {
  id: number
  tipo: TipoToast
  mensagem: string
}

interface ToastContextValue {
  notificar: (mensagem: string, tipo?: TipoToast) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

let proximoId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const notificar = useCallback((mensagem: string, tipo: TipoToast = 'sucesso') => {
    const id = proximoId++
    setToasts((atual) => [...atual, { id, tipo, mensagem }])
    setTimeout(() => {
      setToasts((atual) => atual.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  return (
    <ToastContext.Provider value={{ notificar }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto w-full max-w-sm rounded-lg border px-4 py-3 text-sm font-medium shadow-popover ${
              toast.tipo === 'sucesso'
                ? 'border-success/20 bg-success-bg text-success'
                : 'border-danger/20 bg-danger-bg text-danger'
            }`}
          >
            {toast.mensagem}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve ser usado dentro de um ToastProvider')
  return ctx
}
