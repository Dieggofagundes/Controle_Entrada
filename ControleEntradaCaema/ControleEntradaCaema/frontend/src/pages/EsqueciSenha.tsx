import { CheckCircle2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../api/auth'
import { extrairMensagemErro } from '../api/client'
import { AuthLayout } from '../components/AuthLayout'
import { Spinner } from '../components/ui/Spinner'

export default function EsqueciSenha() {
  const [matricula, setMatricula] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setCarregando(true)

    try {
      await authApi.esqueciSenha(matricula.trim())
      setEnviado(true)
    } catch (e) {
      setErro(extrairMensagemErro(e))
    } finally {
      setCarregando(false)
    }
  }

  if (enviado) {
    return (
      <AuthLayout titulo="Verifique seu e-mail" subtitulo="Enviamos as instrucoes de redefinicao, se aplicavel.">
        <div className="rounded-card border border-success/20 bg-success-bg p-5 text-sm text-success">
          <CheckCircle2 className="mb-2" size={22} />
          <p className="font-medium">
            Se a matricula <strong>{matricula}</strong> existir e tiver um e-mail cadastrado, um link de
            redefinicao de senha foi enviado.
          </p>
          <p className="mt-2 text-success/80">
            Nao tem e-mail cadastrado ou nao recebeu nada? Fale com o administrador do sistema para redefinir sua
            senha manualmente.
          </p>
        </div>
        <Link to="/login" className="mt-6 inline-block font-medium text-teal hover:underline">
          Voltar para o login
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      titulo="Esqueci minha senha"
      subtitulo="Informe sua matricula. Se houver um e-mail cadastrado, enviaremos um link de redefinicao."
      rodape={
        <Link to="/login" className="font-medium text-teal hover:underline">
          Voltar para o login
        </Link>
      }
    >
      <form onSubmit={aoEnviar} className="space-y-4">
        {erro && <div className="rounded-lg border border-danger/20 bg-danger-bg px-3.5 py-3 text-sm text-danger">{erro}</div>}

        <div>
          <label htmlFor="matricula" className="label-field">
            Matricula
          </label>
          <input
            id="matricula"
            className="input-field font-mono"
            autoFocus
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={carregando} className="btn-primary w-full">
          {carregando && <Spinner tamanho={16} />}
          Enviar link de redefinicao
        </button>
      </form>
    </AuthLayout>
  )
}
