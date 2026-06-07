import { useEffect } from 'react';
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

function Layout() {
  useEffect(() => {
    function handleClick(e) {
      const interactive = e.target.closest('button, a, select, input, textarea, label');
      if (!interactive) return;
      createClickBurst(e.clientX, e.clientY);
    }

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="storm-bg min-h-screen">
      <Sidebar />
      <main className="relative z-10 ml-64 min-h-screen p-10">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
