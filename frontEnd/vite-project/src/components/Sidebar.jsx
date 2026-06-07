import { NavLink } from 'react-router-dom';

function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

const navItems = [
  { to: '/all-movies', label: 'All Movies', icon: HomeIcon },
  { to: '/add-movie', label: 'Add New Movie', icon: PlusIcon },
  { to: '/search-movies', label: 'Search Movie', icon: SearchIcon },
];

function Sidebar({ open, onNavigate }) {
  return (
    <aside
      className={`storm-sidebar fixed left-0 top-0 z-40 flex h-screen w-[min(100vw,18rem)] flex-col text-white transition-transform duration-300 ease-out lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="hidden items-center gap-3 px-6 py-8 lg:flex">
        <div className="logo-glow flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold text-white">
          B
        </div>
        <span className="bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-xl font-bold text-transparent">
          Watchlist
        </span>
      </div>

      <h2 className="sidebar-exam-title px-6 pb-4 pt-6 text-center text-sm font-bold leading-snug tracking-wide lg:pt-0">
        Ben Probeh&apos;s Exam
      </h2>

      <nav className="flex flex-1 flex-col gap-2 px-4">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `glow-nav flex min-h-[3rem] items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all ${
                isActive
                  ? 'glow-nav-active text-white'
                  : 'text-zinc-500 hover:text-zinc-200'
              }`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>

      <p className="px-6 py-6 text-xs text-zinc-600">Your personal movie tracker</p>
    </aside>
  );
}

export default Sidebar;
