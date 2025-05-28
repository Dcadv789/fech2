import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { transactionService } from '../../services/transactionService';
import { CreateTransactionDTO } from '../../types/transaction';

interface Company {
  id: string;
  razao_social: string;
}

interface Client {
  id: string;
  codigo: string;
  razao_social: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCompanies();
    } else {
      setSelectedCompanyId('');
      setSelectedClient(null);
      setClients([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedCompanyId) {
      loadClients(selectedCompanyId);
    } else {
      setClients([]);
      setSelectedClient(null);
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

  const loadClients = async (empresaId: string) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, codigo, razao_social')
        .eq('empresa_id', empresaId)
        .eq('ativo', true)
        .order('razao_social');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setError('Erro ao carregar clientes. Tente novamente.');
    }
  };

  const handleCompanyChange = (empresaId: string) => {
    setSelectedCompanyId(empresaId);
    setSelectedClient(null);
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client || null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const mes = Number(formData.get('mes'));
      const ano = Number(formData.get('ano'));
      const valor = Number(formData.get('valor'));
      const descricao = formData.get('descricao') as string;

      if (!selectedCompanyId) {
        throw new Error('Selecione uma empresa');
      }

      if (!mes || mes < 1 || mes > 12) {
        throw new Error('Mês inválido');
      }

      if (!ano || ano < 2000) {
        throw new Error('Ano inválido');
      }

      if (!valor || valor <= 0) {
        throw new Error('Valor inválido');
      }

      if (!selectedClient) {
        throw new Error('Selecione um cliente');
      }

      const transactionData: CreateTransactionDTO = {
        empresa_id: selectedCompanyId,
        cliente_id: selectedClient.id,
        mes,
        ano,
        valor,
        tipo: 'Receita',
        descricao
      };

      await transactionService.createTransaction(transactionData);
      onSave();
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error);
      setError(error instanceof Error ? error.message : 'Erro ao salvar lançamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 rounded-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white">Novo Lançamento</h2>
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
              value={selectedCompanyId}
              onChange={(e) => handleCompanyChange(e.target.value)}
              required
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Mês *
              </label>
              <select
                name="mes"
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
                min="2000"
                max="2100"
                required
                defaultValue={new Date().getFullYear()}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Valor *
            </label>
            <input
              type="number"
              name="valor"
              min="0.01"
              step="0.01"
              required
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Cliente *
              </label>
              <select
                onChange={(e) => handleClientChange(e.target.value)}
                required
                disabled={!selectedCompanyId}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white disabled:opacity-50"
              >
                <option value="">
                  {selectedCompanyId ? 'Selecione um cliente' : 'Selecione uma empresa primeiro'}
                </option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.razao_social}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Código do Cliente
              </label>
              <input
                type="text"
                value={selectedClient?.codigo || ''}
                readOnly
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Descrição
            </label>
            <textarea
              name="descricao"
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

export default TransactionModal;