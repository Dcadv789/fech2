import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import CategoryModal from './CategoryModal';
import CategoryGroupModal from './CategoryGroupModal';
import CategoryList from './CategoryList';
import CategoryDetailsModal from './CategoryDetailsModal';
import CategoryCompaniesModal from './CategoryCompaniesModal';
import BulkLinkModal from './BulkLinkModal';
import { Category } from '../../types/category';
import { categoryService } from '../../services/categoryService';

const Categories: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'receita' | 'despesa'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCompaniesModalOpen, setIsCompaniesModalOpen] = useState(false);
  const [isBulkLinkModalOpen, setIsBulkLinkModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, selectedFilter, activeFilter, searchTerm]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = categories;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(category => 
        category.tipo.toLowerCase() === (selectedFilter === 'receita' ? 'Receita' : 'Despesa').toLowerCase()
      );
    }

    if (activeFilter !== 'all') {
      filtered = filtered.filter(category => 
        activeFilter === 'active' ? category.ativo : !category.ativo
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(category =>
        category.nome.toLowerCase().includes(term) ||
        category.codigo.toLowerCase().includes(term) ||
        (category.descricao && category.descricao.toLowerCase().includes(term))
      );
    }

    setFilteredCategories(filtered);
  };

  const handleSaveCategory = () => {
    setIsCategoryModalOpen(false);
    loadCategories();
  };

  const handleSaveGroup = () => {
    setIsGroupModalOpen(false);
    loadCategories();
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      await categoryService.deleteCategory(id);
      await loadCategories();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este grupo? Todas as categorias associadas também serão excluídas.')) return;

    try {
      await categoryService.deleteGroup(id);
      await loadCategories();
    } catch (error) {
      console.error('Erro ao excluir grupo:', error);
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      await categoryService.toggleCategoryActive(category.id, !category.ativo);
      await loadCategories();
    } catch (error) {
      console.error('Erro ao alterar status da categoria:', error);
    }
  };

  const handleViewDetails = (category: Category) => {
    setSelectedCategory(category);
    setIsDetailsModalOpen(true);
  };

  const handleManageCompanies = (category: Category) => {
    setSelectedCategory(category);
    setIsCompaniesModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Categorias</h2>
          <p className="text-gray-400">Gerencie as categorias e grupos para classificação de lançamentos financeiros.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Categoria
          </button>
          <button 
            onClick={() => setIsGroupModalOpen(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Grupo
          </button>
          <button 
            onClick={() => setIsBulkLinkModalOpen(true)}
            className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 hover:text-white transition-colors"
          >
            Vincular em Massa
          </button>
        </div>
      </div>
      
      <div className="bg-dark-900/95 backdrop-blur-sm rounded-xl border border-dark-800 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative md:w-1/2">
            <input
              type="text"
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedFilter('receita')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedFilter === 'receita'
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => setSelectedFilter('despesa')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedFilter === 'despesa'
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
              }`}
            >
              Despesas
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeFilter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeFilter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => setActiveFilter('inactive')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeFilter === 'inactive'
                  ? 'bg-red-600 text-white'
                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
              }`}
            >
              Inativos
            </button>
          </div>
        </div>
      </div>

      <div className="bg-dark-900/95 backdrop-blur-sm rounded-xl border border-dark-800 p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Carregando categorias...</p>
          </div>
        ) : (
          <CategoryList
            categories={filteredCategories}
            onEdit={handleEdit}
            onDelete={handleDeleteCategory}
            onDeleteGroup={handleDeleteGroup}
            onViewDetails={handleViewDetails}
            onManageCompanies={handleManageCompanies}
            onToggleActive={handleToggleActive}
          />
        )}
      </div>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        onSave={handleSaveCategory}
        category={selectedCategory}
      />

      <CategoryGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSave={handleSaveGroup}
      />

      {selectedCategory && (
        <>
          <CategoryDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            category={selectedCategory}
          />
          <CategoryCompaniesModal
            isOpen={isCompaniesModalOpen}
            onClose={() => setIsCompaniesModalOpen(false)}
            category={selectedCategory}
          />
        </>
      )}

      <BulkLinkModal
        isOpen={isBulkLinkModalOpen}
        onClose={() => setIsBulkLinkModalOpen(false)}
        categories={categories}
      />
    </div>
  );
};

export default Categories;