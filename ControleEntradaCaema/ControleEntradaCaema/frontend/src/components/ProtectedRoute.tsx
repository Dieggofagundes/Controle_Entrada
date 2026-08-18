import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from './ui/Spinner'

export function ProtectedRoute({ children, apenasAdmin = false }: { children: ReactNode; apenasAdmin?: boolean }) {
  const { usuario, carregando } = useAuth()

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center text-navy">
        <Spinner tamanho={28} />
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (apenasAdmin && usuario.perfil !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
