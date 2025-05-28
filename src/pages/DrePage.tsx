import React from 'react';

const DrePage: React.FC = () => {
  return (
    <div className="p-6 bg-dark-800 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-white mb-4">DRE</h1>
      <p className="text-gray-300 mb-6">
        Demonstração do Resultado do Exercício (DRE) com informações financeiras detalhadas da sua empresa.
      </p>
      <div className="bg-dark-700 p-5 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Relatório Financeiro</h2>
          <div className="flex space-x-2">
            <select className="bg-dark-800 text-white border border-dark-600 rounded-md px-3 py-1 text-sm">
              <option>2025</option>
              <option>2024</option>
              <option>2023</option>
            </select>
            <select className="bg-dark-800 text-white border border-dark-600 rounded-md px-3 py-1 text-sm">
              <option>Anual</option>
              <option>Trimestral</option>
              <option>Mensal</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-600">
            <thead className="bg-dark-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Descrição
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Valor (R$)
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  %
                </th>
              </tr>
            </thead>
            <tbody className="bg-dark-800 divide-y divide-dark-700">
              {['Receita Bruta', 'Deduções', 'Receita Líquida', 'Custos', 'Lucro Bruto', 'Despesas Operacionais', 'Resultado Operacional', 'Resultado Financeiro', 'Lucro Antes do IR', 'IR e CSLL', 'Lucro Líquido'].map((item) => (
                <tr key={item} className="hover:bg-dark-750">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{item}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-white">0,00</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-400">0%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DrePage;