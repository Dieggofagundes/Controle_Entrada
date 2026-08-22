import { CalendarClock, Download, ShieldAlert, UserCheck, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { extrairMensagemErro } from '../../api/client'
import { plantoesApi } from '../../api/plantoes'
import { registrosApi } from '../../api/registros'
import { relatoriosApi } from '../../api/relatorios'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Spinner } from '../../components/ui/Spinner'
import { StatusPill } from '../../components/ui/StatusPill'
import { useToast } from '../../context/ToastContext'
import { formatarCpf, formatarDataHora } from '../../utils/formatadores'
import { FUNCAO_LABEL, type Plantao, type RegistroVisitante, type RelatorioResumo } from '../../types'

export default function AdminRelatorios() {
  const { notificar } = useToast()

  const [resumo, setResumo] = useState<RelatorioResumo | null>(null)
  const [registros, setRegistros] = useState<RegistroVisitante[]>([])
  const [plantoes, setPlantoes] = useState<Plantao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [exportando, setExportando] = useState(false)

  const [filtroNome, setFiltroNome] = useState('')
  const [filtroCpf, setFiltroCpf] = useState('')
  const [filtroInicio, setFiltroInicio] = useState('')
  const [filtroFim, setFiltroFim] = useState('')

  useEffect(() => {
    carregarResumo()
    buscarRegistros()
    buscarPlantoes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function carregarResumo() {
    try {
      setResumo(await relatoriosApi.resumo())
    } catch (e) {
      notificar(extrairMensagemErro(e), 'erro')
    }
  }

  async function buscarRegistros() {
    setCarregando(true)
    try {
      const pagina = await registrosApi.buscarAdmin({
        nome: filtroNome || undefined,
        cpf: filtroCpf || undefined,
        inicio: filtroInicio ? `${filtroInicio}:00` : undefined,
        fim: filtroFim ? `${filtroFim}:00` : undefined,
        tamanho: 100,
      })
      setRegistros(pagina.content)
    } catch (e) {
      notificar(extrairMensagemErro(e), 'erro')
    } finally {
      setCarregando(false)
    }
  }

  async function buscarPlantoes() {
    try {
      const pagina = await plantoesApi.buscar({
        inicio: filtroInicio ? `${filtroInicio}:00` : undefined,
        fim: filtroFim ? `${filtroFim}:00` : undefined,
        tamanho: 50,
      })
      setPlantoes(pagina.content)
    } catch (e) {
      notificar(extrairMensagemErro(e), 'erro')
    }
  }

  async function exportar() {
    setExportando(true)
    try {
      await relatoriosApi.exportarVisitantesCsv(
        filtroInicio ? `${filtroInicio}:00` : undefined,
        filtroFim ? `${filtroFim}:00` : undefined,
      )
    } catch (e) {
      notificar(extrairMensagemErro(e, 'Nao foi possivel exportar o relatorio.'), 'erro')
    } finally {
      setExportando(false)
    }
  }

  return (
    <div>
      <PageHeader
        titulo="Relatorios"
        subtitulo="Visao geral do sistema e exportacao de dados de visitantes."
        acoes={
          <button onClick={exportar} disabled={exportando} className="btn-primary">
            {exportando ? <Spinner tamanho={16} /> : <Download size={16} />}
            Exportar CSV
          </button>
        }
      />

      {resumo && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <CartaoResumo icone={Users} titulo="Visitas totais" valor={resumo.totalVisitas} />
          <CartaoResumo icone={ShieldAlert} titulo="Visitas em aberto" valor={resumo.visitasEmAberto} destaque="warning" />
          <CartaoResumo icone={CalendarClock} titulo="Plantoes em aberto" valor={resumo.plantoesEmAberto} destaque="warning" />
          <CartaoResumo icone={UserCheck} titulo="Cadastros pendentes" valor={resumo.usuariosPendentesAprovacao} destaque="warning" />
        </div>
      )}

      <div className="card mb-5 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label className="label-field">Nome do visitante</label>
            <input className="input-field" value={filtroNome} onChange={(e) => setFiltroNome(e.target.value)} />
          </div>
          <div>
            <label className="label-field">CPF</label>
            <input
              className="input-field font-mono"
              value={filtroCpf}
              onChange={(e) => setFiltroCpf(formatarCpf(e.target.value))}
            />
          </div>
          <div>
            <label className="label-field">De</label>
            <input type="datetime-local" className="input-field" value={filtroInicio} onChange={(e) => setFiltroInicio(e.target.value)} />
          </div>
          <div>
            <label className="label-field">Ate</label>
            <input type="datetime-local" className="input-field" value={filtroFim} onChange={(e) => setFiltroFim(e.target.value)} />
          </div>
        </div>
        <button
          onClick={() => {
            buscarRegistros()
            buscarPlantoes()
          }}
          className="btn-secondary mt-3"
        >
          Aplicar filtros
        </button>
      </div>

      {carregando ? (
        <div className="flex justify-center py-16 text-ink-muted">
          <Spinner tamanho={26} />
        </div>
      ) : registros.length === 0 ? (
        <EmptyState titulo="Nenhum registro encontrado para os filtros aplicados" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-border bg-bg text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Visitante</th>
                <th className="px-4 py-3 font-semibold">CPF</th>
                <th className="px-4 py-3 font-semibold">Local</th>
                <th className="px-4 py-3 font-semibold">Entrada</th>
                <th className="px-4 py-3 font-semibold">Saida</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {registros.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium">{r.nomeVisitante}</td>
                  <td className="px-4 py-3 font-mono text-ink-muted">{formatarCpf(r.cpf)}</td>
                  <td className="px-4 py-3 text-ink-muted">{r.localVisita}</td>
                  <td className="px-4 py-3 text-ink-muted">{formatarDataHora(r.horaEntrada)}</td>
                  <td className="px-4 py-3 text-ink-muted">{formatarDataHora(r.horaSaida)}</td>
                  <td className="px-4 py-3">
                    <StatusPill aberto={r.aberto} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mb-3 mt-8 font-display text-sm font-bold uppercase tracking-wide text-navy">
        Historico de plantoes
      </h2>

      {plantoes.length === 0 ? (
        <EmptyState titulo="Nenhum plantao encontrado para os filtros aplicados" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-border bg-bg text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Policial</th>
                <th className="px-4 py-3 font-semibold">Funcao</th>
                <th className="px-4 py-3 font-semibold">Assuncao</th>
                <th className="px-4 py-3 font-semibold">Conclusao</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {plantoes.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">{p.usuario.nomeGuerra}</td>
                  <td className="px-4 py-3 text-ink-muted">{FUNCAO_LABEL[p.funcao]}</td>
                  <td className="px-4 py-3 text-ink-muted">{formatarDataHora(p.horaAssuncao)}</td>
                  <td className="px-4 py-3 text-ink-muted">{formatarDataHora(p.horaConclusao)}</td>
                  <td className="px-4 py-3">
                    <StatusPill aberto={p.aberto} textoAberto="Em servico" textoFechado="Concluido" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function CartaoResumo({
  icone: Icone,
  titulo,
  valor,
  destaque,
}: {
  icone: typeof Users
  titulo: string
  valor: number
  destaque?: 'warning'
}) {
  return (
    <div className="card p-4">
      <div className={`mb-2 inline-flex rounded-lg p-2 ${destaque === 'warning' ? 'bg-warning-bg text-warning' : 'bg-teal/10 text-teal'}`}>
        <Icone size={18} />
      </div>
      <p className="font-display text-2xl font-bold text-navy">{valor}</p>
      <p className="text-xs text-ink-muted">{titulo}</p>
    </div>
  )
}
