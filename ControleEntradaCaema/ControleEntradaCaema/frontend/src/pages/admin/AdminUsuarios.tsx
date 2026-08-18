import { Check, KeyRound, Pencil, Plus, Trash2, UserX, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { extrairMensagemErro } from '../../api/client'
import { usuariosApi, type AtualizarUsuarioPayload, type CriarUsuarioPayload } from '../../api/usuarios'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { Spinner } from '../../components/ui/Spinner'
import { StatusBadgeUsuario } from '../../components/ui/StatusBadgeUsuario'
import { EmptyState } from '../../components/ui/EmptyState'
import { useToast } from '../../context/ToastContext'
import { FUNCAO_LABEL, type Funcao, type Perfil, type StatusUsuario, type Usuario } from '../../types'

const FUNCOES = Object.keys(FUNCAO_LABEL) as Funcao[]

export default function AdminUsuarios() {
  const { notificar } = useToast()

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [modalCriarAberto, setModalCriarAberto] = useState(false)
  const [usuarioParaEditar, setUsuarioParaEditar] = useState<Usuario | null>(null)
  const [usuarioParaSenha, setUsuarioParaSenha] = useState<Usuario | null>(null)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    try {
      setUsuarios(await usuariosApi.listarTodos())
    } catch (e) {
      notificar(extrairMensagemErro(e), 'erro')
    } finally {
      setCarregando(false)
    }
  }

  const pendentes = usuarios.filter((u) => u.status === 'PENDENTE')
  const demais = usuarios.filter((u) => u.status !== 'PENDENTE')

  async function aprovar(usuario: Usuario, funcao: Funcao, perfil: Perfil) {
    try {
      await usuariosApi.aprovar(usuario.id, funcao, perfil)
      notificar(`${usuario.nomeGuerra} aprovado(a) com sucesso.`)
      carregar()
    } catch (e) {
      notificar(extrairMensagemErro(e), 'erro')
    }
  }

  async function rejeitar(usuario: Usuario) {
    if (!confirm(`Rejeitar a solicitacao de ${usuario.nomeCompleto}?`)) return
    try {
      await usuariosApi.rejeitar(usuario.id)
      notificar('Solicitacao rejeitada.')
      carregar()
    } catch (e) {
      notificar(extrairMensagemErro(e), 'erro')
    }
  }

  async function alternarStatus(usuario: Usuario) {
    const novoStatus: StatusUsuario = usuario.status === 'ATIVO' ? 'INATIVO' : 'ATIVO'
    try {
      await usuariosApi.alterarStatus(usuario.id, novoStatus)
      notificar(`${usuario.nomeGuerra} agora esta ${novoStatus === 'ATIVO' ? 'ativo' : 'inativo'}.`)
      carregar()
    } catch (e) {
      notificar(extrairMensagemErro(e), 'erro')
    }
  }

  async function excluir(usuario: Usuario) {
    if (!confirm(`Excluir definitivamente o usuario ${usuario.nomeCompleto}? Esta acao nao pode ser desfeita.`)) return
    try {
      await usuariosApi.excluir(usuario.id)
      notificar('Usuario excluido.')
      carregar()
    } catch (e) {
      notificar(extrairMensagemErro(e), 'erro')
    }
  }

  return (
    <div>
      <PageHeader
        titulo="Usuarios do sistema"
        subtitulo="Aprove solicitacoes de cadastro e gerencie os acessos."
        acoes={
          <button onClick={() => setModalCriarAberto(true)} className="btn-primary">
            <Plus size={16} />
            Novo usuario
          </button>
        }
      />

      {carregando ? (
        <div className="flex justify-center py-16 text-ink-muted">
          <Spinner tamanho={26} />
        </div>
      ) : (
        <div className="space-y-8">
          {pendentes.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-warning">
                Solicitacoes pendentes ({pendentes.length})
              </h2>
              <div className="space-y-3">
                {pendentes.map((usuario) => (
                  <CartaoPendente key={usuario.id} usuario={usuario} onAprovar={aprovar} onRejeitar={rejeitar} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-navy">
              Usuarios cadastrados
            </h2>

            {demais.length === 0 ? (
              <EmptyState titulo="Nenhum usuario cadastrado ainda" />
            ) : (
              <div className="card divide-y divide-border">
                {demais.map((usuario) => (
                  <div key={usuario.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{usuario.nomeCompleto}</p>
                        <StatusBadgeUsuario status={usuario.status} />
                      </div>
                      <p className="mt-0.5 text-sm text-ink-muted">
                        {usuario.nomeGuerra} &middot; <span className="font-mono">{usuario.matricula}</span> &middot;{' '}
                        {FUNCAO_LABEL[usuario.funcao]} &middot; {usuario.perfil === 'ADMIN' ? 'Administrador' : 'Usuario'}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        onClick={() => setUsuarioParaEditar(usuario)}
                        className="btn-secondary !px-3 !py-2"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setUsuarioParaSenha(usuario)}
                        className="btn-secondary !px-3 !py-2"
                        title="Resetar senha"
                      >
                        <KeyRound size={15} />
                      </button>
                      <button
                        onClick={() => alternarStatus(usuario)}
                        className="btn-secondary !px-3 !py-2"
                        title={usuario.status === 'ATIVO' ? 'Inativar' : 'Ativar'}
                      >
                        <UserX size={15} />
                      </button>
                      <button onClick={() => excluir(usuario)} className="btn-danger !px-3 !py-2" title="Excluir">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <ModalCriarUsuario aberto={modalCriarAberto} onFechar={() => setModalCriarAberto(false)} onSucesso={() => {
        setModalCriarAberto(false)
        carregar()
      }} />

      <ModalEditarUsuario usuario={usuarioParaEditar} onFechar={() => setUsuarioParaEditar(null)} onSucesso={() => {
        setUsuarioParaEditar(null)
        carregar()
      }} />

      <ModalResetarSenha usuario={usuarioParaSenha} onFechar={() => setUsuarioParaSenha(null)} onSucesso={() => setUsuarioParaSenha(null)} />
    </div>
  )
}

function CartaoPendente({
  usuario,
  onAprovar,
  onRejeitar,
}: {
  usuario: Usuario
  onAprovar: (usuario: Usuario, funcao: Funcao, perfil: Perfil) => void
  onRejeitar: (usuario: Usuario) => void
}) {
  const [funcao, setFuncao] = useState<Funcao>(usuario.funcao)
  const [perfil, setPerfil] = useState<Perfil>('USUARIO')

  return (
    <div className="card flex flex-col gap-3 border-warning/30 bg-warning-bg/40 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold">{usuario.nomeCompleto}</p>
        <p className="text-sm text-ink-muted">
          {usuario.nomeGuerra} &middot; matricula <span className="font-mono">{usuario.matricula}</span>
          {usuario.email && <> &middot; {usuario.email}</>}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select className="input-field !w-auto text-sm" value={funcao} onChange={(e) => setFuncao(e.target.value as Funcao)}>
          {FUNCOES.map((f) => (
            <option key={f} value={f}>
              {FUNCAO_LABEL[f]}
            </option>
          ))}
        </select>

        <select className="input-field !w-auto text-sm" value={perfil} onChange={(e) => setPerfil(e.target.value as Perfil)}>
          <option value="USUARIO">Usuario</option>
          <option value="ADMIN">Administrador</option>
        </select>

        <button onClick={() => onAprovar(usuario, funcao, perfil)} className="btn-primary !px-3 !py-2" title="Aprovar">
          <Check size={15} />
        </button>
        <button onClick={() => onRejeitar(usuario)} className="btn-danger !px-3 !py-2" title="Rejeitar">
          <X size={15} />
        </button>
      </div>
    </div>
  )
}

function ModalCriarUsuario({ aberto, onFechar, onSucesso }: { aberto: boolean; onFechar: () => void; onSucesso: () => void }) {
  const { notificar } = useToast()
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState<CriarUsuarioPayload>({
    matricula: '',
    senha: '',
    nomeCompleto: '',
    nomeGuerra: '',
    email: '',
    funcao: 'GUARDA',
    perfil: 'USUARIO',
  })

  useEffect(() => {
    if (aberto) {
      setForm({ matricula: '', senha: '', nomeCompleto: '', nomeGuerra: '', email: '', funcao: 'GUARDA', perfil: 'USUARIO' })
    }
  }, [aberto])

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    setSalvando(true)
    try {
      await usuariosApi.criar(form)
      notificar('Usuario criado com sucesso.')
      onSucesso()
    } catch (e) {
      notificar(extrairMensagemErro(e, 'Nao foi possivel criar o usuario.'), 'erro')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal aberto={aberto} titulo="Novo usuario" onFechar={onFechar}>
      <form onSubmit={aoEnviar} className="space-y-4">
        <div>
          <label className="label-field">Nome completo</label>
          <input
            className="input-field"
            autoFocus
            value={form.nomeCompleto}
            onChange={(e) => setForm({ ...form, nomeCompleto: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label-field">Nome de guerra</label>
          <input
            className="input-field"
            value={form.nomeGuerra}
            onChange={(e) => setForm({ ...form, nomeGuerra: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Matricula</label>
            <input
              className="input-field font-mono"
              value={form.matricula}
              onChange={(e) => setForm({ ...form, matricula: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label-field">Senha inicial</label>
            <input
              type="password"
              className="input-field"
              minLength={6}
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Funcao</label>
            <select className="input-field" value={form.funcao} onChange={(e) => setForm({ ...form, funcao: e.target.value as Funcao })}>
              {FUNCOES.map((f) => (
                <option key={f} value={f}>
                  {FUNCAO_LABEL[f]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-field">Perfil</label>
            <select className="input-field" value={form.perfil} onChange={(e) => setForm({ ...form, perfil: e.target.value as Perfil })}>
              <option value="USUARIO">Usuario</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label-field">E-mail (opcional)</label>
          <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>

        <button type="submit" disabled={salvando} className="btn-primary w-full">
          {salvando && <Spinner tamanho={16} />}
          Criar usuario
        </button>
      </form>
    </Modal>
  )
}

function ModalEditarUsuario({
  usuario,
  onFechar,
  onSucesso,
}: {
  usuario: Usuario | null
  onFechar: () => void
  onSucesso: () => void
}) {
  const { notificar } = useToast()
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState<AtualizarUsuarioPayload | null>(null)

  useEffect(() => {
    if (usuario) {
      setForm({
        nomeCompleto: usuario.nomeCompleto,
        nomeGuerra: usuario.nomeGuerra,
        email: usuario.email ?? '',
        funcao: usuario.funcao,
        perfil: usuario.perfil,
        status: usuario.status,
      })
    }
  }, [usuario])

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    if (!usuario || !form) return
    setSalvando(true)
    try {
      await usuariosApi.atualizar(usuario.id, form)
      notificar('Usuario atualizado com sucesso.')
      onSucesso()
    } catch (e) {
      notificar(extrairMensagemErro(e, 'Nao foi possivel atualizar o usuario.'), 'erro')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal aberto={!!usuario} titulo="Editar usuario" onFechar={onFechar}>
      {form && (
        <form onSubmit={aoEnviar} className="space-y-4">
          <div>
            <label className="label-field">Nome completo</label>
            <input className="input-field" value={form.nomeCompleto} onChange={(e) => setForm({ ...form, nomeCompleto: e.target.value })} required />
          </div>
          <div>
            <label className="label-field">Nome de guerra</label>
            <input className="input-field" value={form.nomeGuerra} onChange={(e) => setForm({ ...form, nomeGuerra: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">Funcao</label>
              <select className="input-field" value={form.funcao} onChange={(e) => setForm({ ...form, funcao: e.target.value as Funcao })}>
                {FUNCOES.map((f) => (
                  <option key={f} value={f}>
                    {FUNCAO_LABEL[f]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">Perfil</label>
              <select className="input-field" value={form.perfil} onChange={(e) => setForm({ ...form, perfil: e.target.value as Perfil })}>
                <option value="USUARIO">Usuario</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label-field">Status</label>
            <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Usuario['status'] })}>
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
              <option value="PENDENTE">Pendente</option>
              <option value="REJEITADO">Rejeitado</option>
            </select>
          </div>
          <div>
            <label className="label-field">E-mail</label>
            <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          <button type="submit" disabled={salvando} className="btn-primary w-full">
            {salvando && <Spinner tamanho={16} />}
            Salvar alteracoes
          </button>
        </form>
      )}
    </Modal>
  )
}

function ModalResetarSenha({ usuario, onFechar, onSucesso }: { usuario: Usuario | null; onFechar: () => void; onSucesso: () => void }) {
  const { notificar } = useToast()
  const [novaSenha, setNovaSenha] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    setNovaSenha('')
  }, [usuario])

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault()
    if (!usuario) return
    setSalvando(true)
    try {
      await usuariosApi.resetarSenha(usuario.id, novaSenha)
      notificar(`Senha de ${usuario.nomeGuerra} redefinida com sucesso.`)
      onSucesso()
    } catch (e) {
      notificar(extrairMensagemErro(e), 'erro')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal aberto={!!usuario} titulo="Resetar senha" onFechar={onFechar}>
      {usuario && (
        <form onSubmit={aoEnviar} className="space-y-4">
          <p className="text-sm text-ink-muted">
            Defina uma nova senha para <strong className="text-ink">{usuario.nomeCompleto}</strong>. Informe a nova senha a
            ele(a) por um canal seguro.
          </p>
          <div>
            <label className="label-field">Nova senha</label>
            <input
              type="password"
              className="input-field"
              minLength={6}
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              autoFocus
              required
            />
          </div>
          <button type="submit" disabled={salvando} className="btn-primary w-full">
            {salvando && <Spinner tamanho={16} />}
            Redefinir senha
          </button>
        </form>
      )}
    </Modal>
  )
}
