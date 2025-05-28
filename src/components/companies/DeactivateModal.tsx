import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Company } from '../../types/company';
import { companyService } from '../../services/companyService';

interface DeactivateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  company: Company;
}

const DeactivateModal: React.FC<DeactivateModalProps> = ({ isOpen, onClose, onConfirm, company }) => {
  // Inicializar com a data atual no fuso horário de São Paulo
  const today = new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
  const [deactivationDate, setDeactivationDate] = useState<string>(new Date(today).toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await companyService.deactivateCompany(company.id, deactivationDate);
      onConfirm();
    } catch (error) {
      console.error('Erro ao desativar empresa:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white">Desativar Empresa</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-gray-300 mb-4">
            Você está prestes a desativar a empresa <strong>{company.razao_social}</strong>. 
            Por favor, selecione a data de desativação.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Data de Desativação
            </label>
            <input
              type="date"
              value={deactivationDate}
              onChange={(e) => setDeactivationDate(e.target.value)}
              required
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div className="flex justify-end space-x-4">
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
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Desativando...' : 'Confirmar Desativação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeactivateModal;