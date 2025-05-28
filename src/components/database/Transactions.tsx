import React, { useState, useEffect } from 'react';
import { Search, Plus, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Category } from '../../types/category';
import { Indicator } from '../../types/indicator';
import { Transaction } from '../../types/transaction';
import TransactionList from './TransactionList';
import TransactionModal from './TransactionModal';
import TransactionEditModal from './TransactionEditModal';

const Transactions: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'receita' | 'despesa'>('all');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedIndicator, setSelectedIndicator] = useState<string>('');
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
  }, [transactions, selectedMonth, selectedYear, selectedType, selectedCategory, selectedIndicator, searchTerm]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [transactionsData, yearsData, categoriesData, indicatorsData] = await Promise.all([
        loadTransactions(),
        loadAvailableYears(),
        loadCategories(),
        loadIndicators()
      ]);

      setTransactions(transactionsData || []);
      setAvailableYears(yearsData);
      setCategories(categoriesData || []);
      setIndicators(indicatorsData || []);
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
        categoria:categorias(nome),
        indicador:indicadores(nome)
      `)
      .order('ano', { ascending: false })
      .order('mes', { ascending: false });

    if (error) throw error;
    return data;
  };

  const loadAvailableYears = async () => {
    const { data, error } = await supabase
      .from('lancamentos')
      .select('ano')
      .order('ano', { ascending: false });

    if (error) throw error;
    const years = [...new Set(data?.map(item => item.ano))];
    return years.length > 0 ? years : [new Date().getFullYear()];
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) throw error;
    return data;
  };

  const loadIndicators = async () => {
    const { data, error } = await supabase
      .from('indicadores')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) throw error;
    return data;
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Filtrar por mês
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(transaction => transaction.mes === selectedMonth);
    }

    // Filtrar por ano
    if (selectedYear !== 'all') {
      filtered = filtered.filter(transaction => transaction.ano === selectedYear);
    }

    // Filtrar por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(transaction => 
        transaction.tipo.toLowerCase() === selectedType
      );
    }

    // Filtrar por categoria
    if (selectedCategory) {
      filtered = filtered.filter(transaction => transaction.categoria_id === selectedCategory);
    }

    // Filtrar por indicador
    if (selectedIndicator) {
      filtered = filtered.filter(transaction => transaction.indicador_id === selectedIndicator);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction =>
        transaction.descricao?.toLowerCase().includes(term) ||
        (transaction as any).categoria?.nome?.toLowerCase().includes(term) ||
        (transaction as any).indicador?.nome?.toLowerCase().includes(term) ||
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
      await loadTransactions();
    } catch (error) {
      console.error('Erro ao excluir lançamento:', error);
    }
  };

  const handleSaveTransaction = async () => {
    await loadTransactions();
    setIsModalOpen(false);
  };

  const handleSaveEdit = async () => {
    await loadTransactions();
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
          <h2 className="text-xl font-semibold text-white mb-2">Lançamentos</h2>
          <p className="text-gray-400">Gerencie os lançamentos financeiros e acompanhe o fluxo de caixa.</p>
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

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedType === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedType('receita')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedType === 'receita'
                  ? 'bg-green-600 text-white'
                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => setSelectedType('despesa')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedType === 'despesa'
                  ? 'bg-red-600 text-white'
                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
              }`}
            >
              Despesas
            </button>
          </div>

          <SelectButton
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categories.map(category => ({ value: category.id, label: category.nome }))}
            placeholder="Todas as Categorias"
            className="px-4 py-2 min-w-[200px]"
          />

          <SelectButton
            value={selectedIndicator}
            onChange={setSelectedIndicator}
            options={indicators.map(indicator => ({ value: indicator.id, label: indicator.nome }))}
            placeholder="Todos os Indicadores"
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

export default Transactions;