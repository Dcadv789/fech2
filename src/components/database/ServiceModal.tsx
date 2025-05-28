import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Service } from '../../types/service';
import { serviceService } from '../../services/serviceService';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  selectedCompanyId?: string;
  service?: Service | null;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  selectedCompanyId,
  service
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceCode, setServiceCode] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (service) {
        setServiceCode(service.codigo);
      } else {
        generateNextCode();
      }
    }
  }, [isOpen, service]);

  const generateNextCode = async () => {
    try {
      const nextCode = await serviceService.getNextCode();
      setServiceCode(nextCode);
    } catch (error) {
      console.error('Erro ao gerar código:', error);
      setError('Erro ao gerar código do serviço. Tente novamente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCompanyId) {
      setError('Selecione uma empresa');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      
      const serviceData = {
        empresa_id: selectedCompanyId,
        codigo: serviceCode,
        nome: formData.get('nome') as string,
        descricao: formData.get('descricao') as string || undefined,
        ativo: true
      };

      if (service) {
        await serviceService.updateService(service.id, serviceData);
      } else {
        await serviceService.createService(serviceData);
      }

      onSave();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      setError('Erro ao salvar serviço. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white">
            {service ? 'Editar Serviço' : 'Novo Serviço'}
          </h2>
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
              Código
            </label>
            <input
              type="text"
              value={serviceCode}
              readOnly
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nome *
            </label>
            <input
              type="text"
              name="nome"
              defaultValue={service?.nome}
              required
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Descrição
            </label>
            <textarea
              name="descricao"
              defaultValue={service?.descricao || ''}
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

export default ServiceModal;