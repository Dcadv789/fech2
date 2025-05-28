import React from 'react';

const AnalysisPage: React.FC = () => {
  return (
    <div className="p-6 bg-dark-800 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-white mb-4">Análise</h1>
      <p className="text-gray-300 mb-6">
        Ferramentas de análise para explorar seus dados e obter insights valiosos para o seu negócio.
      </p>
      <div className="bg-dark-700 p-5 rounded-lg mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Principais Métricas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-dark-800 p-4 rounded-md">
              <h3 className="text-lg font-medium text-primary-400 mb-2">Métrica {item}</h3>
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-gray-400 text-sm">Descrição breve da métrica.</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-dark-700 p-5 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Análise Detalhada</h2>
        <div className="h-64 flex items-center justify-center bg-dark-800 rounded-md">
          <p className="text-gray-400">Visualização detalhada será exibida aqui.</p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;