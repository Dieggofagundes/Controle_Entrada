import { CheckCircle2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { authApi } from '../api/auth'
import { extrairMensagemErro } from '../api/client'
import { AuthLayout } from '../components/AuthLayout'
import { Spinner } from '../components/ui/Spinner'

export default function RedefinirSenha() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)

    if (novaSenha !== confirmacao) {
      setErro('As senhas informadas nao conferem.')
      return
    }

    if (!token) {
      setErro('Link invalido.')
      return
    }

    setCarregando(true)
    try {
      await authApi.redefinirSenha(token, novaSenha)
      setSucesso(true)
      setTimeout(() => navigate('/login', { replace: true }), 2500)
    } catch (e) {
      setErro(extrairMensagemErro(e, 'Este link de redefinicao e invalido ou ja expirou.'))
    } finally {
      setCarregando(false)
    }
  }

  if (sucesso) {
    return (
      <AuthLayout titulo="Senha redefinida" subtitulo="Voce ja pode entrar com sua nova senha.">
        <div className="rounded-card border border-success/20 bg-success-bg p-5 text-sm text-success">
          <CheckCircle2 className="mb-2" size={22} />
          Senha alterada com sucesso. Redirecionando para o login...
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout titulo="Criar nova senha" subtitulo="Escolha uma nova senha de acesso ao sistema.">
      <form onSubmit={aoEnviar} className="space-y-4">
        {erro && (
          <div className="rounded-lg border border-danger/20 bg-danger-bg px-3.5 py-3 text-sm text-danger">
            {erro}{' '}
            <Link to="/esqueci-senha" className="font-semibold underline">
              Solicitar novo link
            </Link>
          </div>
        )}

        <div>
          <label htmlFor="novaSenha" className="label-field">
            Nova senha
          </label>
          <input
            id="novaSenha"
            type="password"
            className="input-field"
            autoFocus
            minLength={6}
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="confirmacao" className="label-field">
            Confirmar nova senha
          </label>
          <input
            id="confirmacao"
            type="password"
            className="input-field"
            minLength={6}
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={carregando} className="btn-primary w-full">
          {carregando && <Spinner tamanho={16} />}
          Redefinir senha
        </button>
      </form>
    </AuthLayout>
  )
}
