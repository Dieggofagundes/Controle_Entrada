export type Funcao = 'CMD_DA_GUARDA' | 'GUARDA' | 'PATRULHEIRO' | 'MOTORISTA' | 'CMD_DE_VTR'

export type Perfil = 'ADMIN' | 'USUARIO'

export type StatusUsuario = 'PENDENTE' | 'ATIVO' | 'INATIVO' | 'REJEITADO'

export const FUNCAO_LABEL: Record<Funcao, string> = {
  CMD_DA_GUARDA: 'Cmd da Guarda',
  GUARDA: 'Guarda',
  PATRULHEIRO: 'Patrulheiro',
  MOTORISTA: 'Motorista',
  CMD_DE_VTR: 'Cmd de VTR',
}

export const STATUS_LABEL: Record<StatusUsuario, string> = {
  PENDENTE: 'Pendente',
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
  REJEITADO: 'Rejeitado',
}

export interface Usuario {
  id: string
  matricula: string
  nomeCompleto: string
  nomeGuerra: string
  email: string | null
  funcao: Funcao
  perfil: Perfil
  status: StatusUsuario
  criadoEm: string
}

export interface LoginResponse {
  token: string
  expiraEmSegundos: number
  usuario: Usuario
}

export interface Plantao {
  id: string
  usuario: Usuario
  funcao: Funcao
  horaAssuncao: string
  horaConclusao: string | null
  concluidoPor: Usuario | null
  aberto: boolean
}

export interface RegistroVisitante {
  id: string
  nomeVisitante: string
  endereco: string | null
  telefone: string | null
  cpf: string
  localVisita: string
  numeroCracha: string | null
  horaEntrada: string
  horaSaida: string | null
  registradoPor: Usuario
  saidaRegistradaPor: Usuario | null
  aberto: boolean
}

export interface PaginaResposta<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export interface RelatorioResumo {
  totalVisitas: number
  visitasEmAberto: number
  totalPlantoes: number
  plantoesEmAberto: number
  totalUsuariosAtivos: number
  usuariosPendentesAprovacao: number
}

export interface ErroResposta {
  timestamp: string
  status: number
  erro: string
  mensagem: string
  campos?: Record<string, string>
}
