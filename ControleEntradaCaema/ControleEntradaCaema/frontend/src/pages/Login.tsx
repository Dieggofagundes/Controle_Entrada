import { AlertCircle } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { extrairMensagemErro } from '../api/client'
import { AuthLayout } from '../components/AuthLayout'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { logar } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [matricula, setMatricula] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setCarregando(true)

    try {
      await logar(matricula.trim(), senha)
      const destino = (location.state as { destino?: string } | null)?.destino ?? '/'
      navigate(destino, { replace: true })
    } catch (e) {
      setErro(extrairMensagemErro(e, 'Matricula ou senha invalidos.'))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <AuthLayout
      titulo="Entrar no sistema"
      subtitulo="Informe sua matricula e senha para acessar o controle de entrada."
      rodape={
        <div className="space-y-2 text-center">
          <Link to="/esqueci-senha" className="font-medium text-teal hover:underline">
            Esqueci minha senha
          </Link>
          <p className="text-ink-muted">
            Ainda nao tem acesso?{' '}
            <Link to="/cadastrar" className="font-semibold text-teal hover:underline">
              Solicitar cadastro
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={aoEnviar} className="space-y-4">
        {erro && (
          <div className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-bg px-3.5 py-3 text-sm text-danger">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <div>
          <label htmlFor="matricula" className="label-field">
            Matricula
          </label>
          <input
            id="matricula"
            className="input-field font-mono"
            autoComplete="username"
            autoFocus
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="senha" className="label-field">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            className="input-field"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={carregando} className="btn-primary w-full">
          {carregando && <Spinner tamanho={16} />}
          Entrar
        </button>
      </form>
    </AuthLayout>
  )
}
