import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Service } from '../../types/service';
import { serviceService } from '../../services/serviceService';
import ServiceList from './ServiceList';
import ServiceModal from './ServiceModal';

interface Company {
  id: string;
  razao_social: string;
}

const Services: React.FC = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, selectedCompanyId, searchTerm, activeFilter]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [companiesData, servicesData] = await Promise.all([
        loadCompanies(),
        loadServices()
      ]);

      setCompanies(companiesData || []);
      setServices(servicesData || []);

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

  const loadServices = async () => {
    const data = await serviceService.getServices();
    return data;
  };

  const filterServices = () => {
    let filtered = services;

    if (selectedCompanyId) {
      filtered = filtered.filter(service => service.empresa_id === selectedCompanyId);
    }

    if (activeFilter !== 'all') {
      filtered = filtered.filter(service => 
        activeFilter === 'active' ? service.ativo : !service.ativo
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(service =>
        service.nome.toLowerCase().includes(term) ||
        (service.descricao && service.descricao.toLowerCase().includes(term)) ||
        service.codigo.toLowerCase().includes(term)
      );
    }

    setFilteredServices(filtered);
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (service: Service) => {
    try {
      await serviceService.toggleServiceActive(service.id, !service.ativo);
      const updatedServices = await loadServices();
      setServices(updatedServices);
    } catch (error) {
      console.error('Erro ao alterar status do serviço:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;

    try {
      await serviceService.deleteService(id);
      const updatedServices = await loadServices();
      setServices(updatedServices);
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
    }
  };

  const handleSave = async () => {
    const updatedServices = await loadServices();
    setServices(updatedServices);
    setIsModalOpen(false);
    setSelectedService(null);
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Serviços</h2>
          <p className="text-gray-400">Gerencie os serviços oferecidos pela empresa.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          disabled={!selectedCompanyId}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={20} />
          Novo Serviço
        </button>
      </div>

      <div className="bg-dark-900/95 backdrop-blur-sm rounded-xl border border-dark-800 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative md:w-1/2">
            <input
              type="text"
              placeholder="Buscar serviços..."
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
            <p className="text-gray-400">Carregando serviços...</p>
          </div>
        ) : (
          <ServiceList 
            services={filteredServices}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        )}
      </div>

      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedService(null);
        }}
        onSave={handleSave}
        selectedCompanyId={selectedCompanyId}
        service={selectedService}
      />
    </div>
  );
};

export default Services;