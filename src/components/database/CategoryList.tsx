import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Trash2, Building2, Eye, Power } from 'lucide-react';
import { Category, CategoryGroup } from '../../types/category';

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onDeleteGroup: (id: string) => void;
  onViewDetails: (category: Category) => void;
  onManageCompanies: (category: Category) => void;
  onToggleActive: (category: Category) => void;
}

interface GroupedCategories {
  [key: string]: {
    group: CategoryGroup;
    categories: Category[];
  };
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onEdit,
  onDelete,
  onDeleteGroup,
  onViewDetails,
  onManageCompanies,
  onToggleActive
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 bg-dark-800/50 rounded-lg border border-dark-700">
        <p className="text-gray-400">Nenhuma categoria encontrada</p>
      </div>
    );
  }

  const groupedCategories = categories.reduce<GroupedCategories>((acc, category) => {
    const groupId = category.grupo_id;
    if (!acc[groupId]) {
      acc[groupId] = {
        group: category.grupo as CategoryGroup,
        categories: []
      };
    }
    acc[groupId].categories.push(category);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(groupedCategories).map(([groupId, { group, categories }]) => (
        <div key={groupId} className="bg-dark-800/50 rounded-lg border border-dark-700">
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-dark-700/50"
               onClick={() => toggleGroup(groupId)}>
            <div className="flex items-center gap-2">
              {expandedGroups.has(groupId) ? (
                <ChevronDown size={20} className="text-gray-400" />
              ) : (
                <ChevronRight size={20} className="text-gray-400" />
              )}
              <h3 className="text-white font-medium">{group.nome}</h3>
              <span className="text-sm text-gray-400">({categories.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit({ ...group, id: groupId } as any);
                }}
                className="p-2 text-primary-400 hover:text-primary-300 hover:bg-dark-700 rounded transition-colors"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteGroup(groupId);
                }}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-dark-700 rounded transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {expandedGroups.has(groupId) && (
            <div className="border-t border-dark-700">
              <table className="w-full">
                <thead className="bg-dark-750">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Código</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Nome</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Tipo</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-400">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-t border-dark-700 hover:bg-dark-700/30">
                      <td className="px-4 py-2 text-sm text-gray-300">{category.codigo}</td>
                      <td className="px-4 py-2 text-sm text-white">{category.nome}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          category.tipo === 'Receita'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {category.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          category.ativo
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {category.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onViewDetails(category)}
                            className="p-1.5 text-primary-400 hover:text-primary-300 hover:bg-dark-700 rounded transition-colors"
                            title="Visualizar detalhes"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => onManageCompanies(category)}
                            className="p-1.5 text-primary-400 hover:text-primary-300 hover:bg-dark-700 rounded transition-colors"
                            title="Gerenciar empresas"
                          >
                            <Building2 size={16} />
                          </button>
                          <button
                            onClick={() => onToggleActive(category)}
                            className={`p-1.5 ${
                              category.ativo
                                ? 'text-green-400 hover:text-green-300'
                                : 'text-red-400 hover:text-red-300'
                            } hover:bg-dark-700 rounded transition-colors`}
                            title={category.ativo ? 'Desativar categoria' : 'Ativar categoria'}
                          >
                            <Power size={16} />
                          </button>
                          <button
                            onClick={() => onEdit(category)}
                            className="p-1.5 text-primary-400 hover:text-primary-300 hover:bg-dark-700 rounded transition-colors"
                            title="Editar categoria"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => onDelete(category.id)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-dark-700 rounded transition-colors"
                            title="Excluir categoria"
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
          )}
        </div>
      ))}
    </div>
  );
};

export default CategoryList;