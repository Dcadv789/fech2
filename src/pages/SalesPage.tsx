import React from 'react';

const SalesPage: React.FC = () => {
  return (
    <div className="p-6 bg-dark-800 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-white mb-4">Vendas</h1>
      <p className="text-gray-300 mb-6">
        Acompanhe os dados de vendas, relatórios e tendências de performance comercial da sua empresa.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-dark-700 p-5 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Vendas Recentes</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-3 bg-dark-800 rounded-md">
                <p className="text-white">Venda #{item}</p>
                <p className="text-gray-400 text-sm">Detalhes da venda serão exibidos aqui.</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-dark-700 p-5 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Desempenho Mensal</h2>
          <div className="h-48 flex items-center justify-center bg-dark-800 rounded-md">
            <p className="text-gray-400">Gráfico de desempenho será exibido aqui.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;