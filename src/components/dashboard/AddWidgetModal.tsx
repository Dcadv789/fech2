import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  pagina: string;
  selectedCompanyId: string;
}

type TipoVisualizacao = 'card' | 'lista' | 'grafico';
type TipoGrafico = 'bar' | 'line' | 'pie';
type FonteDados = 'indicador' | 'categoria' | 'registro_venda';

interface OrigemItem {
  id: string;
  nome?: string;
  codigo?: string;
  registro_venda?: string;
}

const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  pagina,
  selectedCompanyId 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tipoVisualizacao, setTipoVisualizacao] = useState<TipoVisualizacao>('card');
  const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>('bar');
  const [fonteDados, setFonteDados] = useState<FonteDados>('registro_venda');
  const [itensOrigem, setItensOrigem] = useState<OrigemItem[]>([]);
  const [itensSelecionados, setItensSelecionados] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && selectedCompanyId) {
      carregarItensPorFonte();
    }
  }, [isOpen, selectedCompanyId, fonteDados]);

  const carregarItensPorFonte = async () => {
    try {
      let { data, error } = { data: null, error: null };

      switch (fonteDados) {
        case 'indicador':
          ({ data, error } = await supabase
            .from('indicadores')
            .select('id, nome, codigo')
            .eq('ativo', true)
            .order('nome'));
          break;
        case 'categoria':
          ({ data, error } = await supabase
            .from('categorias')
            .select('id, nome, codigo')
            .eq('ativo', true)
            .order('nome'));
          break;
        case 'registro_venda':
          ({ data, error } = await supabase
            .from('registro_de_vendas')
            .select('id, registro_venda')
            .eq('empresa_id', selectedCompanyId)
            .order('registro_venda'));
          break;
      }

      if (error) throw error;
      setItensOrigem(data || []);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      setError('Erro ao carregar itens. Tente novamente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Buscar a maior ordem existente para a página
      const { data: existingConfigs } = await supabase
        .from('config_visualizacoes')
        .select('ordem')
        .eq('pagina', pagina)
        .order('ordem', { ascending: false })
        .limit(1);

      const nextOrder = existingConfigs && existingConfigs.length > 0 
        ? existingConfigs[0].ordem + 1 
        : 1;

      // Inserir configuração principal
      const { data: configData, error: configError } = await supabase
        .from('config_visualizacoes')
        .insert({
          pagina,
          nome_exibicao: formData.get('nome_exibicao'),
          tipo_visualizacao: tipoVisualizacao,
          tipo_grafico: tipoVisualizacao === 'grafico' ? tipoGrafico : null,
          ordem: nextOrder,
          ativo: true
        })
        .select()
        .single();

      if (configError) throw configError;

      // Inserir relação com empresa
      const { error: empresaError } = await supabase
        .from('config_visualizacoes_empresas')
        .insert({
          visualizacao_id: configData.id,
          empresa_id: selectedCompanyId
        });

      if (empresaError) throw empresaError;

      // Inserir componentes
      const componentes = itensSelecionados.map((itemId, index) => ({
        visualizacao_id: configData.id,
        tabela_origem: fonteDados,
        indicador_id: fonteDados === 'indicador' ? itemId : null,
        categoria_id: fonteDados === 'categoria' ? itemId : null,
        campo_exibicao: fonteDados === 'registro_venda' ? 'valor' : null,
        ordem: index + 1
      }));

      const { error: componentesError } = await supabase
        .from('config_visualizacoes_componentes')
        .insert(componentes);

      if (componentesError) throw componentesError;

      onSave();
    } catch (error) {
      console.error('Erro ao salvar widget:', error);
      setError('Erro ao salvar widget. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 rounded-xl w-full max-w-4xl">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white">Novo Widget</h2>
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
              Nome do Widget *
            </label>
            <input
              type="text"
              name="nome_exibicao"
              required
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tipo de Visualização *
              </label>
              <select
                value={tipoVisualizacao}
                onChange={(e) => setTipoVisualizacao(e.target.value as TipoVisualizacao)}
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
                  onChange={(e) => setTipoGrafico(e.target.value as TipoGrafico)}
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
              value={fonteDados}
              onChange={(e) => {
                setFonteDados(e.target.value as FonteDados);
                setItensSelecionados([]);
              }}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="registro_venda">Registro de Vendas</option>
              <option value="indicador">Indicadores</option>
              <option value="categoria">Categorias</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Selecionar Itens *
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {itensOrigem.map((item) => (
                <label key={item.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={itensSelecionados.includes(item.id)}
                    onChange={() => {
                      setItensSelecionados(prev => {
                        if (prev.includes(item.id)) {
                          return prev.filter(id => id !== item.id);
                        }
                        return [...prev, item.id];
                      });
                    }}
                    className="form-checkbox h-4 w-4 text-primary-600"
                  />
                  <span className="text-sm text-gray-300">
                    {item.nome || item.codigo || item.registro_venda}
                  </span>
                </label>
              ))}
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
              disabled={isSubmitting || itensSelecionados.length === 0}
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

export default AddWidgetModal;