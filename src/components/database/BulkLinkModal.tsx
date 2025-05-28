import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Category } from '../../types/category';
import { categoryService } from '../../services/categoryService';

interface BulkLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

interface Company {
  id: string;
  razao_social: string;
}

const BulkLinkModal: React.FC<BulkLinkModalProps> = ({ isOpen, onClose, categories }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkedCategories, setLinkedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      loadCompanies();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedCompanyId) {
      loadLinkedCategories();
    } else {
      setLinkedCategories(new Set());
      setSelectedCategories(new Set());
    }
  }, [selectedCompanyId]);

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, razao_social')
        .order('razao_social');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      setError('Erro ao carregar empresas. Tente novamente.');
    }
  };

  const loadLinkedCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias_empresas')
        .select('categoria_id')
        .eq('empresa_id', selectedCompanyId);

      if (error) throw error;

      const linkedIds = new Set(data.map(item => item.categoria_id));
      setLinkedCategories(linkedIds);
      setSelectedCategories(linkedIds);
    } catch (error) {
      console.error('Erro ao carregar categorias vinculadas:', error);
      setError('Erro ao carregar categorias vinculadas. Tente novamente.');
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const handleSubmit = async () => {
    if (!selectedCompanyId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Remover vínculos existentes
      const categoriasParaRemover = Array.from(linkedCategories)
        .filter(id => !selectedCategories.has(id));

      // Adicionar novos vínculos
      const categoriasParaAdicionar = Array.from(selectedCategories)
        .filter(id => !linkedCategories.has(id));

      if (categoriasParaRemover.length > 0) {
        await supabase
          .from('categorias_empresas')
          .delete()
          .eq('empresa_id', selectedCompanyId)
          .in('categoria_id', categoriasParaRemover);
      }

      if (categoriasParaAdicionar.length > 0) {
        const novosVinculos = categoriasParaAdicionar.map(categoryId => ({
          categoria_id: categoryId,
          empresa_id: selectedCompanyId
        }));

        await supabase
          .from('categorias_empresas')
          .insert(novosVinculos);
      }

      onClose();
    } catch (error) {
      console.error('Erro ao vincular categorias:', error);
      setError('Erro ao vincular categorias. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white">Vincular Categorias em Massa</h2>
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

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Empresa
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="">Selecione uma empresa</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.razao_social}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Categorias ({selectedCategories.size} selecionadas)
            </label>
            <div className="mt-2 max-h-[400px] overflow-y-auto border border-dark-700 rounded-lg divide-y divide-dark-700">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center p-3 hover:bg-dark-700/50"
                >
                  <label className="flex items-center space-x-3 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      checked={selectedCategories.has(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="w-4 h-4 rounded border-dark-600 text-primary-600 focus:ring-primary-500 bg-dark-700"
                    />
                    <div className="flex-1">
                      <p className="text-white">{category.nome}</p>
                      <p className="text-sm text-gray-400">{category.codigo}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      category.tipo === 'Receita'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {category.tipo}
                    </span>
                  </label>
                </div>
              ))}
            </div>
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
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedCompanyId}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                'Vinculando...'
              ) : (
                <>
                  <Check size={18} className="mr-2" />
                  Vincular Categorias
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkLinkModal