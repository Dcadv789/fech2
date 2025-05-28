import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { categoryService } from '../../services/categoryService';
import { indicatorService } from '../../services/indicatorService';
import { Category } from '../../types/category';
import { Indicator } from '../../types/indicator';

interface EditWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  widget: any;
}

const EditWidgetModal: React.FC<EditWidgetModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  widget 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [tipoVisualizacao, setTipoVisualizacao] = useState(widget?.tipo_visualizacao || 'card');
  const [tipoGrafico, setTipoGrafico] = useState(widget?.tipo_grafico || 'bar');
  const [tabelaOrigem, setTabelaOrigem] = useState('indicador');
  const [ordem, setOrdem] = useState(widget?.ordem || 1);
  const [campoExibicao, setCampoExibicao] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadData();
      loadExistingComponents();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [categoriesData, indicatorsData] = await Promise.all([
        categoryService.getCategories(),
        indicatorService.getIndicators()
      ]);

      setCategories(categoriesData);
      setIndicators(indicatorsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados. Tente novamente.');
    }
  };

  const loadExistingComponents = async () => {
    try {
      const { data, error } = await supabase
        .from('config_visualizacoes_componentes')
        .select('*')
        .eq('visualizacao_id', widget.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const firstComponent = data[0];
        setTabelaOrigem(firstComponent.tabela_origem);
        setCampoExibicao(firstComponent.campo_exibicao || '');
        
        const ids = data.map(comp => 
          comp.indicador_id || comp.categoria_id
        ).filter(Boolean);
        
        setSelectedItems(ids);
      }
    } catch (error) {
      console.error('Erro ao carregar componentes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Atualizar widget
      const widgetData = {
        nome_exibicao: formData.get('nome_exibicao'),
        tipo_visualizacao: tipoVisualizacao,
        tipo_grafico: tipoVisualizacao === 'grafico' ? tipoGrafico : null,
        ordem: ordem,
        modificado_em: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('config_visualizacoes')
        .update(widgetData)
        .eq('id', widget.id);

      if (updateError) throw updateError;

      // Remover componentes existentes
      await supabase
        .from('config_visualizacoes_componentes')
        .delete()
        .eq('visualizacao_id', widget.id);

      // Inserir novos componentes
      if (selectedItems.length > 0 || tabelaOrigem === 'registro_venda') {
        let componentes = [];

        if (tabelaOrigem === 'registro_venda') {
          componentes.push({
            visualizacao_id: widget.id,
            tabela_origem: tabelaOrigem,
            campo_exibicao: campoExibicao,
            ordem: 1
          });
        } else {
          componentes = selectedItems.map((itemId, index) => ({
            visualizacao_id: widget.id,
            tabela_origem: tabelaOrigem,
            indicador_id: tabelaOrigem === 'indicador' ? itemId : null,
            categoria_id: tabelaOrigem === 'categoria' ? itemId : null,
            ordem: index + 1
          }));
        }

        const { error: componentError } = await supabase
          .from('config_visualizacoes_componentes')
          .insert(componentes);

        if (componentError) throw componentError;
      }

      onSave();
    } catch (error) {
      console.error('Erro ao atualizar widget:', error);
      setError('Erro ao atualizar widget. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const camposRegistroVendas = [
    { value: 'vendedor_id', label: 'Vendedor' },
    { value: 'sdr_id', label: 'SDR' },
    { value: 'servico_id', label: 'Serviço' },
    { value: 'origem', label: 'Origem' },
    { value: 'nome_cliente', label: 'Nome do Cliente' },
    { value: 'data_venda', label: 'Data da Venda' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 rounded-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white">Editar Widget</h2>
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
                Ordem *
              </label>
              <input
                type="number"
                min="1"
                value={ordem}
                onChange={(e) => setOrdem(Number(e.target.value))}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nome do Widget *
              </label>
              <input
                type="text"
                name="nome_exibicao"
                defaultValue={widget.nome_exibicao}
                required
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tipo de Visualização *
              </label>
              <select
                value={tipoVisualizacao}
                onChange={(e) => setTipoVisualizacao(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="card">Card</option>
                <option value="lista">Lista</option>
                <option value="grafico">Gráfico</option>
              </select>
            </div>

            {tipoVisualizacao === 'grafico' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tipo de Gráfico *
                </label>
                <select
                  value={tipoGrafico}
                  onChange={(e) => setTipoGrafico(e.target.value)}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="bar">Barras</option>
                  <option value="line">Linhas</option>
                  <option value="pie">Pizza</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Fonte de Dados *
            </label>
            <select
              value={tabelaOrigem}
              onChange={(e) => {
                setTabelaOrigem(e.target.value);
                setSelectedItems([]);
                setCampoExibicao('');
              }}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="registro_venda">Registro de Vendas</option>
              <option value="indicador">Indicadores</option>
              <option value="categoria">Categorias</option>
            </select>
          </div>

          {tabelaOrigem === 'registro_venda' ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Campo para Exibição *
              </label>
              <select
                value={campoExibicao}
                onChange={(e) => setCampoExibicao(e.target.value)}
                required
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Selecione um campo</option>
                {camposRegistroVendas.map(campo => (
                  <option key={campo.value} value={campo.value}>
                    {campo.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Selecionar Itens *
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {(tabelaOrigem === 'indicador' ? indicators : categories).map((item) => (
                  <label key={item.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => {
                        setSelectedItems(prev => {
                          if (prev.includes(item.id)) {
                            return prev.filter(id => id !== item.id);
                          }
                          return [...prev, item.id];
                        });
                      }}
                      className="form-checkbox h-4 w-4 text-primary-600"
                    />
                    <span className="text-white">{item.nome}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

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

export default EditWidgetModal;