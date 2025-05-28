import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Transaction } from '../../types/transaction';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete
}) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 bg-dark-800/50 rounded-lg border border-dark-700">
        <p className="text-gray-400">Nenhum lançamento encontrado</p>
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
            <th className="px-4 py-2 text-center text-sm font-medium text-gray-400">Tipo</th>
            <th className="px-4 py-2 text-center text-sm font-medium text-gray-400">Cliente</th>
            <th className="px-4 py-2 text-center text-sm font-medium text-gray-400">Valor</th>
            <th className="px-4 py-2 text-center text-sm font-medium text-gray-400">Empresa</th>
            <th className="px-4 py-2 text-center text-sm font-medium text-gray-400">Descrição</th>
            <th className="px-4 py-2 text-center text-sm font-medium text-gray-400">Ações</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-t border-dark-700 hover:bg-dark-700/30">
              <td className="px-4 py-2 text-sm text-left text-gray-300">
                {`${meses[transaction.mes - 1]}/${transaction.ano}`}
              </td>
              <td className="px-4 py-2 text-center">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  transaction.tipo === 'Receita'
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-red-500/10 text-red-500'
                }`}>
                  {transaction.tipo}
                </span>
              </td>
              <td className="px-4 py-2 text-sm text-center text-gray-300">
                {(transaction as any).cliente?.razao_social || '-'}
              </td>
              <td className="px-4 py-2 text-sm text-center text-white">
                {formatCurrency(transaction.valor)}
              </td>
              <td className="px-4 py-2 text-sm text-center text-gray-300">
                {(transaction.empresa as any).razao_social}
              </td>
              <td className="px-4 py-2 text-sm text-center text-white">{transaction.descricao}</td>
              <td className="px-4 py-2">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="p-1.5 text-primary-400 hover:text-primary-300 hover:bg-dark-700 rounded transition-colors"
                    title="Editar lançamento"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-dark-700 rounded transition-colors"
                    title="Excluir lançamento"
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

export default TransactionList;