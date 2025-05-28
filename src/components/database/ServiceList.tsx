import React from 'react';
import { Pencil, Trash2, Power } from 'lucide-react';
import { Service } from '../../types/service';

interface ServiceListProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
  onToggleActive: (service: Service) => void;
}

const ServiceList: React.FC<ServiceListProps> = ({
  services,
  onEdit,
  onDelete,
  onToggleActive
}) => {
  if (services.length === 0) {
    return (
      <div className="text-center py-8 bg-dark-800/50 rounded-lg border border-dark-700">
        <p className="text-gray-400">Nenhum serviço encontrado</p>
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
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Descrição</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Status</th>
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-400">Ações</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id} className="border-t border-dark-700 hover:bg-dark-700/30">
              <td className="px-4 py-2 text-sm text-gray-300">{service.codigo}</td>
              <td className="px-4 py-2 text-sm text-white">{service.nome}</td>
              <td className="px-4 py-2 text-sm text-gray-300">{service.descricao || '-'}</td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  service.ativo
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-red-500/10 text-red-500'
                }`}>
                  {service.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td className="px-4 py-2">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onToggleActive(service)}
                    className={`p-1.5 ${
                      service.ativo
                        ? 'text-green-400 hover:text-green-300'
                        : 'text-red-400 hover:text-red-300'
                    } hover:bg-dark-700 rounded transition-colors`}
                    title={service.ativo ? 'Desativar serviço' : 'Ativar serviço'}
                  >
                    <Power size={16} />
                  </button>
                  <button
                    onClick={() => onEdit(service)}
                    className="p-1.5 text-primary-400 hover:text-primary-300 hover:bg-dark-700 rounded transition-colors"
                    title="Editar serviço"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(service.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-dark-700 rounded transition-colors"
                    title="Excluir serviço"
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

export default ServiceList;