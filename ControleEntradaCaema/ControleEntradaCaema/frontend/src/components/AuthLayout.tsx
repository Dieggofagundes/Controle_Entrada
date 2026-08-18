import { ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'

export function AuthLayout({
  titulo,
  subtitulo,
  children,
  rodape,
}: {
  titulo: string
  subtitulo: string
  children: ReactNode
  rodape?: ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-bg">
      {/* Painel institucional - visivel a partir de telas medias */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-navy px-12 py-12 text-white md:flex">
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full border-[3px] border-white" />
          <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full border-[3px] border-white" />
        </div>

        <div className="relative flex items-center gap-3">
          <ShieldCheck size={30} className="text-teal-light" />
          <span className="font-display text-lg font-bold">Controle de Entrada</span>
        </div>

        <div className="relative max-w-md">
          <p className="font-display text-3xl font-bold leading-tight">
            Registro de acesso e controle de plantao, do posto de guarda ao relatorio final.
          </p>
          <p className="mt-4 text-sm text-white/70">
            Sistema interno da CAEMA para controle de entrada de visitantes e acompanhamento dos plantoes
            de servico.
          </p>
        </div>

        <p className="relative text-xs text-white/50">CAEMA &middot; Uso interno e restrito</p>
      </div>

      {/* Painel do formulario */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-10 md:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 md:hidden">
            <ShieldCheck size={26} className="text-teal" />
            <span className="font-display text-base font-bold text-navy">Controle de Entrada</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-navy">{titulo}</h1>
          <p className="mt-1.5 text-sm text-ink-muted">{subtitulo}</p>

          <div className="mt-8">{children}</div>

          {rodape && <div className="mt-6 text-sm">{rodape}</div>}
        </div>
      </div>
    </div>
  )
}
