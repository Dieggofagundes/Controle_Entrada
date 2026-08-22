import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { extrairMensagemErro } from '../api/client'
import { AuthLayout } from '../components/AuthLayout'
import { Spinner } from '../components/ui/Spinner'
import { FUNCAO_LABEL, type Funcao } from '../types'

const FUNCOES = Object.keys(FUNCAO_LABEL) as Funcao[]

export default function CadastrarUsuario() {
  const navigate = useNavigate()

  const [matricula, setMatricula] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [nomeCompleto, setNomeCompleto] = useState('')
  const [nomeGuerra, setNomeGuerra] = useState('')
  const [email, setEmail] = useState('')
  const [funcao, setFuncao] = useState<Funcao>('GUARDA')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)

    if (senha !== confirmacao) {
      setErro('As senhas informadas nao conferem.')
      return
    }

    setCarregando(true)
    try {
      await authApi.solicitarCadastro({
        matricula: matricula.trim(),
        senha,
        nomeCompleto: nomeCompleto.trim(),
        nomeGuerra: nomeGuerra.trim(),
        email: email.trim() || undefined,
        funcao,
      })
      navigate('/solicitacao-enviada', { replace: true, state: { matricula } })
    } catch (e) {
      setErro(extrairMensagemErro(e, 'Nao foi possivel enviar sua solicitacao.'))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <AuthLayout
      titulo="Solicitar cadastro"
      subtitulo="Preencha seus dados. Um administrador vai analisar e liberar seu acesso."
      rodape={
        <p className="text-center text-ink-muted">
          Ja tem cadastro?{' '}
          <Link to="/login" className="font-semibold text-teal hover:underline">
            Entrar
          </Link>
        </p>
      }
    >
      <form onSubmit={aoEnviar} className="space-y-4">
        {erro && <div className="rounded-lg border border-danger/20 bg-danger-bg px-3.5 py-3 text-sm text-danger">{erro}</div>}

        <div>
          <label htmlFor="nomeCompleto" className="label-field">
            Nome completo
          </label>
          <input
            id="nomeCompleto"
            className="input-field"
            autoFocus
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="nomeGuerra" className="label-field">
            Nome de guerra
          </label>
          <input
            id="nomeGuerra"
            className="input-field"
            value={nomeGuerra}
            onChange={(e) => setNomeGuerra(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="matricula" className="label-field">
              Matricula
            </label>
            <input
              id="matricula"
              className="input-field font-mono"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="funcao" className="label-field">
              Funcao pretendida
            </label>
            <select
              id="funcao"
              className="input-field"
              value={funcao}
              onChange={(e) => setFuncao(e.target.value as Funcao)}
            >
              {FUNCOES.map((f) => (
                <option key={f} value={f}>
                  {FUNCAO_LABEL[f]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="email" className="label-field">
            E-mail <span className="font-normal text-ink-faint">(opcional, para recuperar a senha)</span>
          </label>
          <input
            id="email"
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="senha" className="label-field">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              className="input-field"
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmacao" className="label-field">
              Confirmar senha
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
        </div>

        <button type="submit" disabled={carregando} className="btn-primary w-full">
          {carregando && <Spinner tamanho={16} />}
          Enviar solicitacao
        </button>
      </form>
    </AuthLayout>
  )
}
