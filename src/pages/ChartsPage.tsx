import React from 'react';

const ChartsPage: React.FC = () => {
  return (
    <div className="p-6 bg-dark-800 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-white mb-4">Gráficos</h1>
      <p className="text-gray-300 mb-6">
        Visualizações gráficas dos principais indicadores e métricas da sua empresa.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-700 p-5 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Vendas por Período</h2>
          <div className="h-64 flex items-center justify-center bg-dark-800 rounded-md">
            <p className="text-gray-400">Gráfico de vendas por período será exibido aqui.</p>
          </div>
        </div>
        <div className="bg-dark-700 p-5 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Distribuição de Clientes</h2>
          <div className="h-64 flex items-center justify-center bg-dark-800 rounded-md">
            <p className="text-gray-400">Gráfico de distribuição de clientes será exibido aqui.</p>
          </div>
        </div>
        <div className="bg-dark-700 p-5 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Receitas vs Despesas</h2>
          <div className="h-64 flex items-center justify-center bg-dark-800 rounded-md">
            <p className="text-gray-400">Gráfico de receitas vs despesas será exibido aqui.</p>
          </div>
        </div>
        <div className="bg-dark-700 p-5 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Evolução dos Indicadores</h2>
          <div className="h-64 flex items-center justify-center bg-dark-800 rounded-md">
            <p className="text-gray-400">Gráfico de evolução dos indicadores será exibido aqui.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsPage;