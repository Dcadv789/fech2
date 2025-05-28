import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { clientService } from '../../services/clientService';
import { Client, CreateClientDTO } from '../../types/client';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  selectedCompanyId?: string;
  client?: Client | null;
}

const ClientModal: React.FC<ClientModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  selectedCompanyId,
  client
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientCode, setClientCode] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (client) {
        setClientCode(client.codigo);
      } else {
        generateNextCode();
      }
    }
  }, [isOpen, client]);

  const generateNextCode = async () => {
    try {
      const nextCode = await clientService.getNextCode();
      setClientCode(nextCode);
    } catch (error) {
      console.error('Erro ao gerar código:', error);
      setError('Erro ao gerar código do cliente. Tente novamente.');
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
      const code = formData.get('codigo') as string;

      // Verificar se o código já existe
      const codeExists = await clientService.checkCodeExists(code, client?.id);
      if (codeExists) {
        setError('Este código já está em uso');
        setIsSubmitting(false);
        return;
      }

      const clientData: CreateClientDTO = {
        codigo: code,
        razao_social: formData.get('razao_social') as string,
        nome_fantasia: formData.get('nome_fantasia') as string || undefined,
        cnpj: formData.get('cnpj') as string,
        empresa_id: selectedCompanyId,
        ativo: true
      };

      if (client) {
        await clientService.updateClient(client.id, clientData);
      } else {
        await clientService.createClient(clientData);
      }
      onSave();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      setError('Erro ao salvar cliente. Tente novamente.');
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
            {client ? 'Editar Cliente' : 'Novo Cliente'}
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
              Código *
            </label>
            <input
              type="text"
              name="codigo"
              value={clientCode}
              onChange={(e) => setClientCode(e.target.value)}
              required
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Razão Social *
            </label>
            <input
              type="text"
              name="razao_social"
              defaultValue={client?.razao_social}
              required
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nome Fantasia
            </label>
            <input
              type="text"
              name="nome_fantasia"
              defaultValue={client?.nome_fantasia || ''}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              CNPJ *
            </label>
            <input
              type="text"
              name="cnpj"
              defaultValue={client?.cnpj}
              required
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

export default ClientModal;