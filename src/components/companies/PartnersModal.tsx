import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Company } from '../../types/company';
import { Partner } from '../../types/partner';
import { partnerService } from '../../services/partnerService';
import PartnerList from './PartnerList';
import PartnerForm from './PartnerForm';

interface PartnersModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
}

const PartnersModal: React.FC<PartnersModalProps> = ({ isOpen, onClose, company }) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadPartners();
    }
  }, [isOpen, company.id]);

  const loadPartners = async () => {
    try {
      setIsLoading(true);
      const data = await partnerService.getPartnersByCompany(company.id);
      setPartners(data);
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar sócios:', error);
      setError('Erro ao carregar sócios. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPartner = async (partnerData: any) => {
    try {
      await partnerService.createPartner({
        ...partnerData,
        empresa_id: company.id
      });
      await loadPartners();
      setShowForm(false);
      setError(null);
    } catch (error) {
      console.error('Erro ao adicionar sócio:', error);
      setError('Erro ao adicionar sócio. Tente novamente.');
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este sócio?')) return;

    try {
      await partnerService.deletePartner(id);
      await loadPartners();
      setError(null);
    } catch (error) {
      console.error('Erro ao excluir sócio:', error);
      setError('Erro ao excluir sócio. Tente novamente.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div>
            <h2 className="text-xl font-bold text-white">Sócios</h2>
            <p className="text-sm text-gray-400 mt-1">{company.razao_social}</p>
          </div>
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

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-4 text-gray-400">
              Carregando sócios...
            </div>
          ) : showForm ? (
            <PartnerForm
              companyId={company.id}
              onSubmit={handleAddPartner}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <div className="space-y-4">
              <PartnerList
                partners={partners}
                onDelete={handleDeletePartner}
              />
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus size={18} className="mr-2" />
                Adicionar Sócio
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnersModal;