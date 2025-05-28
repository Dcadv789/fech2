import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import SalesList from './SalesList';
import SaleModal from './SaleModal';
import SaleEditModal from './SaleEditModal';
import CompanySelect from './CompanySelect';

const SalesRegistration: React.FC = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [sales, setSales] = useState<any[]>([]);
  const [filteredSales, setFilteredSales] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState<'all' | 'Brasil' | 'Exterior'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (selectedCompanyId) {
      loadSales();
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    filterSales();
  }, [sales, searchTerm, selectedOrigin]);

  const loadSales = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('registro_de_vendas')
        .select(`
          *,
          empresa:empresas(razao_social),
          cliente:clientes(razao_social),
          vendedor:pessoas(nome),
          sdr:pessoas(nome),
          servico:servicos(nome)
        `)
        .eq('empresa_id', selectedCompanyId)
        .order('data_venda', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSales = () => {
    let filtered = [...sales];

    if (selectedOrigin !== 'all') {
      filtered = filtered.filter(sale => sale.origem === selectedOrigin);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sale =>
        sale.nome_cliente?.toLowerCase().includes(term) ||
        sale.cliente?.razao_social?.toLowerCase().includes(term) ||
        sale.vendedor?.nome?.toLowerCase().includes(term) ||
        sale.sdr?.nome?.toLowerCase().includes(term) ||
        sale.servico?.nome?.toLowerCase().includes(term)
      );
    }

    setFilteredSales(filtered);
  };

  const handleEdit = (sale: any) => {
    setSelectedSale(sale);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta venda?')) return;

    try {
      const { error } = await supabase
        .from('registro_de_vendas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadSales();
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
    }
  };

  const handleSave = async () => {
    await loadSales();
    setIsModalOpen(false);
  };

  const handleSaveEdit = async () => {
    await loadSales();
    setIsEditModalOpen(false);
    setSelectedSale(null);
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Registro de Vendas</h2>
          <p className="text-gray-400">Gerencie os registros de vendas realizadas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Venda
        </button>
      </div>

      <div className="bg-dark-900/95 backdrop-blur-sm rounded-xl border border-dark-800 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative md:w-1/2">
            <input
              type="text"
              placeholder="Buscar vendas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <CompanySelect
            value={selectedCompanyId}
            onChange={setSelectedCompanyId}
          />

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedOrigin('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedOrigin === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setSelectedOrigin('Brasil')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedOrigin === 'Brasil'
                  ? 'bg-green-600 text-white'
                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
              }`}
            >
              Brasil
            </button>
            <button
              onClick={() => setSelectedOrigin('Exterior')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedOrigin === 'Exterior'
                  ? 'bg-blue-600 text-white'
                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
              }`}
            >
              Exterior
            </button>
          </div>
        </div>
      </div>

      <div className="bg-dark-900/95 backdrop-blur-sm rounded-xl border border-dark-800 p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Carregando vendas...</p>
          </div>
        ) : (
          <SalesList
            sales={filteredSales}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <SaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        selectedCompanyId={selectedCompanyId}
      />

      {selectedSale && (
        <SaleEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedSale(null);
          }}
          onSave={handleSaveEdit}
          sale={selectedSale}
        />
      )}
    </div>
  );
};

export default SalesRegistration;