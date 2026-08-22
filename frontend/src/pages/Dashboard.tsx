import { CalendarClock, LogIn, LogOut, UserRound, Users as UsersIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { plantoesApi } from '../api/plantoes'
import { registrosApi } from '../api/registros'
import { extrairMensagemErro } from '../api/client'
import { PageHeader } from '../components/ui/PageHeader'
import { Spinner } from '../components/ui/Spinner'
import { StatusPill } from '../components/ui/StatusPill'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { datetimeLocalParaIso, formatarDataHora } from '../utils/formatadores'
import { FUNCAO_LABEL, type Funcao, type Plantao, type RegistroVisitante } from '../types'

const FUNCOES = Object.keys(FUNCAO_LABEL) as Funcao[]

function agoraDatetimeLocal(): string {
  const agora = new Date()
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset())
  return agora.toISOString().slice(0, 16)
}

export default function Dashboard() {
  const { usuario } = useAuth()
  const { notificar } = useToast()

  const [plantao, setPlantao] = useState<Plantao | null>(null)
  const [carregandoPlantao, setCarregandoPlantao] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [funcaoSelecionada, setFuncaoSelecionada] = useState<Funcao>(usuario?.funcao ?? 'GUARDA')
  const [horaAssuncao, setHoraAssuncao] = useState(agoraDatetimeLocal())
  const [horaConclusao, setHoraConclusao] = useState(agoraDatetimeLocal())

  const [visitasAbertas, setVisitasAbertas] = useState<RegistroVisitante[]>([])
  const [carregandoVisitas, setCarregandoVisitas] = useState(true)

  useEffect(() => {
    carregarPlantao()
    carregarVisitasAbertas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function carregarPlantao() {
    setCarregandoPlantao(true)
    try {
      const atual = await plantoesApi.atual()
      setPlantao(atual)
      if (atual) setHoraConclusao(agoraDatetimeLocal())
    } catch (e) {
      notificar(extrairMensagemErro(e), 'erro')
    } finally {
      setCarregandoPlantao(false)
    }
  }

  async function carregarVisitasAbertas() {
    setCarregandoVisitas(true)
    try {
      setVisitasAbertas(await registrosApi.listarAbertos())
    } catch (e) {
      notificar(extrairMensagemErro(e), 'erro')
    } finally {
      setCarregandoVisitas(false)
    }
  }

  async function abrirPlantao() {
    setSalvando(true)
    try {
      const novo = await plantoesApi.abrir(funcaoSelecionada, datetimeLocalParaIso(horaAssuncao))
      setPlantao(novo)
      notificar('Plantao iniciado com sucesso.')
    } catch (e) {
      notificar(extrairMensagemErro(e, 'Nao foi possivel iniciar o plantao.'), 'erro')
    } finally {
      setSalvando(false)
    }
  }

  async function concluirPlantao() {
    if (!plantao) return
    setSalvando(true)
    try {
      const atualizado = await plantoesApi.concluir(plantao.id, datetimeLocalParaIso(horaConclusao))
      setPlantao(atualizado)
      notificar('Plantao concluido com sucesso.')
    } catch (e) {
      notificar(extrairMensagemErro(e, 'Nao foi possivel concluir o plantao.'), 'erro')
    } finally {
      setSalvando(false)
    }
  }

  if (!usuario) return null

  return (
    <div>
      <PageHeader titulo={`Ola, ${usuario.nomeGuerra}`} subtitulo="Confira seus dados e controle o seu plantao de servico." />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Dados do policial */}
        <div className="card p-5 lg:col-span-1">
          <div className="flex items-center gap-2 text-navy">
            <UserRound size={18} />
            <h2 className="font-display text-sm font-bold uppercase tracking-wide">Policial</h2>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-ink-muted">Nome</dt>
              <dd className="font-medium">{usuario.nomeCompleto}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Nome de guerra</dt>
              <dd className="font-medium">{usuario.nomeGuerra}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Matricula</dt>
              <dd className="font-mono font-medium">{usuario.matricula}</dd>
            </div>
          </dl>
        </div>

        {/* Plantao */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-navy">
              <CalendarClock size={18} />
              <h2 className="font-display text-sm font-bold uppercase tracking-wide">Plantao de servico</h2>
            </div>
            {plantao && <StatusPill aberto={plantao.aberto} textoAberto="Em servico" textoFechado="Concluido" />}
          </div>

          {carregandoPlantao ? (
            <div className="flex justify-center py-10 text-ink-muted">
              <Spinner />
            </div>
          ) : plantao ? (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-ink-muted">Funcao</p>
                  <p className="font-medium">{FUNCAO_LABEL[plantao.funcao]}</p>
                </div>
                <div>
                  <p className="text-ink-muted">Assuncao do servico</p>
                  <p className="font-medium">{formatarDataHora(plantao.horaAssuncao)}</p>
                </div>
                {!plantao.aberto && (
                  <div>
                    <p className="text-ink-muted">Conclusao do servico</p>
                    <p className="font-medium">{formatarDataHora(plantao.horaConclusao)}</p>
                  </div>
                )}
              </div>

              {plantao.aberto && (
                <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label htmlFor="horaConclusao" className="label-field">
                      Hora de conclusao do servico
                    </label>
                    <input
                      id="horaConclusao"
                      type="datetime-local"
                      className="input-field"
                      value={horaConclusao}
                      onChange={(e) => setHoraConclusao(e.target.value)}
                    />
                  </div>
                  <button onClick={concluirPlantao} disabled={salvando} className="btn-secondary">
                    {salvando ? <Spinner tamanho={16} /> : <LogOut size={16} />}
                    Concluir servico
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-ink-muted">
                Voce nao tem nenhum plantao em aberto no momento. Informe a funcao e o horario de assuncao para
                iniciar.
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="funcao" className="label-field">
                    Funcao
                  </label>
                  <select
                    id="funcao"
                    className="input-field"
                    value={funcaoSelecionada}
                    onChange={(e) => setFuncaoSelecionada(e.target.value as Funcao)}
                  >
                    {FUNCOES.map((f) => (
                      <option key={f} value={f}>
                        {FUNCAO_LABEL[f]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="horaAssuncao" className="label-field">
                    Hora de assuncao do servico
                  </label>
                  <input
                    id="horaAssuncao"
                    type="datetime-local"
                    className="input-field"
                    value={horaAssuncao}
                    onChange={(e) => setHoraAssuncao(e.target.value)}
                  />
                </div>
              </div>

              <button onClick={abrirPlantao} disabled={salvando} className="btn-primary">
                {salvando ? <Spinner tamanho={16} /> : <LogIn size={16} />}
                Iniciar plantao
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Visitas em aberto */}
      <div className="card mt-5 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-navy">
            <UsersIcon size={18} />
            <h2 className="font-display text-sm font-bold uppercase tracking-wide">Visitantes no local agora</h2>
          </div>
          <Link to="/visitantes" className="text-sm font-semibold text-teal hover:underline">
            Ver todos
          </Link>
        </div>

        {carregandoVisitas ? (
          <div className="flex justify-center py-8 text-ink-muted">
            <Spinner />
          </div>
        ) : visitasAbertas.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">Nenhum visitante em aberto no momento.</p>
        ) : (
          <div className="mt-4 divide-y divide-border">
            {visitasAbertas.slice(0, 5).map((visita) => (
              <div key={visita.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{visita.nomeVisitante}</p>
                  <p className="truncate text-xs text-ink-muted">
                    {visita.localVisita} &middot; entrada {formatarDataHora(visita.horaEntrada)}
                  </p>
                </div>
                <StatusPill aberto />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
