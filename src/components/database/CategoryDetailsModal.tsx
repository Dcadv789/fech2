import React from 'react';
import { X } from 'lucide-react';
import { Category } from '../../types/category';

interface CategoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
}

const CategoryDetailsModal: React.FC<CategoryDetailsModalProps> = ({ isOpen, onClose, category }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white">Detalhes da Categoria</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">Código</label>
            <p className="text-white">{category.codigo}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">Nome</label>
            <p className="text-white">{category.nome}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">Tipo</label>
            <p className="text-white">{category.tipo}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">Grupo</label>
            <p className="text-white">{(category.grupo as any)?.nome}</p>
          </div>

          {category.descricao && (
            <div>
              <label className="block text-sm font-medium text-gray-400">Descrição</label>
              <p className="text-white">{category.descricao}</p>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailsModal;