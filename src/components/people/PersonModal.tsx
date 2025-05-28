import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Person, CreatePersonDTO } from '../../types/person';
import { personService } from '../../services/personService';

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  selectedCompanyId?: string;
  person?: Person | null;
}

const PersonModal: React.FC<PersonModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  selectedCompanyId,
  person
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [personCode, setPersonCode] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (person) {
        setPersonCode(person.codigo);
      } else {
        generateNextCode();
      }
    }
  }, [isOpen, person]);

  const generateNextCode = async () => {
    try {
      const nextCode = await personService.getNextCode();
      setPersonCode(nextCode);
    } catch (error) {
      console.error('Erro ao gerar código:', error);
      setError('Erro ao gerar código. Tente novamente.');
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
      
      const personData: CreatePersonDTO = {
        empresa_id: selectedCompanyId,
        codigo: personCode,
        nome: formData.get('nome') as string,
        cpf: formData.get('cpf') as string || undefined,
        cnpj: formData.get('cnpj') as string || undefined,
        email: formData.get('email') as string || undefined,
        telefone: formData.get('telefone') as string || undefined,
        cargo: formData.get('cargo') as 'Vendedor' | 'SDR' | 'Ambos'
      };

      if (person) {
        await personService.updatePerson(person.id, personData);
      } else {
        await personService.createPerson(personData);
      }

      onSave();
    } catch (error) {
      console.error('Erro ao salvar pessoa:', error);
      setError('Erro ao salvar pessoa. Tente novamente.');
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
            {person ? 'Editar Pessoa' : 'Nova Pessoa'}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Código
              </label>
              <input
                type="text"
                value={personCode}
                readOnly
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Cargo *
              </label>
              <select
                name="cargo"
                defaultValue={person?.cargo || ''}
                required
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Selecione um cargo</option>
                <option value="Vendedor">Vendedor</option>
                <option value="SDR">SDR</option>
                <option value="Ambos">Ambos</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nome *
            </label>
            <input
              type="text"
              name="nome"
              defaultValue={person?.nome}
              required
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                defaultValue={person?.cpf || ''}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                CNPJ
              </label>
              <input
                type="text"
                name="cnpj"
                defaultValue={person?.cnpj || ''}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
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
                defaultValue={person?.email || ''}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                name="telefone"
                defaultValue={person?.telefone || ''}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
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

export default PersonModal;