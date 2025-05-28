import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import CompanyFilter from '../components/companies/CompanyFilter';
import CompanyModal from '../components/companies/CompanyModal';
import PartnersModal from '../components/companies/PartnersModal';
import DeactivateModal from '../components/companies/DeactivateModal';
import CompanyList from '../components/companies/CompanyList';
import { Company } from '../types/company';
import { companyService } from '../services/companyService';

const CompaniesPage: React.FC = () => {
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isPartnersModalOpen, setIsPartnersModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm, statusFilter]);

  const loadCompanies = async () => {
    try {
      const data = await companyService.getCompanies();
      setCompanies(data);
      setFilteredCompanies(data);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = companies;

    // Aplicar filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(company => 
        company.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.nome_fantasia && company.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase())) ||
        company.cnpj.includes(searchTerm)
      );
    }

    // Aplicar filtro de status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(company => 
        statusFilter === 'active' ? company.ativo : !company.ativo
      );
    }

    setFilteredCompanies(filtered);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleStatusFilter = (status: 'all' | 'active' | 'inactive') => {
    setStatusFilter(status);
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setIsCompanyModalOpen(true);
  };

  const handleManagePartners = (company: Company) => {
    setSelectedCompany(company);
    setIsPartnersModalOpen(true);
  };

  const handleToggleActive = (company: Company) => {
    if (company.ativo) {
      setSelectedCompany(company);
      setIsDeactivateModalOpen(true);
    } else {
      handleActivate(company.id);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await companyService.activateCompany(id);
      await loadCompanies();
    } catch (error) {
      console.error('Erro ao ativar empresa:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return;

    try {
      await companyService.deleteCompany(id);
      await loadCompanies();
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
    }
  };

  const handleCloseCompanyModal = () => {
    setIsCompanyModalOpen(false);
    setSelectedCompany(null);
  };

  const handleClosePartnersModal = () => {
    setIsPartnersModalOpen(false);
    setSelectedCompany(null);
  };

  const handleCloseDeactivateModal = () => {
    setIsDeactivateModalOpen(false);
    setSelectedCompany(null);
  };

  const handleDeactivateConfirm = async () => {
    await loadCompanies();
    handleCloseDeactivateModal();
  };

  const handleSave = async () => {
    await loadCompanies();
    handleCloseCompanyModal();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Empresas</h1>
        <p className="text-gray-300">
          Gerencie as empresas cadastradas no sistema e suas informações.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="w-full">
          <CompanyFilter 
            onSearch={handleSearch}
            onStatusFilter={handleStatusFilter}
          />
        </div>
        <button
          onClick={() => setIsCompanyModalOpen(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors whitespace-nowrap"
        >
          <Plus size={20} className="mr-2" />
          Nova Empresa
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-dark-900/95 backdrop-blur-sm rounded-xl border border-dark-800">
          <div className="text-gray-400">Carregando...</div>
        </div>
      ) : (
        <CompanyList
          companies={filteredCompanies}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onManagePartners={handleManagePartners}
          onToggleActive={handleToggleActive}
        />
      )}

      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={handleCloseCompanyModal}
        onSave={handleSave}
        company={selectedCompany}
      />

      {selectedCompany && (
        <>
          <PartnersModal
            isOpen={isPartnersModalOpen}
            onClose={handleClosePartnersModal}
            company={selectedCompany}
          />
          <DeactivateModal
            isOpen={isDeactivateModalOpen}
            onClose={handleCloseDeactivateModal}
            onConfirm={handleDeactivateConfirm}
            company={selectedCompany}
          />
        </>
      )}
    </div>
  );
};

export default CompaniesPage;