import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="bg-dark-900 rounded-2xl shadow-lg border border-dark-900">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Dashboard</h1>
        <p className="text-dark-300">
          Bem-vindo ao painel administrativo. Esta é a página inicial onde serão exibidos os principais
          indicadores e informações relevantes para sua tomada de decisão.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-dark-800 p-4 rounded-xl shadow-md border border-dark-800">
              <h3 className="text-lg font-medium text-white mb-2">Indicador {item}</h3>
              <p className="text-dark-400">Informações do indicador serão exibidas aqui.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;