import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function createClickBurst(x, y) {
  const burst = document.createElement('div');
  burst.className = 'click-burst';
  burst.style.left = `${x}px`;
  burst.style.top = `${y}px`;

  const ring = document.createElement('div');
  ring.className = 'click-burst-ring';
  burst.appendChild(ring);

  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    particle.className = 'click-burst-particle';
    const angle = (i / 8) * Math.PI * 2;
    const distance = 30 + Math.random() * 20;
    particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
    burst.appendChild(particle);
  }

  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 600);
}

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleClick(e) {
      const interactive = e.target.closest('button, a, select, input, textarea, label');
      if (!interactive) return;
      createClickBurst(e.clientX, e.clientY);
    }

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="storm-bg min-h-screen overflow-x-hidden">
      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={closeMenu}
        />
      )}

      <header className="storm-mobile-header fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-4 py-3 lg:hidden">
        <button
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(prev => !prev)}
          className="glow-btn flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
        <div className="flex items-center gap-2">
          <div className="logo-glow flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white">
            B
          </div>
          <span className="bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-lg font-bold text-transparent">
            Watchlist
          </span>
        </div>
        <div className="w-11" aria-hidden="true" />
      </header>

      <Sidebar open={menuOpen} onNavigate={closeMenu} />

      <main className="relative z-10 min-h-screen px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(4.75rem+env(safe-area-inset-top))] sm:px-6 sm:pb-10 lg:ml-64 lg:px-10 lg:py-10 lg:pt-10">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
