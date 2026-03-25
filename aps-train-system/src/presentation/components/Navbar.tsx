import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Navbar(): React.ReactElement {
  const location = useLocation();

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-[#141B4D] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold">
              Metro Madrid
            </div>
            <div className="h-6 w-px bg-white/30" />
            <div className="text-sm text-white/80">
              Sistema APS de Fabricación de Trenes
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className={`px-4 py-2 rounded transition ${
                isActive('/')
                  ? 'bg-white text-[#141B4D] font-semibold'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              📊 Dashboard
            </Link>

            <Link
              to="/config"
              className={`px-4 py-2 rounded transition ${
                isActive('/config')
                  ? 'bg-white text-[#141B4D] font-semibold'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              ⚙️ Configuración
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
