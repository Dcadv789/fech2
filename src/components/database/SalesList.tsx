import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

interface SalesListProps {
  sales: any[];
  onEdit: (sale: any) => void;
  onDelete: (id: string) => void;
}

const SalesList: React.FC<SalesListProps> = ({
  sales,
  onEdit,
  onDelete
}) => {
  if (sales.length === 0) {
    return (
      <div className="text-center py-8 bg-dark-800/50 rounded-lg border border-dark-700">
        <p className="text-gray-400">Nenhuma venda encontrada</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-dark-750">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Data</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Cliente</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Vendedor</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">SDR</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Serviço</th>
            <th className="px-4 py-2 text-center text-sm font-medium text-gray-400">Origem</th>
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-400">Valor</th>
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-400">Ações</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id} className="border-t border-dark-700 hover:bg-dark-700/30">
              <td className="px-4 py-2 text-sm text-gray-300">
                {new Date(sale.data_venda).toLocaleDateString('pt-BR')}
              </td>
              <td className="px-4 py-2 text-sm text-white">
                {sale.cliente?.razao_social || sale.nome_cliente}
              </td>
              <td className="px-4 py-2 text-sm text-gray-300">
                {sale.vendedor?.nome || '-'}
              </td>
              <td className="px-4 py-2 text-sm text-gray-300">
                {sale.sdr?.nome || '-'}
              </td>
              <td className="px-4 py-2 text-sm text-gray-300">
                {sale.servico?.nome}
              </td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  sale.origem === 'Brasil'
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-blue-500/10 text-blue-500'
                }`}>
                  {sale.origem}
                </span>
              </td>
              <td className="px-4 py-2 text-sm text-right text-white">
                {formatCurrency(sale.valor)}
              </td>
              <td className="px-4 py-2">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(sale)}
                    className="p-1.5 text-primary-400 hover:text-primary-300 hover:bg-dark-700 rounded transition-colors"
                    title="Editar venda"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(sale.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-dark-700 rounded transition-colors"
                    title="Excluir venda"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesList;