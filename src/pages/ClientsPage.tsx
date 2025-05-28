import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Client } from '../types/client';
import { clientService } from '../services/clientService';
import ClientList from '../components/clients/ClientList';
import ClientModal from '../components/clients/ClientModal';

interface Company {
  id: string;
  razao_social: string;
}

const ClientsPage: React.FC = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, selectedCompanyId, searchTerm, activeFilter]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [companiesData, clientsData] = await Promise.all([
        loadCompanies(),
        loadClients()
      ]);

      setCompanies(companiesData || []);
      setClients(clientsData || []);

      if (companiesData.length > 0) {
        setSelectedCompanyId(companiesData[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompanies = async () => {
    const { data, error } = await supabase
      .from('empresas')
      .select('id, razao_social')
      .order('razao_social');

    if (error) throw error;
    return data;
  };

  const loadClients = async () => {
    const data = await clientService.getClients();
    return data;
  };

  const filterClients = () => {
    let filtered = clients;

    if (selectedCompanyId) {
      filtered = filtered.filter(client => client.empresa_id === selectedCompanyId);
    }

    if (activeFilter !== 'all') {
      filtered = filtered.filter(client => 
        activeFilter === 'active' ? client.ativo : !client.ativo
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(client =>
        client.razao_social.toLowerCase().includes(term) ||
        (client.nome_fantasia && client.nome_fantasia.toLowerCase().includes(term)) ||
        client.cnpj.includes(term) ||
        client.codigo.toLowerCase().includes(term)
      );
    }

    setFilteredClients(filtered);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (client: Client) => {
    try {
      await clientService.toggleClientActive(client.id, !client.ativo);
      const updatedClients = await loadClients();
      setClients(updatedClients);
    } catch (error) {
      console.error('Erro ao alterar status do cliente:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
      await clientService.deleteClient(id);
      const updatedClients = await loadClients();
      setClients(updatedClients);
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
    }
  };

  const handleSave = async () => {
    const updatedClients = await loadClients();
    setClients(updatedClients);
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Clientes</h2>
          <p className="text-gray-400">Gerencie os clientes cadastrados no sistema.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      <div className="bg-dark-900/95 backdrop-blur-sm rounded-xl border border-dark-800 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative md:w-1/2">
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
          >
            <option value="">Todas as empresas</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.razao_social}
              </option>
            ))}
          </select>

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
            <p className="text-gray-400">Carregando clientes...</p>
          </div>
        ) : (
          <ClientList 
            clients={filteredClients}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        )}
      </div>

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClient(null);
        }}
        onSave={handleSave}
        selectedCompanyId={selectedCompanyId}
        client={selectedClient}
      />
    </div>
  );
};

export default ClientsPage;