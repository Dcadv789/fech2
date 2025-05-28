import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Category } from '../../types/category';
import { categoryService } from '../../services/categoryService';
import { supabase } from '../../lib/supabase';

interface CategoryCompaniesModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
}

interface Company {
  id: string;
  razao_social: string;
}

const CategoryCompaniesModal: React.FC<CategoryCompaniesModalProps> = ({ isOpen, onClose, category }) => {
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);
  const [linkedCompanies, setLinkedCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, category.id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar todas as empresas
      const { data: allCompanies } = await supabase
        .from('empresas')
        .select('id, razao_social')
        .order('razao_social');

      // Carregar empresas vinculadas
      const linkedData = await categoryService.getCategoryCompanies(category.id);
      const linkedIds = new Set(linkedData.map(link => link.empresa_id));
      
      // Separar empresas disponíveis e vinculadas
      const linked: Company[] = [];
      const available: Company[] = [];
      
      allCompanies?.forEach(company => {
        if (linkedIds.has(company.id)) {
          linked.push(company);
        } else {
          available.push(company);
        }
      });

      setAvailableCompanies(available);
      setLinkedCompanies(linked);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkCompany = (company: Company) => {
    setAvailableCompanies(prev => prev.filter(c => c.id !== company.id));
    setLinkedCompanies(prev => [...prev, company]);
  };

  const handleUnlinkCompany = (company: Company) => {
    setLinkedCompanies(prev => prev.filter(c => c.id !== company.id));
    setAvailableCompanies(prev => [...prev, company]);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Remover todos os vínculos existentes
      const { error: deleteError } = await supabase
        .from('categorias_empresas')
        .delete()
        .eq('categoria_id', category.id);

      if (deleteError) throw deleteError;

      // Criar novos vínculos
      if (linkedCompanies.length > 0) {
        const newLinks = linkedCompanies.map(company => ({
          categoria_id: category.id,
          empresa_id: company.id
        }));

        const { error: insertError } = await supabase
          .from('categorias_empresas')
          .insert(newLinks);

        if (insertError) throw insertError;
      }

      onClose();
    } catch (error) {
      console.error('Erro ao salvar vínculos:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 rounded-xl w-full max-w-4xl">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div>
            <h2 className="text-xl font-bold text-white">Vincular Empresas</h2>
            <p className="text-sm text-gray-400 mt-1">{category.nome}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Carregando...</p>
            </div>
          ) : (
            <div className="flex gap-6">
              {/* Empresas Disponíveis */}
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-400 mb-3">
                  Empresas Disponíveis ({availableCompanies.length})
                </h3>
                <div className="h-[400px] overflow-y-auto border border-dark-700 rounded-lg">
                  {availableCompanies.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Nenhuma empresa disponível
                    </div>
                  ) : (
                    <div className="divide-y divide-dark-700">
                      {availableCompanies.map(company => (
                        <button
                          key={company.id}
                          onClick={() => handleLinkCompany(company)}
                          className="w-full p-3 text-left hover:bg-dark-700 flex items-center justify-between group"
                        >
                          <span className="text-white">{company.razao_social}</span>
                          <ArrowRight size={16} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Empresas Vinculadas */}
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-400 mb-3">
                  Empresas Vinculadas ({linkedCompanies.length})
                </h3>
                <div className="h-[400px] overflow-y-auto border border-dark-700 rounded-lg">
                  {linkedCompanies.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Nenhuma empresa vinculada
                    </div>
                  ) : (
                    <div className="divide-y divide-dark-700">
                      {linkedCompanies.map(company => (
                        <button
                          key={company.id}
                          onClick={() => handleUnlinkCompany(company)}
                          className="w-full p-3 text-left hover:bg-dark-700 flex items-center justify-between group"
                        >
                          <ArrowLeft size={16} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="text-white">{company.razao_social}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-dark-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Salvar Vinculações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCompaniesModal;