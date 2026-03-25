import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar, Dashboard, ConfigurationPage } from './presentation/components';

function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        {/* Cabecera con Metro Madrid Branding */}
        <header className="bg-gradient-to-r from-[#141B4D] to-[#1a2359] text-white py-6 px-8 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                <div className="text-[#141B4D] font-bold text-2xl">M</div>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Metro de Madrid</h1>
                <p className="text-sm text-blue-100 mt-1">
                  Sistema Avanzado de Planificación
                </p>
                <p className="text-xs text-blue-200">
                  Área de Mantenimiento de Material Móvil
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">Sistema APS v2.0</div>
              <div className="text-xs text-blue-200">Arquitectura Hexagonal</div>
            </div>
          </div>
        </header>

        {/* Navbar */}
        <Navbar />

        {/* Rutas */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/config" element={<ConfigurationPage />} />
        </Routes>

        {/* Pie de Página */}
        <footer className="bg-gradient-to-r from-[#141B4D] to-[#1a2359] text-white text-center py-4 mt-8">
          <div className="container mx-auto">
            <p className="text-sm font-semibold">
              Metro de Madrid - Sistema APS de Mantenimiento v2.0
            </p>
            <p className="text-xs text-blue-200 mt-1">
              Arquitectura Hexagonal | Planificación Avanzada con Prioridad EDD
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
