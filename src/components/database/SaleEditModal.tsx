import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SaleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  sale: any;
}

const SaleEditModal: React.FC<SaleEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  sale
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [sdrs, setSDRs] = useState<any[]>([]);
  const [isNewClient, setIsNewClient] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
      setIsNewClient(!sale.cliente_id);
    }
  }, [isOpen, sale]);

  const loadData = async () => {
    try {
      const [clientsData, servicesData, peopleData] = await Promise.all([
        supabase
          .from('clientes')
          .select('id, razao_social')
          .eq('empresa_id', sale.empresa_id)
          .eq('ativo', true)
          .order('razao_social'),
        supabase
          .from('servicos')
          .select('id, nome')
          .eq('empresa_id', sale.empresa_id)
          .eq('ativo', true)
          .order('nome'),
        supabase
          .from('pessoas')
          .select('id, nome, cargo')
          .eq('empresa_id', sale.empresa_id)
          .order('nome')
      ]);

      if (clientsData.error) throw clientsData.error;
      if (servicesData.error) throw servicesData.error;
      if (peopleData.error) throw peopleData.error;

      setClients(clientsData.data || []);
      setServices(servicesData.data || []);
      
      // Filtrar vendedores e SDRs
      const people = peopleData.data || [];
      setSellers(people.filter(p => p.cargo === 'Vendedor' || p.cargo === 'Ambos'));
      setSDRs(people.filter(p => p.cargo === 'SDR' || p.cargo === 'Ambos'));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados. Tente novamente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const clientId = formData.get('cliente_id') as string;
      const nomeCliente = formData.get('nome_cliente') as string;

      if (!clientId && !nomeCliente) {
        throw new Error('Selecione um cliente ou informe o nome');
      }

      const saleData = {
        cliente_id: clientId || null,
        nome_cliente: nomeCliente || null,
        vendedor_id: formData.get('vendedor_id') as string || null,
        sdr_id: formData.get('sdr_id') as string || null,
        servico_id: formData.get('servico_id') as string,
        valor: Number(formData.get('valor')),
        origem: formData.get('origem') as string,
        data_venda: formData.get('data_venda') as string,
        registro_venda: formData.get('registro_venda') as string
      };

      const { error } = await supabase
        .from('registro_de_vendas')
        .update(saleData)
        .eq('id', sale.id);

      if (error) throw error;
      onSave();
    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      setError(error instanceof Error ? error.message : 'Erro ao atualizar venda');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 rounded-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white">Editar Venda</h2>
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
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={!isNewClient}
                onChange={() => setIsNewClient(false)}
                className="mr-2"
              />
              <span className="text-white">Cliente Cadastrado</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={isNewClient}
                onChange={() => setIsNewClient(true)}
                className="mr-2"
              />
              <span className="text-white">Novo Cliente</span>
            </label>
          </div>

          {isNewClient ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nome do Cliente *
              </label>
              <input
                type="text"
                name="nome_cliente"
                defaultValue={sale.nome_cliente}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
                required={isNewClient}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Cliente *
              </label>
              <select
                name="cliente_id"
                defaultValue={sale.cliente_id}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
                required={!isNewClient}
              >
                <option value="">Selecione um cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.razao_social}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Vendedor
              </label>
              <select
                name="vendedor_id"
                defaultValue={sale.vendedor_id}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Selecione um vendedor</option>
                {sellers.map(seller => (
                  <option key={seller.id} value={seller.id}>
                    {seller.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                SDR
              </label>
              <select
                name="sdr_id"
                defaultValue={sale.sdr_id}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Selecione um SDR</option>
                {sdrs.map(sdr => (
                  <option key={sdr.id} value={sdr.id}>
                    {sdr.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Serviço *
              </label>
              <select
                name="servico_id"
                defaultValue={sale.servico_id}
                required
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Selecione um serviço</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Origem *
              </label>
              <select
                name="origem"
                defaultValue={sale.origem}
                required
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Selecione a origem</option>
                <option value="Brasil">Brasil</option>
                <option value="Exterior">Exterior</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Valor *
              </label>
              <input
                type="number"
                name="valor"
                defaultValue={sale.valor}
                min="0.01"
                step="0.01"
                required
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Data da Venda *
              </label>
              <input
                type="date"
                name="data_venda"
                defaultValue={sale.data_venda}
                required
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Registro da Venda
            </label>
            <input
              type="text"
              name="registro_venda"
              defaultValue={sale.registro_venda}
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

export default SaleEditModal;