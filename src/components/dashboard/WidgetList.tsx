import React from 'react';
import { Pencil, Trash2, Power } from 'lucide-react';

interface Widget {
  id: string;
  ordem: number;
  nome_exibicao: string;
  tipo_visualizacao: 'card' | 'lista' | 'grafico';
  tipo_grafico?: 'bar' | 'line' | 'pie';
  ativo: boolean;
}

interface WidgetListProps {
  widgets: Widget[];
  onEdit: (widget: Widget) => void;
  onDelete: (id: string) => void;
  onToggleActive: (widget: Widget) => void;
}

const WidgetList: React.FC<WidgetListProps> = ({
  widgets,
  onEdit,
  onDelete,
  onToggleActive
}) => {
  if (widgets.length === 0) {
    return (
      <div className="text-center py-8 bg-dark-800/50 rounded-lg border border-dark-700">
        <p className="text-gray-400">Nenhum widget encontrado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-dark-750">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Ordem</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Nome</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Tipo</th>
            {widgets.some(w => w.tipo_visualizacao === 'grafico') && (
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Tipo Gráfico</th>
            )}
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-400">Ações</th>
          </tr>
        </thead>
        <tbody>
          {widgets.map((widget) => (
            <tr key={widget.id} className="border-t border-dark-700 hover:bg-dark-700/30">
              <td className="px-4 py-2 text-sm text-white">{widget.ordem}</td>
              <td className="px-4 py-2 text-sm text-white">{widget.nome_exibicao}</td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  widget.tipo_visualizacao === 'grafico'
                    ? 'bg-blue-500/10 text-blue-500'
                    : widget.tipo_visualizacao === 'card'
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-purple-500/10 text-purple-500'
                }`}>
                  {widget.tipo_visualizacao.charAt(0).toUpperCase() + widget.tipo_visualizacao.slice(1)}
                </span>
              </td>
              {widgets.some(w => w.tipo_visualizacao === 'grafico') && (
                <td className="px-4 py-2">
                  {widget.tipo_visualizacao === 'grafico' && (
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/10 text-yellow-500">
                      {widget.tipo_grafico}
                    </span>
                  )}
                </td>
              )}
              <td className="px-4 py-2">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onToggleActive(widget)}
                    className={`p-1.5 ${
                      widget.ativo
                        ? 'text-green-400 hover:text-green-300'
                        : 'text-red-400 hover:text-red-300'
                    } hover:bg-dark-700 rounded transition-colors`}
                    title={widget.ativo ? 'Desativar widget' : 'Ativar widget'}
                  >
                    <Power size={16} />
                  </button>
                  <button
                    onClick={() => onEdit(widget)}
                    className="p-1.5 text-primary-400 hover:text-primary-300 hover:bg-dark-700 rounded transition-colors"
                    title="Editar widget"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(widget.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-dark-700 rounded transition-colors"
                    title="Excluir widget"
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

export default WidgetList;