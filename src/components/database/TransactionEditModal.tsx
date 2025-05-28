import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { transactionService } from '../../services/transactionService';
import { Category } from '../../types/category';
import { Indicator } from '../../types/indicator';
import { Transaction } from '../../types/transaction';

interface TransactionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  transaction: Transaction;
}

const TransactionEditModal: React.FC<TransactionEditModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  transaction 
}) => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [selectedType, setSelectedType] = useState<'Receita' | 'Despesa'>(transaction.tipo);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(transaction.categoria_id || '');
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string>(transaction.indicador_id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [companiesData, categoriesData, indicatorsData] = await Promise.all([
        supabase.from('empresas').select('id, razao_social').order('razao_social'),
        supabase.from('categorias').select('*').eq('ativo', true).order('nome'),
        supabase.from('indicadores').select('*').eq('ativo', true).order('nome')
      ]);

      if (companiesData.error) throw companiesData.error;
      if (categoriesData.error) throw categoriesData.error;
      if (indicatorsData.error) throw indicatorsData.error;

      setCompanies(companiesData.data || []);
      setCategories(categoriesData.data || []);
      setIndicators(indicatorsData.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados. Tente novamente.');
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    if (categoryId) {
      setSelectedIndicatorId('');
    }
  };

  const handleIndicatorChange = (indicatorId: string) => {
    setSelectedIndicatorId(indicatorId);
    if (indicatorId) {
      setSelectedCategoryId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const empresaId = formData.get('empresa_id') as string;
      const mes = Number(formData.get('mes'));
      const ano = Number(formData.get('ano'));
      const valor = Number(formData.get('valor'));
      const tipo = formData.get('tipo') as 'Receita' | 'Despesa';
      const descricao = formData.get('descricao') as string;

      // Validações
      if (!empresaId) throw new Error('Selecione uma empresa');
      if (!mes || mes < 1 || mes > 12) throw new Error('Mês inválido');
      if (!ano || ano < 2000) throw new Error('Ano inválido');
      if (!valor || valor <= 0) throw new Error('Valor inválido');
      if (!selectedCategoryId && !selectedIndicatorId) throw new Error('Selecione uma categoria ou indicador');

      await transactionService.updateTransaction(transaction.id, {
        empresa_id: empresaId,
        mes,
        ano,
        valor,
        tipo,
        descricao,
        categoria_id: selectedCategoryId || undefined,
        indicador_id: selectedIndicatorId || undefined
      });

      onSave();
    } catch (error) {
      console.error('Erro ao atualizar lançamento:', error);
      setError(error instanceof Error ? error.message : 'Erro ao atualizar lançamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 rounded-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white">Editar Lançamento</h2>
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
              Empresa *
            </label>
            <select
              name="empresa_id"
              defaultValue={transaction.empresa_id}
              required
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.razao_social}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Mês *
              </label>
              <select
                name="mes"
                defaultValue={transaction.mes}
                required
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Selecione o mês</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Ano *
              </label>
              <input
                type="number"
                name="ano"
                defaultValue={transaction.ano}
                min="2000"
                max="2100"
                required
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Valor *
              </label>
              <input
                type="number"
                name="valor"
                defaultValue={transaction.valor}
                min="0.01"
                step="0.01"
                required
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tipo *
              </label>
              <select
                name="tipo"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as 'Receita' | 'Despesa')}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="Receita">Receita</option>
                <option value="Despesa">Despesa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Categoria
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Selecione uma categoria</option>
                {categories
                  .filter(cat => cat.tipo === selectedType)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nome}
                    </option>
                  ))
                }
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Indicador
              </label>
              <select
                value={selectedIndicatorId}
                onChange={(e) => handleIndicatorChange(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Selecione um indicador</option>
                {indicators.map((indicator) => (
                  <option key={indicator.id} value={indicator.id}>
                    {indicator.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Descrição
            </label>
            <textarea
              name="descricao"
              defaultValue={transaction.descricao}
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

export default TransactionEditModal;