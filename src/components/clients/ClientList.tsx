import React from 'react';
import { Pencil, Trash2, Power } from 'lucide-react';
import { Client } from '../../types/client';
import { formatCNPJ } from '../../utils/formatters';

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onToggleActive: (client: Client) => void;
}

const ClientList: React.FC<ClientListProps> = ({ 
  clients,
  onEdit,
  onDelete,
  onToggleActive
}) => {
  if (clients.length === 0) {
    return (
      <div className="text-center py-8 bg-dark-800/50 rounded-lg border border-dark-700">
        <p className="text-gray-400">Nenhum cliente encontrado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-dark-750">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">#</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Código</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Razão Social</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Nome Fantasia</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">CNPJ</th>
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-400">Ações</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, index) => (
            <tr key={client.id} className="border-t border-dark-700 hover:bg-dark-700/30">
              <td className="px-4 py-2 text-sm text-gray-300">{index + 1}</td>
              <td className="px-4 py-2 text-sm text-gray-300">{client.codigo}</td>
              <td className="px-4 py-2 text-sm text-white">{client.razao_social}</td>
              <td className="px-4 py-2 text-sm text-gray-300">{client.nome_fantasia || '-'}</td>
              <td className="px-4 py-2 text-sm text-gray-300">{formatCNPJ(client.cnpj)}</td>
              <td className="px-4 py-2">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(client)}
                    className="p-1.5 text-primary-400 hover:text-primary-300 hover:bg-dark-700 rounded transition-colors"
                    title="Editar cliente"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onToggleActive(client)}
                    className={`p-1.5 ${
                      client.ativo
                        ? 'text-green-400 hover:text-green-300'
                        : 'text-red-400 hover:text-red-300'
                    } hover:bg-dark-700 rounded transition-colors`}
                    title={client.ativo ? 'Desativar cliente' : 'Ativar cliente'}
                  >
                    <Power size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(client.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-dark-700 rounded transition-colors"
                    title="Excluir cliente"
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

export default ClientList;