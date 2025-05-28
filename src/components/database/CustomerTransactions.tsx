import React, { useState, useEffect } from 'react';
import { Search, Plus, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Transaction } from '../../types/transaction';
import TransactionList from './TransactionList';
import TransactionModal from './TransactionModal';
import TransactionEditModal from './TransactionEditModal';

const CustomerTransactions: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, selectedMonth, selectedYear, selectedClient, searchTerm]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [transactionsData, yearsData, clientsData] = await Promise.all([
        loadTransactions(),
        loadAvailableYears(),
        loadClients()
      ]);

      setTransactions(transactionsData || []);
      setAvailableYears(yearsData);
      setClients(clientsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from('lancamentos')
      .select(`
        *,
        empresa:empresas(razao_social),
        cliente:clientes(razao_social)
      `)
      .eq('tipo', 'Receita')
      .not('cliente_id', 'is', null)
      .order('ano', { ascending: false })
      .order('mes', { ascending: false });

    if (error) throw error;
    return data;
  };

  const loadAvailableYears = async () => {
    const { data, error } = await supabase
      .from('lancamentos')
      .select('ano')
      .eq('tipo', 'Receita')
      .not('cliente_id', 'is', null)
      .order('ano', { ascending: false });

    if (error) throw error;
    const years = [...new Set(data?.map(item => item.ano))];
    return years.length > 0 ? years : [new Date().getFullYear()];
  };

  const loadClients = async () => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('ativo', true)
      .order('razao_social');

    if (error) throw error;
    return data;
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    if (selectedMonth !== 'all') {
      filtered = filtered.filter(transaction => transaction.mes === selectedMonth);
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter(transaction => transaction.ano === selectedYear);
    }

    if (selectedClient) {
      filtered = filtered.filter(transaction => transaction.cliente_id === selectedClient);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction =>
        transaction.descricao?.toLowerCase().includes(term) ||
        (transaction as any).cliente?.razao_social?.toLowerCase().includes(term) ||
        (transaction as any).empresa?.razao_social?.toLowerCase().includes(term)
      );
    }

    setFilteredTransactions(filtered);
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return;

    try {
      const { error } = await supabase
        .from('lancamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      const updatedTransactions = await loadTransactions();
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error('Erro ao excluir lançamento:', error);
    }
  };

  const handleSaveTransaction = async () => {
    const updatedTransactions = await loadTransactions();
    setTransactions(updatedTransactions);
    setIsModalOpen(false);
  };

  const handleSaveEdit = async () => {
    const updatedTransactions = await loadTransactions();
    setTransactions(updatedTransactions);
    setIsEditModalOpen(false);
    setSelectedTransaction(null);
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const SelectButton: React.FC<{
    value: any;
    onChange: (value: any) => void;
    options: { value: any; label: string }[];
    placeholder: string;
    className?: string;
  }> = ({ value, onChange, options, placeholder, className = '' }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500 pr-10 ${className}`}
      >
        <option value="all">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Lançamentos de Clientes</h2>
          <p className="text-gray-400">Gerencie os lançamentos específicos por cliente e acompanhe suas movimentações.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Lançamento
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
            <Upload size={20} />
            Upload
          </button>
        </div>
      </div>
      
      <div className="bg-dark-900/95 backdrop-blur-sm rounded-xl border border-dark-800 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative w-1/3">
            <input
              type="text"
              placeholder="Buscar lançamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <SelectButton
            value={selectedMonth}
            onChange={(value) => setSelectedMonth(value === 'all' ? 'all' : Number(value))}
            options={months.map((month, index) => ({ value: index + 1, label: month }))}
            placeholder="Todos os Meses"
            className="px-4 py-2"
          />

          <SelectButton
            value={selectedYear}
            onChange={(value) => setSelectedYear(value === 'all' ? 'all' : Number(value))}
            options={availableYears.map(year => ({ value: year, label: year.toString() }))}
            placeholder="Todos os Anos"
            className="px-4 py-2"
          />

          <SelectButton
            value={selectedClient}
            onChange={setSelectedClient}
            options={clients.map(client => ({ value: client.id, label: client.razao_social }))}
            placeholder="Todos os Clientes"
            className="px-4 py-2 min-w-[200px]"
          />
        </div>
      </div>

      <div className="bg-dark-900/95 backdrop-blur-sm rounded-xl border border-dark-800 p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Carregando lançamentos...</p>
          </div>
        ) : (
          <TransactionList
            transactions={filteredTransactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
      />

      {selectedTransaction && (
        <TransactionEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTransaction(null);
          }}
          onSave={handleSaveEdit}
          transaction={selectedTransaction}
        />
      )}
    </div>
  );
};

export default CustomerTransactions;