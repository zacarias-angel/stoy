import { NavLink, Outlet } from 'react-router-dom';
import { ChatIcon, MapPinIcon, UserIcon } from './icons';

const navItems = [
  { to: '/', label: 'Mapa', Icon: MapPinIcon, end: true },
  { to: '/chats', label: 'Chats', Icon: ChatIcon, end: false },
  { to: '/perfil', label: 'Mi perfil', Icon: UserIcon, end: false },
];

export function AppShell() {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-stone-50">
      <header className="z-20 shrink-0 border-b border-stone-200 bg-stone-50/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <span className="text-base font-bold tracking-tight text-brand-800">En 5 Estoy</span>
          <span className="hidden text-xs text-stone-500 sm:block">
            Hay gente cerca que sabe hacer lo que necesitas.
          </span>
        </div>
      </header>

      <main className="relative flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <nav
        aria-label="Navegacion principal"
        className="z-20 shrink-0 border-t border-stone-200 bg-white"
      >
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {navItems.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'flex flex-1 flex-col items-center gap-1 px-2 py-2.5 text-xs font-medium transition-colors',
                  isActive ? 'text-brand-700' : 'text-stone-500 hover:text-stone-700',
                ].join(' ')
              }
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
