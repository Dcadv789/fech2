import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { categoryService } from '../../services/categoryService';
import { indicatorService } from '../../services/indicatorService';
import { Category } from '../../types/category';
import { Indicator } from '../../types/indicator';
import { Client } from '../../types/client';

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
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [tipoVisualizacao, setTipoVisualizacao] = useState(widget?.tipo_visualizacao || 'card');
  const [tipoGrafico, setTipoGrafico] = useState(widget?.tipo_grafico || 'bar');
  const [tabelaOrigem, setTabelaOrigem] = useState('indicador');
  const [ordem, setOrdem] = useState(widget?.ordem || 1);
  const [campoExibicao, setCampoExibicao] = useState('');
  const [selecaoTipo, setSelecaoTipo] = useState<'alguns' | 'todos'>('alguns');
  const [filtroCategoria, setFiltroCategoria] = useState<'Receita' | 'Despesa'>('Receita');
  const [selectAllClients, setSelectAllClients] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
      loadExistingComponents();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [categoriesData, indicatorsData, clientsData] = await Promise.all([
        categoryService.getCategories(),
        indicatorService.getIndicators(),
        loadClients()
      ]);

      setCategories(categoriesData);
      setIndicators(indicatorsData);
      setClients(clientsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados. Tente novamente.');
    }
  };

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('ativo', true)
        .order('razao_social');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      return [];
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
        setSelecaoTipo(firstComponent.todos ? 'todos' : 'alguns');
        
        if (!firstComponent.todos) {
          // Separar IDs de categorias/indicadores dos IDs de clientes
          const categoryIndicatorIds = data
            .filter(comp => comp.indicador_id || comp.categoria_id)
            .map(comp => comp.indicador_id || comp.categoria_id)
            .filter(Boolean);
          
          const clientIds = data
            .filter(comp => comp.cliente_id)
            .map(comp => comp.cliente_id)
            .filter(Boolean);
          
          setSelectedItems(categoryIndicatorIds);
          setSelectedClients(clientIds);
          
          // Se todos os clientes estiverem selecionados, marcar a opção "selecionar todos"
          if (clientIds.length > 0 && clients.length > 0 && clientIds.length === clients.length) {
            setSelectAllClients(true);
          }
        }
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
      if (selecaoTipo === 'todos') {
        // Inserir um único componente com todos = true
        await supabase
          .from('config_visualizacoes_componentes')
          .insert({
            visualizacao_id: widget.id,
            tabela_origem: tabelaOrigem,
            todos: true,
            ordem: 1
          });
      } else {
        let componentes = [];
        
        // Adicionar componentes de categoria ou indicador
        if (tabelaOrigem !== 'registro_venda' && selectedItems.length > 0) {
          componentes = selectedItems.map((itemId, index) => ({
            visualizacao_id: widget.id,
            tabela_origem: tabelaOrigem,
            indicador_id: tabelaOrigem === 'indicador' ? itemId : null,
            categoria_id: tabelaOrigem === 'categoria' ? itemId : null,
            campo_exibicao: null,
            ordem: index + 1,
            todos: false
          }));
        } 
        // Adicionar componentes de registro de venda
        else if (tabelaOrigem === 'registro_venda') {
          if (campoExibicao === 'cliente_id' && selectedClients.length > 0) {
            // Para clientes, criar um componente para cada cliente selecionado
            componentes = selectedClients.map((clientId, index) => ({
              visualizacao_id: widget.id,
              tabela_origem: tabelaOrigem,
              campo_exibicao: campoExibicao,
              cliente_id: clientId,
              ordem: index + 1,
              todos: false
            }));
          } else {
            // Para outros campos, criar um único componente
            componentes = [{
              visualizacao_id: widget.id,
              tabela_origem: tabelaOrigem,
              campo_exibicao: campoExibicao,
              ordem: 1,
              todos: false
            }];
          }
        }

        if (componentes.length > 0) {
          const { error: componentError } = await supabase
            .from('config_visualizacoes_componentes')
            .insert(componentes);

          if (componentError) throw componentError;
        }
      }

      onSave();
    } catch (error) {
      console.error('Erro ao atualizar widget:', error);
      setError('Erro ao atualizar widget. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectAllByType = (tipo: 'Receita' | 'Despesa') => {
    const categoriasByType = categories.filter(cat => cat.tipo === tipo);
    const ids = categoriasByType.map(cat => cat.id);
    setSelectedItems(prev => {
      const otherTypeIds = prev.filter(id => {
        const cat = categories.find(c => c.id === id);
        return cat && cat.tipo !== tipo;
      });
      return [...otherTypeIds, ...ids];
    });
  };

  const handleDeselectAllByType = (tipo: 'Receita' | 'Despesa') => {
    setSelectedItems(prev => {
      return prev.filter(id => {
        const cat = categories.find(c => c.id === id);
        return cat && cat.tipo !== tipo;
      });
    });
  };

  const handleToggleSelectAllClients = () => {
    const newSelectAllState = !selectAllClients;
    setSelectAllClients(newSelectAllState);
    
    if (newSelectAllState) {
      // Selecionar todos os clientes
      setSelectedClients(clients.map(client => client.id));
    } else {
      // Desmarcar todos os clientes
      setSelectedClients([]);
    }
  };

  const handleToggleClient = (clientId: string) => {
    setSelectedClients(prev => {
      if (prev.includes(clientId)) {
        // Se o cliente já está selecionado, remova-o
        const newSelection = prev.filter(id => id !== clientId);
        setSelectAllClients(false);
        return newSelection;
      } else {
        // Se o cliente não está selecionado, adicione-o
        const newSelection = [...prev, clientId];
        // Verifique se todos os clientes estão selecionados
        if (newSelection.length === clients.length) {
          setSelectAllClients(true);
        }
        return newSelection;
      }
    });
  };

  if (!isOpen) return null;

  const camposRegistroVendas = [
    { value: 'vendedor_id', label: 'Vendedor' },
    { value: 'sdr_id', label: 'SDR' },
    { value: 'servico_id', label: 'Serviço' },
    { value: 'origem', label: 'Origem' },
    { value: 'cliente_id', label: 'Cliente' },
    { value: 'nome_cliente', label: 'Nome do Cliente' },
    { value: 'data_venda', label: 'Data da Venda' }
  ];

  const categoriasPorTipo = {
    Receita: categories.filter(cat => cat.tipo === 'Receita'),
    Despesa: categories.filter(cat => cat.tipo === 'Despesa')
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-dark-700 sticky top-0 bg-dark-800 z-10">
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
                setSelectedClients([]);
                setCampoExibicao('');
                setSelecaoTipo('alguns');
                setSelectAllClients(false);
              }}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="registro_venda">Registro de Vendas</option>
              <option value="indicador">Indicadores</option>
              <option value="categoria">Categorias</option>
            </select>
          </div>

          <div className="flex items-center space-x-4 border border-dark-700 rounded-lg p-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={selecaoTipo === 'alguns'}
                onChange={() => setSelecaoTipo('alguns')}
                className="form-radio text-primary-600"
              />
              <span className="text-white">Alguns</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={selecaoTipo === 'todos'}
                onChange={() => setSelecaoTipo('todos')}
                className="form-radio text-primary-600"
              />
              <span className="text-white">Todos</span>
            </label>
          </div>

          {tabelaOrigem === 'registro_venda' && selecaoTipo === 'alguns' ? (
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
              
              {/* Exibir seleção de clientes quando o campo cliente_id for selecionado */}
              {campoExibicao === 'cliente_id' && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Selecionar Clientes ({selectedClients.length} selecionados)
                    </label>
                    <div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectAllClients}
                          onChange={handleToggleSelectAllClients}
                          className="mr-2 form-checkbox h-4 w-4 text-primary-600"
                        />
                        <span className="text-sm text-gray-300">Selecionar todos</span>
                      </label>
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto border border-dark-600 rounded-lg p-2">
                    {clients.length === 0 ? (
                      <p className="text-center text-gray-400 py-2">Nenhum cliente encontrado</p>
                    ) : (
                      <div className="space-y-1">
                        {clients.map((client) => (
                          <label key={client.id} className="flex items-center space-x-2 p-2 hover:bg-dark-700 rounded-lg cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedClients.includes(client.id)}
                              onChange={() => handleToggleClient(client.id)}
                              className="form-checkbox h-4 w-4 text-primary-600"
                            />
                            <div className="flex-1">
                              <p className="text-sm text-white">{client.razao_social}</p>
                              {client.nome_fantasia && (
                                <p className="text-xs text-gray-400">{client.nome_fantasia}</p>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">{client.codigo}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : selecaoTipo === 'alguns' && tabelaOrigem === 'categoria' ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Selecionar Categorias *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Coluna de Receitas */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-green-400">Receitas</h4>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectAllByType('Receita')}
                        className="text-xs text-green-400 hover:text-green-300"
                      >
                        Marcar todos
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeselectAllByType('Receita')}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Desmarcar todos
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-dark-600 rounded-lg p-2">
                    {categoriasPorTipo.Receita.map((categoria) => (
                      <label key={categoria.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(categoria.id)}
                          onChange={() => {
                            setSelectedItems(prev => {
                              if (prev.includes(categoria.id)) {
                                return prev.filter(id => id !== categoria.id);
                              }
                              return [...prev, categoria.id];
                            });
                          }}
                          className="form-checkbox h-4 w-4 text-primary-600"
                        />
                        <span className="text-white text-sm">{categoria.nome}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Coluna de Despesas */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-red-400">Despesas</h4>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectAllByType('Despesa')}
                        className="text-xs text-green-400 hover:text-green-300"
                      >
                        Marcar todos
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeselectAllByType('Despesa')}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Desmarcar todos
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-dark-600 rounded-lg p-2">
                    {categoriasPorTipo.Despesa.map((categoria) => (
                      <label key={categoria.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(categoria.id)}
                          onChange={() => {
                            setSelectedItems(prev => {
                              if (prev.includes(categoria.id)) {
                                return prev.filter(id => id !== categoria.id);
                              }
                              return [...prev, categoria.id];
                            });
                          }}
                          className="form-checkbox h-4 w-4 text-primary-600"
                        />
                        <span className="text-white text-sm">{categoria.nome}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : selecaoTipo === 'alguns' && tabelaOrigem === 'indicador' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Selecionar Indicadores *
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-dark-600 rounded-lg p-2">
                {indicators.map((indicador) => (
                  <label key={indicador.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(indicador.id)}
                      onChange={() => {
                        setSelectedItems(prev => {
                          if (prev.includes(indicador.id)) {
                            return prev.filter(id => id !== indicador.id);
                          }
                          return [...prev, indicador.id];
                        });
                      }}
                      className="form-checkbox h-4 w-4 text-primary-600"
                    />
                    <span className="text-white text-sm">{indicador.nome}</span>
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