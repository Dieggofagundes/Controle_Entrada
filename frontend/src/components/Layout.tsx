import { LayoutDashboard, LogOut, ShieldCheck, UserCog, Users, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FUNCAO_LABEL } from '../types'

interface ItemNav {
  to: string
  rotulo: string
  icone: LucideIcon
  apenasAdmin?: boolean
}

const itensNav: ItemNav[] = [
  { to: '/', rotulo: 'Painel', icone: LayoutDashboard },
  { to: '/visitantes', rotulo: 'Visitantes', icone: Users },
  { to: '/admin/usuarios', rotulo: 'Usuarios', icone: UserCog, apenasAdmin: true },
  { to: '/admin/relatorios', rotulo: 'Relatorios', icone: ShieldCheck, apenasAdmin: true },
]

export function Layout({ children }: { children: ReactNode }) {
  const { usuario, sair } = useAuth()
  const itensVisiveis = itensNav.filter((item) => !item.apenasAdmin || usuario?.perfil === 'ADMIN')

  return (
    <div className="min-h-screen bg-bg lg:flex">
      {/* Sidebar - desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-navy text-white lg:flex">
        <div className="flex items-center gap-2.5 px-6 py-5">
          <ShieldCheck size={26} className="text-teal-light" />
          <div>
            <p className="font-display text-sm font-bold leading-tight">Controle de Entrada</p>
            <p className="text-xs text-white/60">CAEMA</p>
          </div>
        </div>

        <nav className="mt-4 flex-1 space-y-1 px-3">
          {itensVisiveis.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icone size={18} />
              {item.rotulo}
            </NavLink>
          ))}
        </nav>

        {usuario && (
          <div className="border-t border-white/10 px-4 py-4">
            <p className="truncate text-sm font-semibold">{usuario.nomeGuerra}</p>
            <p className="truncate text-xs text-white/60">{FUNCAO_LABEL[usuario.funcao]}</p>
            <button
              onClick={sair}
              className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        )}
      </aside>

      <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[url('/caema-badge.jpg')] bg-center bg-no-repeat opacity-[0.06]"
          style={{ backgroundSize: '480px' }}
        />

        {/* Topbar - mobile */}
        <header className="flex items-center justify-between border-b border-border bg-navy px-4 py-3.5 text-white lg:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck size={22} className="text-teal-light" />
            <span className="font-display text-sm font-bold">Controle de Entrada</span>
          </div>
          <button onClick={sair} aria-label="Sair" className="rounded-lg p-2 text-white/80 hover:bg-white/10">
            <LogOut size={19} />
          </button>
        </header>

        <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-10 lg:py-8 lg:pb-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>

        {/* Navegacao inferior - mobile */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-white/95 backdrop-blur lg:hidden">
          {itensVisiveis.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                  isActive ? 'text-teal' : 'text-ink-muted'
                }`
              }
            >
              <item.icone size={20} />
              {item.rotulo}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
