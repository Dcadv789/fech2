import React from 'react';
import { Pencil, Trash2, Building2, Eye, Power } from 'lucide-react';
import { Indicator } from '../../types/indicator';

interface IndicatorListProps {
  indicators: Indicator[];
  onEdit: (indicator: Indicator) => void;
  onDelete: (id: string) => void;
  onViewDetails: (indicator: Indicator) => void;
  onManageCompanies: (indicator: Indicator) => void;
  onToggleActive: (indicator: Indicator) => void;
}

const IndicatorList: React.FC<IndicatorListProps> = ({
  indicators,
  onEdit,
  onDelete,
  onViewDetails,
  onManageCompanies,
  onToggleActive
}) => {
  if (indicators.length === 0) {
    return (
      <div className="text-center py-8 bg-dark-800/50 rounded-lg border border-dark-700">
        <p className="text-gray-400">Nenhum indicador encontrado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-dark-750">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Código</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Nome</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Estrutura</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Tipo</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Status</th>
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-400">Ações</th>
          </tr>
        </thead>
        <tbody>
          {indicators.map((indicator) => (
            <tr key={indicator.id} className="border-t border-dark-700 hover:bg-dark-700/30">
              <td className="px-4 py-2 text-sm text-gray-300">{indicator.codigo}</td>
              <td className="px-4 py-2 text-sm text-white">{indicator.nome}</td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  indicator.tipo_estrutura === 'Composto'
                    ? 'bg-blue-500/10 text-blue-500'
                    : 'bg-green-500/10 text-green-500'
                }`}>
                  {indicator.tipo_estrutura}
                </span>
              </td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  indicator.tipo_dado === 'Moeda'
                    ? 'bg-yellow-500/10 text-yellow-500'
                    : indicator.tipo_dado === 'Percentual'
                    ? 'bg-purple-500/10 text-purple-500'
                    : 'bg-blue-500/10 text-blue-500'
                }`}>
                  {indicator.tipo_dado}
                </span>
              </td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  indicator.ativo
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-red-500/10 text-red-500'
                }`}>
                  {indicator.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td className="px-4 py-2">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onViewDetails(indicator)}
                    className="p-1.5 text-primary-400 hover:text-primary-300 hover:bg-dark-700 rounded transition-colors"
                    title="Visualizar detalhes"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => onManageCompanies(indicator)}
                    className="p-1.5 text-primary-400 hover:text-primary-300 hover:bg-dark-700 rounded transition-colors"
                    title="Gerenciar empresas"
                  >
                    <Building2 size={16} />
                  </button>
                  <button
                    onClick={() => onToggleActive(indicator)}
                    className={`p-1.5 ${
                      indicator.ativo
                        ? 'text-green-400 hover:text-green-300'
                        : 'text-red-400 hover:text-red-300'
                    } hover:bg-dark-700 rounded transition-colors`}
                    title={indicator.ativo ? 'Desativar indicador' : 'Ativar indicador'}
                  >
                    <Power size={16} />
                  </button>
                  <button
                    onClick={() => onEdit(indicator)}
                    className="p-1.5 text-primary-400 hover:text-primary-300 hover:bg-dark-700 rounded transition-colors"
                    title="Editar indicador"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(indicator.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-dark-700 rounded transition-colors"
                    title="Excluir indicador"
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

export default IndicatorList;