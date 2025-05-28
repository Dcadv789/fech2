import React, { useState } from 'react';
import { CreatePartnerDTO } from '../../types/partner';

interface PartnerFormProps {
  companyId: string;
  onSubmit: (data: CreatePartnerDTO) => Promise<void>;
  onCancel: () => void;
}

const PartnerForm: React.FC<PartnerFormProps> = ({ companyId, onSubmit, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      
      const percentualValue = formData.get('percentual');
      if (!percentualValue || isNaN(Number(percentualValue))) {
        throw new Error('Percentual inválido');
      }

      const partnerData: CreatePartnerDTO = {
        empresa_id: companyId,
        nome: formData.get('nome') as string,
        cpf: formData.get('cpf') as string,
        percentual: Number(percentualValue),
        email: formData.get('email') as string || undefined,
        telefone: formData.get('telefone') as string || undefined,
      };

      await onSubmit(partnerData);
      form.reset();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar sócio. Tente novamente.';
      setError(errorMessage);
      console.error('Erro ao salvar sócio:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Nome *
        </label>
        <input
          type="text"
          name="nome"
          required
          className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            CPF *
          </label>
          <input
            type="text"
            name="cpf"
            required
            className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Participação (%) *
          </label>
          <input
            type="number"
            name="percentual"
            min="0"
            max="100"
            step="0.01"
            required
            className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Telefone
          </label>
          <input
            type="tel"
            name="telefone"
            className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
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
          {isSubmitting ? 'Salvando...' : 'Salvar Sócio'}
        </button>
      </div>
    </form>
  );
};

export default PartnerForm;