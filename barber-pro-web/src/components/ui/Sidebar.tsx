'use client'

import type { LucideIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Scissors, Home } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  getAgendaHref,
  getAdminNavSections,
  barberoNavItems,
  recepcionNavItems,
  clienteNavItems,
  isNavItemActive,
  type NavSection,
} from '@/lib/navigation/dashboard-nav'

interface SidebarProps {
  role?: string
  userId?: string
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: LucideIcon
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 btn-press',
        active
          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
          : 'text-zinc-400 hover:text-white hover:bg-white/5'
      )}
    >
      <Icon size={18} className={cn(active ? 'text-black' : 'text-amber-500/70')} />
      <span className="text-sm">{label}</span>
    </Link>
  )
}

function NavSections({ sections, pathname }: { sections: NavSection[]; pathname: string }) {
  return (
    <>
      {sections.map((section) => (
        <div key={section.title} className="mb-6">
          <p className="px-4 text-[10px] uppercase font-black text-zinc-600 tracking-[0.2em] mb-2">
            {section.title}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) => (
              <NavLink
                key={item.href + item.label}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isNavItemActive(pathname, item.href)}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

export function Sidebar({ role, userId }: SidebarProps) {
  const pathname = usePathname()
  const agendaHref = getAgendaHref(role, userId)

  const areaLabel =
    role === 'cliente'
      ? 'Tu área'
      : role === 'barbero'
        ? 'Mi trabajo'
        : role === 'recepcionista'
          ? 'Recepción'
          : 'Administración'

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-zinc-950 border-r border-white/5 h-screen sticky top-0">
      <div className="p-6 border-b border-white/5">
        <Link
          href={role === 'admin' ? '/admin' : '/'}
          className="flex items-center gap-3 text-amber-500 font-black text-xl tracking-tighter glow-amber"
        >
          <Scissors className="w-7 h-7" />
          <span>BARBER PRO</span>
        </Link>
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-2 ml-1">
          {areaLabel}
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {role === 'admin' && <NavSections sections={getAdminNavSections(agendaHref)} pathname={pathname} />}

        {role === 'recepcionista' && (
          <div className="space-y-0.5">
            {recepcionNavItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href === '/agenda' ? agendaHref : item.href}
                label={item.label}
                icon={item.icon}
                active={isNavItemActive(pathname, item.href === '/agenda' ? agendaHref : item.href)}
              />
            ))}
          </div>
        )}

        {role === 'barbero' && (
          <div className="space-y-0.5">
            {barberoNavItems(agendaHref).map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isNavItemActive(pathname, item.href)}
              />
            ))}
          </div>
        )}

        {role === 'cliente' && (
          <div className="space-y-0.5">
            {clienteNavItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isNavItemActive(pathname, item.href)}
              />
            ))}
          </div>
        )}

        {!role || (role !== 'admin' && role !== 'recepcionista' && role !== 'barbero' && role !== 'cliente') ? (
          <div className="space-y-0.5">
            {recepcionNavItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isNavItemActive(pathname, item.href)}
              />
            ))}
          </div>
        ) : null}

        <div className="pt-6 mt-4 border-t border-white/5">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl font-bold transition-all text-sm"
          >
            <Home size={18} />
            Sitio público
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4">
          <p className="text-xs font-bold text-amber-400 mb-1">
            {role === 'cliente' ? 'Club de lealtad' : 'Atajos'}
          </p>
          <p className="text-[10px] text-zinc-500 leading-relaxed">
            {role === 'cliente'
              ? 'Acumula puntos por cada visita.'
              : role === 'admin'
                ? 'Usa el panel para el resumen; el menú lateral para cada módulo.'
                : 'Agenda y recepción son tu flujo diario.'}
          </p>
        </div>
      </div>
    </aside>
  )
}
