import { Clock } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'

export default function SolicitacaoEnviada() {
  const location = useLocation()
  const matricula = (location.state as { matricula?: string } | null)?.matricula

  return (
    <AuthLayout titulo="Solicitacao enviada" subtitulo="Aguarde a aprovacao de um administrador.">
      <div className="rounded-card border border-warning/20 bg-warning-bg p-5 text-sm text-warning">
        <Clock className="mb-2" size={22} />
        <p className="font-medium">
          Sua solicitacao de cadastro {matricula && <>(matricula <strong>{matricula}</strong>)</>} foi recebida.
        </p>
        <p className="mt-2 text-warning/80">
          Assim que um administrador aprovar seu acesso, voce podera entrar normalmente com a matricula e senha
          cadastradas.
        </p>
      </div>

      <Link to="/login" className="mt-6 inline-block font-medium text-teal hover:underline">
        Voltar para o login
      </Link>
    </AuthLayout>
  )
}
