import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Indicator } from '../../types/indicator';
import { indicatorService } from '../../services/indicatorService';

interface BulkLinkIndicatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  indicators: Indicator[];
}

interface Company {
  id: string;
  razao_social: string;
}

const BulkLinkIndicatorModal: React.FC<BulkLinkIndicatorModalProps> = ({ isOpen, onClose, indicators }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedIndicators, setSelectedIndicators] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkedIndicators, setLinkedIndicators] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      loadCompanies();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedCompanyId) {
      loadLinkedIndicators();
    } else {
      setLinkedIndicators(new Set());
      setSelectedIndicators(new Set());
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

  const loadLinkedIndicators = async () => {
    try {
      const { data, error } = await supabase
        .from('indicadores_empresas')
        .select('indicador_id')
        .eq('empresa_id', selectedCompanyId);

      if (error) throw error;

      const linkedIds = new Set(data.map(item => item.indicador_id));
      setLinkedIndicators(linkedIds);
      setSelectedIndicators(linkedIds);
    } catch (error) {
      console.error('Erro ao carregar indicadores vinculados:', error);
      setError('Erro ao carregar indicadores vinculados. Tente novamente.');
    }
  };

  const handleIndicatorToggle = (indicatorId: string) => {
    const newSelected = new Set(selectedIndicators);
    if (newSelected.has(indicatorId)) {
      newSelected.delete(indicatorId);
    } else {
      newSelected.add(indicatorId);
    }
    setSelectedIndicators(newSelected);
  };

  const handleSubmit = async () => {
    if (!selectedCompanyId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Remover vínculos existentes
      const indicadoresParaRemover = Array.from(linkedIndicators)
        .filter(id => !selectedIndicators.has(id));

      // Adicionar novos vínculos
      const indicadoresParaAdicionar = Array.from(selectedIndicators)
        .filter(id => !linkedIndicators.has(id));

      if (indicadoresParaRemover.length > 0) {
        await supabase
          .from('indicadores_empresas')
          .delete()
          .eq('empresa_id', selectedCompanyId)
          .in('indicador_id', indicadoresParaRemover);
      }

      if (indicadoresParaAdicionar.length > 0) {
        const novosVinculos = indicadoresParaAdicionar.map(indicadorId => ({
          indicador_id: indicadorId,
          empresa_id: selectedCompanyId
        }));

        await supabase
          .from('indicadores_empresas')
          .insert(novosVinculos);
      }

      onClose();
    } catch (error) {
      console.error('Erro ao vincular indicadores:', error);
      setError('Erro ao vincular indicadores. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white">Vincular Indicadores em Massa</h2>
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
              Indicadores ({selectedIndicators.size} selecionados)
            </label>
            <div className="mt-2 max-h-[400px] overflow-y-auto border border-dark-700 rounded-lg divide-y divide-dark-700">
              {indicators.map((indicator) => (
                <div
                  key={indicator.id}
                  className="flex items-center p-3 hover:bg-dark-700/50"
                >
                  <label className="flex items-center space-x-3 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      checked={selectedIndicators.has(indicator.id)}
                      onChange={() => handleIndicatorToggle(indicator.id)}
                      className="w-4 h-4 rounded border-dark-600 text-primary-600 focus:ring-primary-500 bg-dark-700"
                    />
                    <div className="flex-1">
                      <p className="text-white">{indicator.nome}</p>
                      <p className="text-sm text-gray-400">{indicator.codigo}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      indicator.tipo_estrutura === 'Composto'
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-green-500/10 text-green-500'
                    }`}>
                      {indicator.tipo_estrutura}
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
                  Vincular Indicadores
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkLinkIndicatorModal;