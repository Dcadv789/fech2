import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import { categoryCodeService } from '../../services/categoryCodeService';
import { CreateCategoryDTO, CategoryGroup, Category } from '../../types/category';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  category?: Category | null;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave, category }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [selectedType, setSelectedType] = useState<'Receita' | 'Despesa'>(category?.tipo || 'Receita');
  const [categoryCode, setCategoryCode] = useState<string>(category?.codigo || '');

  useEffect(() => {
    if (isOpen) {
      loadGroups();
      if (!category) {
        generateNextCode();
      }
    }
  }, [isOpen, selectedType]);

  const loadGroups = async () => {
    try {
      const data = await categoryService.getCategoryGroups();
      setGroups(data);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      setError('Erro ao carregar grupos. Tente novamente.');
    }
  };

  const generateNextCode = async () => {
    try {
      const nextCode = await categoryCodeService.getNextCode(selectedType);
      setCategoryCode(nextCode);
    } catch (error) {
      console.error('Erro ao gerar código:', error);
      setError('Erro ao gerar código da categoria. Tente novamente.');
    }
  };

  const handleTypeChange = async (tipo: 'Receita' | 'Despesa') => {
    setSelectedType(tipo);
    if (!category) {
      const nextCode = await categoryCodeService.getNextCode(tipo);
      setCategoryCode(nextCode);
    }
  };

  const validateCode = async (code: string, id?: string): Promise<boolean> => {
    try {
      const { data } = await supabase
        .from('categorias')
        .select('id')
        .eq('codigo', code)
        .single();

      if (data && (!id || data.id !== id)) {
        setError('Já existe uma categoria com este código.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Erro ao validar código:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const code = formData.get('codigo') as string;

      // Validar código
      const isCodeValid = await validateCode(code, category?.id);
      if (!isCodeValid) {
        setIsSubmitting(false);
        return;
      }

      const categoryData: CreateCategoryDTO = {
        codigo: code,
        nome: formData.get('nome') as string,
        descricao: formData.get('descricao') as string || undefined,
        tipo: selectedType,
        grupo_id: formData.get('grupo_id') as string,
        ativo: true
      };

      if (category) {
        await categoryService.updateCategory(category.id, categoryData);
      } else {
        await categoryService.createCategory(categoryData);
      }
      onSave();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      setError('Erro ao salvar categoria. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white">
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Tipo *
            </label>
            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value as 'Receita' | 'Despesa')}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="Receita">Receita</option>
              <option value="Despesa">Despesa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Código *
            </label>
            <input
              type="text"
              name="codigo"
              value={categoryCode}
              onChange={(e) => setCategoryCode(e.target.value)}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nome *
            </label>
            <input
              type="text"
              name="nome"
              defaultValue={category?.nome}
              required
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Grupo *
            </label>
            <select
              name="grupo_id"
              defaultValue={category?.grupo_id}
              required
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="">Selecione um grupo</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Descrição
            </label>
            <textarea
              name="descricao"
              defaultValue={category?.descricao || ''}
              rows={3}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal