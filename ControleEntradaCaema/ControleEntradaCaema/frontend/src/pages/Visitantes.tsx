import { LogOut, Plus, Search, UserPlus } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { extrairMensagemErro } from '../api/client'
import { registrosApi, type NovoRegistroPayload } from '../api/registros'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { Spinner } from '../components/ui/Spinner'
import { StatusPill } from '../components/ui/StatusPill'
import { useToast } from '../context/ToastContext'
import { formatarCpf, formatarDataHora, formatarTelefone } from '../utils/formatadores'
import type { RegistroVisitante } from '../types'

function agoraDatetimeLocal(): string {
  const agora = new Date()
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset())
  return agora.toISOString().slice(0, 16)
}

export default function Visitantes() {
  const { notificar } = useToast()

  const [registros, setRegistros] = useState<RegistroVisitante[]>([])
  const [carregando, setCarregando] = useState(true)
  const [apenasAbertos, setApenasAbertos] = useState(true)
  const [busca, setBusca] = useState('')

  const [modalNovoAberto, setModalNovoAberto] = useState(false)
  const [registroParaSaida, setRegistroParaSaida] = useState<RegistroVisitante | null>(null)

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apenasAbertos])

  async function carregar() {
    setCarregando(true)
    try {
      const pagina = await registrosApi.buscar({ apenasAbertos, tamanho: 100 })
      setRegistros(pagina.content)
    } catch (e) {
      notificar(extrairMensagemErro(e), 'erro')
    } finally {
      setCarregando(false)
    }
  }

  const registrosFiltrados = registros.filter((r) => {
    if (!busca.trim()) return true
    const termo = busca.trim().toLowerCase()
    return (
      r.nomeVisitante.toLowerCase().includes(termo) ||
      r.cpf.includes(termo.replace(/\D/g, '')) ||
      r.localVisita.toLowerCase().includes(termo)
    )
  })

  return (
    <div>
      <PageHeader
        titulo="Controle de visitantes"
        subtitulo="Registre a entrada de pessoas e conclua a saida quando aplicavel."
        acoes={
          <button onClick={() => setModalNovoAberto(true)} className="btn-primary">
            <Plus size={16} />
            Registrar entrada
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            className="input-field pl-9"
            placeholder="Buscar por nome, CPF ou local..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="flex gap-1 rounded-lg border border-border bg-white p-1 text-sm">
          <button
            onClick={() => setApenasAbertos(true)}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              apenasAbertos ? 'bg-navy text-white' : 'text-ink-muted hover:bg-bg'
            }`}
          >
            Em aberto
          </button>
          <button
            onClick={() => setApenasAbertos(false)}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              !apenasAbertos ? 'bg-navy text-white' : 'text-ink-muted hover:bg-bg'
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {carregando ? (
        <div className="flex justify-center py-16 text-ink-muted">
          <Spinner tamanho={26} />
        </div>
      ) : registrosFiltrados.length === 0 ? (
        <EmptyState
          titulo={apenasAbertos ? 'Nenhum visitante em aberto' : 'Nenhum registro encontrado'}
          descricao="Registre uma nova entrada usando o botao acima."
        />
      ) : (
        <div className="space-y-3">
          {registrosFiltrados.map((registro) => (
            <div key={registro.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-ink">{registro.nomeVisitante}</p>
                  <StatusPill aberto={registro.aberto} />
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  CPF <span className="font-mono">{formatarCpf(registro.cpf)}</span> &middot; {registro.localVisita}
                  {registro.numeroCracha && (
                    <>
                      {' '}
                      &middot; Cracha <span className="font-mono">{registro.numeroCracha}</span>
                    </>
                  )}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-muted">
                  <span>
                    Entrada: <strong className="text-ink">{formatarDataHora(registro.horaEntrada)}</strong> por{' '}
                    {registro.registradoPor.nomeGuerra}
                  </span>
                  {!registro.aberto && (
                    <span>
                      Saida: <strong className="text-ink">{formatarDataHora(registro.horaSaida)}</strong> por{' '}
                      {registro.saidaRegistradaPor?.nomeGuerra}
                    </span>
                  )}
                </div>
              </div>

              {registro.aberto && (
                <button onClick={() => setRegistroParaSaida(registro)} className="btn-secondary shrink-0">
                  <LogOut size={16} />
                  Registrar saida
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <NovoRegistroModal
        aberto={modalNovoAberto}
        onFechar={() => setModalNovoAberto(false)}
        onSucesso={() => {
          setModalNovoAberto(false)
          carregar()
        }}
      />

      <RegistrarSaidaModal
        registro={registroParaSaida}
        onFechar={() => setRegistroParaSaida(null)}
        onSucesso={() => {
          setRegistroParaSaida(null)
          carregar()
        }}
      />
    </div>
  )
}

function NovoRegistroModal({
  aberto,
  onFechar,
  onSucesso,
}: {
  aberto: boolean
  onFechar: () => void
  onSucesso: () => void
}) {
  const { notificar } = useToast()
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState<NovoRegistroPayload>({
    nomeVisitante: '',
    endereco: '',
    telefone: '',
    cpf: '',
    localVisita: '',
    numeroCracha: '',
  })

  useEffect(() => {
    if (aberto) {
      setForm({ nomeVisitante: '', endereco: '', telefone: '', cpf: '', localVisita: '', numeroCracha: '' })
    }
  }, [aberto])

  function atualizarCampo<K extends keyof NovoRegistroPayload>(campo: K, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    setSalvando(true)
    try {
      await registrosApi.registrarEntrada(form)
      notificar('Entrada registrada com sucesso.')
      onSucesso()
    } catch (e) {
      notificar(extrairMensagemErro(e, 'Nao foi possivel registrar a entrada.'), 'erro')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal aberto={aberto} titulo="Registrar entrada de visitante" onFechar={onFechar}>
      <form onSubmit={aoEnviar} className="space-y-4">
        <div>
          <label className="label-field">Nome do visitante</label>
          <input
            className="input-field"
            autoFocus
            value={form.nomeVisitante}
            onChange={(e) => atualizarCampo('nomeVisitante', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">CPF</label>
            <input
              className="input-field font-mono"
              value={form.cpf}
              onChange={(e) => atualizarCampo('cpf', formatarCpf(e.target.value))}
              placeholder="000.000.000-00"
              required
            />
          </div>
          <div>
            <label className="label-field">Telefone</label>
            <input
              className="input-field font-mono"
              value={form.telefone}
              onChange={(e) => atualizarCampo('telefone', formatarTelefone(e.target.value))}
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        <div>
          <label className="label-field">Endereco</label>
          <input className="input-field" value={form.endereco} onChange={(e) => atualizarCampo('endereco', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Local da visita</label>
            <input
              className="input-field"
              value={form.localVisita}
              onChange={(e) => atualizarCampo('localVisita', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label-field">Numero do cracha</label>
            <input
              className="input-field font-mono"
              value={form.numeroCracha}
              onChange={(e) => atualizarCampo('numeroCracha', e.target.value)}
            />
          </div>
        </div>

        <button type="submit" disabled={salvando} className="btn-primary w-full">
          {salvando ? <Spinner tamanho={16} /> : <UserPlus size={16} />}
          Registrar entrada
        </button>
      </form>
    </Modal>
  )
}

function RegistrarSaidaModal({
  registro,
  onFechar,
  onSucesso,
}: {
  registro: RegistroVisitante | null
  onFechar: () => void
  onSucesso: () => void
}) {
  const { notificar } = useToast()
  const [salvando, setSalvando] = useState(false)
  const [horaSaida, setHoraSaida] = useState(agoraDatetimeLocal())

  useEffect(() => {
    if (registro) setHoraSaida(agoraDatetimeLocal())
  }, [registro])

  async function confirmar() {
    if (!registro) return
    setSalvando(true)
    try {
      await registrosApi.registrarSaida(registro.id, `${horaSaida}:00`)
      notificar('Saida registrada com sucesso.')
      onSucesso()
    } catch (e) {
      notificar(extrairMensagemErro(e, 'Nao foi possivel registrar a saida.'), 'erro')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal aberto={!!registro} titulo="Registrar saida" onFechar={onFechar}>
      {registro && (
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">
            Confirmar a saida de <strong className="text-ink">{registro.nomeVisitante}</strong>, que entrou em{' '}
            {formatarDataHora(registro.horaEntrada)} (registrado por {registro.registradoPor.nomeGuerra}).
          </p>

          <p className="rounded-lg bg-bg px-3 py-2 text-xs text-ink-muted">
            Se voce esta finalizando a saida de um visitante que entrou durante o turno de outro policial, isso e
            normal e sera registrado com o seu nome como responsavel pela saida.
          </p>

          <div>
            <label className="label-field">Hora de saida</label>
            <input
              type="datetime-local"
              className="input-field"
              value={horaSaida}
              onChange={(e) => setHoraSaida(e.target.value)}
            />
          </div>

          <button onClick={confirmar} disabled={salvando} className="btn-primary w-full">
            {salvando ? <Spinner tamanho={16} /> : <LogOut size={16} />}
            Confirmar saida
          </button>
        </div>
      )}
    </Modal>
  )
}
