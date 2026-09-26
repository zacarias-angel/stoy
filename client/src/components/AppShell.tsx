import { NavLink, Outlet } from 'react-router-dom';
import { ChatIcon, MapPinIcon, UserIcon } from './icons';

const navItems = [
  { to: '/', label: 'Mapa', Icon: MapPinIcon, end: true },
  { to: '/chats', label: 'Chats', Icon: ChatIcon, end: false },
  { to: '/perfil', label: 'Mi perfil', Icon: UserIcon, end: false },
];

export function AppShell() {
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#e8e0d1]">
      <aside className="paper-panel hidden w-64 shrink-0 flex-col border-y-0 border-l-0 bg-[#f8f3e9] md:flex">
        <div className="border-b border-stone-300 px-5 py-5">
          <p className="text-lg font-bold tracking-tight text-brand-800">En 5 Estoy</p>
          <p className="hand-note mt-1 text-base text-stone-600">gente que sabe, cerca tuyo</p>
        </div>
        <nav aria-label="Navegacion principal" className="space-y-2 p-3">
          {navItems.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => ['flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors', isActive ? 'bg-brand-700 text-white shadow-sm' : 'text-stone-700 hover:bg-stone-200'].join(' ')}>
              <Icon />{label}
            </NavLink>
          ))}
        </nav>
        <p className="hand-note mt-auto px-5 pb-5 text-lg text-stone-500">¿Quién tengo cerca?</p>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
      <header className="z-20 shrink-0 border-b border-stone-300 bg-[#f8f3e9]/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between md:px-3">
          <span className="text-base font-bold tracking-tight text-brand-800 md:hidden">En 5 Estoy</span>
          <span className="hand-note hidden text-xl text-stone-600 md:block">Hay gente cerca que sabe hacer lo que necesitás.</span>
          <span className="text-xs font-medium text-stone-500">Tu barrio, tus oficios</span>
        </div>
      </header>

      <main className="relative flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <nav
        aria-label="Navegacion principal"
        className="z-20 shrink-0 border-t border-stone-300 bg-[#f8f3e9] md:hidden"
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
    </div>
  );
}
