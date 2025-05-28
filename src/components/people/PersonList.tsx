import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Person } from '../../types/person';

interface PersonListProps {
  people: Person[];
  onEdit: (person: Person) => void;
  onDelete: (id: string) => void;
}

const PersonList: React.FC<PersonListProps> = ({
  people,
  onEdit,
  onDelete
}) => {
  if (people.length === 0) {
    return (
      <div className="text-center py-8 bg-dark-800/50 rounded-lg border border-dark-700">
        <p className="text-gray-400">Nenhuma pessoa encontrada</p>
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
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Cargo</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Email</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Telefone</th>
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-400">Ações</th>
          </tr>
        </thead>
        <tbody>
          {people.map((person) => (
            <tr key={person.id} className="border-t border-dark-700 hover:bg-dark-700/30">
              <td className="px-4 py-2 text-sm text-gray-300">{person.codigo}</td>
              <td className="px-4 py-2 text-sm text-white">{person.nome}</td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  person.cargo === 'Vendedor'
                    ? 'bg-blue-500/10 text-blue-500'
                    : person.cargo === 'SDR'
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-purple-500/10 text-purple-500'
                }`}>
                  {person.cargo}
                </span>
              </td>
              <td className="px-4 py-2 text-sm text-gray-300">{person.email || '-'}</td>
              <td className="px-4 py-2 text-sm text-gray-300">{person.telefone || '-'}</td>
              <td className="px-4 py-2">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(person)}
                    className="p-1.5 text-primary-400 hover:text-primary-300 hover:bg-dark-700 rounded transition-colors"
                    title="Editar pessoa"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(person.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-dark-700 rounded transition-colors"
                    title="Excluir pessoa"
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

export default PersonList;