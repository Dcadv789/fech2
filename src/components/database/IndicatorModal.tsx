import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { indicatorService } from '../../services/indicatorService';
import { indicatorCodeService } from '../../services/indicatorCodeService';
import { categoryService } from '../../services/categoryService';
import { CreateIndicatorDTO, Indicator } from '../../types/indicator';
import { Category } from '../../types/category';

interface IndicatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  indicator?: Indicator | null;
}

const IndicatorModal: React.FC<IndicatorModalProps> = ({ isOpen, onClose, onSave, indicator }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [indicatorCode, setIndicatorCode] = useState<string>('');
  const [isComposto, setIsComposto] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && !indicator) {
      generateNextCode();
      loadData();
    } else if (indicator) {
      setIndicatorCode(indicator.codigo);
      setIsComposto(indicator.tipo_estrutura === 'Composto');
      loadComposicao();
    }
  }, [isOpen, indicator]);

  const generateNextCode = async () => {
    try {
      const nextCode = await indicatorCodeService.getNextCode();
      setIndicatorCode(nextCode);
    } catch (error) {
      console.error('Erro ao gerar código:', error);
      setError('Erro ao gerar código do indicador. Tente novamente.');
    }
  };

  const loadData = async () => {
    try {
      const [categoriesData, indicatorsData] = await Promise.all([
        categoryService.getCategories(),
        indicatorService.getIndicators()
      ]);
      setCategories(categoriesData);
      setIndicators(indicatorsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados. Tente novamente.');
    }
  };

  const loadComposicao = async () => {
    if (!indicator) return;
    
    try {
      const composicao = await indicatorService.getIndicatorComposicao(indicator.id);
      
      const categoriaIds = composicao
        .filter(c => c.componente_categoria_id)
        .map(c => c.componente_categoria_id);
      
      const indicadorIds = composicao
        .filter(c => c.componente_indicador_id)
        .map(c => c.componente_indicador_id);

      setSelectedCategories(categoriaIds);
      setSelectedIndicators(indicadorIds);
    } catch (error) {
      console.error('Erro ao carregar composição:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const indicatorData: CreateIndicatorDTO = {
        codigo: indicatorCode,
        nome: formData.get('nome') as string,
        descricao: formData.get('descricao') as string || undefined,
        tipo_estrutura: isComposto ? 'Composto' : 'Único',
        tipo_dado: formData.get('tipo_dado') as 'Moeda' | 'Número' | 'Percentual',
        ativo: true
      };

      let savedIndicator;
      if (indicator) {
        savedIndicator = await indicatorService.updateIndicator(indicator.id, indicatorData);
      } else {
        savedIndicator = await indicatorService.createIndicator(indicatorData);
      }

      // Se for composto, salvar composição
      if (isComposto && savedIndicator) {
        if (selectedCategories.length > 0) {
          await indicatorService.saveIndicatorCategories(
            savedIndicator.id,
            selectedCategories
          );
        }
        
        if (selectedIndicators.length > 0) {
          await indicatorService.saveIndicatorComponents(
            savedIndicator.id,
            selectedIndicators
          );
        }
      }

      onSave();
    } catch (error) {
      console.error('Erro ao salvar indicador:', error);
      setError('Erro ao salvar indicador. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTipoEstruturaChange = (tipo: 'Composto' | 'Único') => {
    setIsComposto(tipo === 'Composto');
    if (tipo === 'Único') {
      setSelectedCategories([]);
      setSelectedIndicators([]);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      }
      return [...prev, categoryId];
    });
    // Limpar indicadores selecionados quando selecionar categoria
    setSelectedIndicators([]);
  };

  const toggleIndicator = (indicatorId: string) => {
    setSelectedIndicators(prev => {
      if (prev.includes(indicatorId)) {
        return prev.filter(id => id !== indicatorId);
      }
      return [...prev, indicatorId];
    });
    // Limpar categorias selecionadas quando selecionar indicador
    setSelectedCategories([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white">
            {indicator ? 'Editar Indicador' : 'Novo Indicador'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nome *
              </label>
              <input
                type="text"
                name="nome"
                defaultValue={indicator?.nome}
                required
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Código
              </label>
              <input
                type="text"
                value={indicatorCode}
                disabled
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tipo de Estrutura *
              </label>
              <select
                value={isComposto ? 'Composto' : 'Único'}
                onChange={(e) => handleTipoEstruturaChange(e.target.value as 'Composto' | 'Único')}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="Único">Único</option>
                <option value="Composto">Composto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tipo de Dado *
              </label>
              <select
                name="tipo_dado"
                defaultValue={indicator?.tipo_dado || 'Moeda'}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="Moeda">Moeda</option>
                <option value="Número">Número</option>
                <option value="Percentual">Percentual</option>
              </select>
            </div>
          </div>

          {isComposto && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categorias
                </label>
                <div className="max-h-48 overflow-y-auto border border-dark-600 rounded-lg divide-y divide-dark-600">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center p-2 hover:bg-dark-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        disabled={selectedIndicators.length > 0}
                        className="mr-2"
                      />
                      <span className="text-white">{category.nome}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Indicadores
                </label>
                <div className="max-h-48 overflow-y-auto border border-dark-600 rounded-lg divide-y divide-dark-600">
                  {indicators.map((ind) => (
                    <label
                      key={ind.id}
                      className="flex items-center p-2 hover:bg-dark-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIndicators.includes(ind.id)}
                        onChange={() => toggleIndicator(ind.id)}
                        disabled={selectedCategories.length > 0}
                        className="mr-2"
                      />
                      <span className="text-white">{ind.nome}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Descrição
            </label>
            <textarea
              name="descricao"
              defaultValue={indicator?.descricao || ''}
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

export default IndicatorModal;