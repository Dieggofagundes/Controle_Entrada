import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi } from '../api/auth'
import { TOKEN_KEY } from '../api/client'
import { usuariosApi } from '../api/usuarios'
import type { Usuario } from '../types'

interface AuthContextValue {
  usuario: Usuario | null
  carregando: boolean
  logar: (matricula: string, senha: string) => Promise<void>
  sair: () => void
  atualizarUsuario: (usuario: Usuario) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setCarregando(false)
      return
    }

    usuariosApi
      .meuPerfil()
      .then(setUsuario)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setCarregando(false))
  }, [])

  async function logar(matricula: string, senha: string) {
    const resposta = await authApi.login(matricula, senha)
    localStorage.setItem(TOKEN_KEY, resposta.token)
    setUsuario(resposta.usuario)
  }

  function sair() {
    localStorage.removeItem(TOKEN_KEY)
    setUsuario(null)
    window.location.href = '/login'
  }

  function atualizarUsuario(usuarioAtualizado: Usuario) {
    setUsuario(usuarioAtualizado)
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, logar, sair, atualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return ctx
}
