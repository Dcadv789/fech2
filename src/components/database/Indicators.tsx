import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import IndicatorModal from './IndicatorModal';
import IndicatorList from './IndicatorList';
import IndicatorDetailsModal from './IndicatorDetailsModal';
import IndicatorCompaniesModal from './IndicatorCompaniesModal';
import BulkLinkIndicatorModal from './BulkLinkIndicatorModal';
import { Indicator } from '../../types/indicator';
import { indicatorService } from '../../services/indicatorService';

const Indicators: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'composto' | 'unico'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCompaniesModalOpen, setIsCompaniesModalOpen] = useState(false);
  const [isBulkLinkModalOpen, setIsBulkLinkModalOpen] = useState(false);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [filteredIndicators, setFilteredIndicators] = useState<Indicator[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadIndicators();
  }, []);

  useEffect(() => {
    filterIndicators();
  }, [indicators, selectedFilter, activeFilter, searchTerm]);

  const loadIndicators = async () => {
    try {
      setIsLoading(true);
      const data = await indicatorService.getIndicators();
      setIndicators(data);
    } catch (error) {
      console.error('Erro ao carregar indicadores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterIndicators = () => {
    let filtered = indicators;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(indicator => 
        indicator.tipo_estrutura.toLowerCase() === (selectedFilter === 'composto' ? 'Composto' : 'Único').toLowerCase()
      );
    }

    if (activeFilter !== 'all') {
      filtered = filtered.filter(indicator => 
        activeFilter === 'active' ? indicator.ativo : !indicator.ativo
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(indicator =>
        indicator.nome.toLowerCase().includes(term) ||
        indicator.codigo.toLowerCase().includes(term) ||
        (indicator.descricao && indicator.descricao.toLowerCase().includes(term))
      );
    }

    setFilteredIndicators(filtered);
  };

  const handleSaveIndicator = () => {
    setIsIndicatorModalOpen(false);
    loadIndicators();
  };

  const handleDeleteIndicator = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este indicador?')) return;

    try {
      await indicatorService.deleteIndicator(id);
      await loadIndicators();
    } catch (error) {
      console.error('Erro ao excluir indicador:', error);
    }
  };

  const handleToggleActive = async (indicator: Indicator) => {
    try {
      await indicatorService.toggleIndicatorActive(indicator.id, !indicator.ativo);
      await loadIndicators();
    } catch (error) {
      console.error('Erro ao alterar status do indicador:', error);
    }
  };

  const handleViewDetails = (indicator: Indicator) => {
    setSelectedIndicator(indicator);
    setIsDetailsModalOpen(true);
  };

  const handleManageCompanies = (indicator: Indicator) => {
    setSelectedIndicator(indicator);
    setIsCompaniesModalOpen(true);
  };

  const handleEdit = (indicator: Indicator) => {
    setSelectedIndicator(indicator);
    setIsIndicatorModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Indicadores</h2>
          <p className="text-gray-400">Gerencie os indicadores para análise e acompanhamento do desempenho.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsIndicatorModalOpen(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Indicador
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
              placeholder="Buscar indicadores..."
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
              onClick={() => setSelectedFilter('composto')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedFilter === 'composto'
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
              }`}
            >
              Compostos
            </button>
            <button
              onClick={() => setSelectedFilter('unico')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedFilter === 'unico'
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
              }`}
            >
              Únicos
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
            <p className="text-gray-400">Carregando indicadores...</p>
          </div>
        ) : (
          <IndicatorList
            indicators={filteredIndicators}
            onEdit={handleEdit}
            onDelete={handleDeleteIndicator}
            onViewDetails={handleViewDetails}
            onManageCompanies={handleManageCompanies}
            onToggleActive={handleToggleActive}
          />
        )}
      </div>

      <IndicatorModal
        isOpen={isIndicatorModalOpen}
        onClose={() => {
          setIsIndicatorModalOpen(false);
          setSelectedIndicator(null);
        }}
        onSave={handleSaveIndicator}
        indicator={selectedIndicator}
      />

      {selectedIndicator && (
        <>
          <IndicatorDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            indicator={selectedIndicator}
          />
          <IndicatorCompaniesModal
            isOpen={isCompaniesModalOpen}
            onClose={() => setIsCompaniesModalOpen(false)}
            indicator={selectedIndicator}
          />
        </>
      )}

      <BulkLinkIndicatorModal
        isOpen={isBulkLinkModalOpen}
        onClose={() => setIsBulkLinkModalOpen(false)}
        indicators={indicators}
      />
    </div>
  );
};

export default Indicators;