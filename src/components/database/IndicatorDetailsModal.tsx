import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Indicator } from '../../types/indicator';
import { indicatorService } from '../../services/indicatorService';
import { categoryService } from '../../services/categoryService';
import { Category } from '../../types/category';

interface IndicatorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  indicator: Indicator;
}

const IndicatorDetailsModal: React.FC<IndicatorDetailsModalProps> = ({ isOpen, onClose, indicator }) => {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [composicao, setComposicao] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [indicadoresComponentes, setIndicadoresComponentes] = useState<Indicator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, indicator.id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [empresasData, composicaoData] = await Promise.all([
        indicatorService.getIndicatorCompanies(indicator.id),
        indicatorService.getIndicatorComposicao(indicator.id)
      ]);

      setEmpresas(empresasData);

      // Se houver composição, carregar detalhes
      if (composicaoData.length > 0) {
        const categoriasIds = composicaoData
          .filter(c => c.componente_categoria_id)
          .map(c => c.componente_categoria_id);

        const indicadoresIds = composicaoData
          .filter(c => c.componente_indicador_id)
          .map(c => c.componente_indicador_id);

        if (categoriasIds.length > 0) {
          const categoriasData = await categoryService.getCategories();
          const categoriasComposicao = categoriasData.filter(c => 
            categoriasIds.includes(c.id)
          );
          setCategorias(categoriasComposicao);
        }

        if (indicadoresIds.length > 0) {
          const indicadoresData = await indicatorService.getIndicators();
          const indicadoresComposicao = indicadoresData.filter(i => 
            indicadoresIds.includes(i.id)
          );
          setIndicadoresComponentes(indicadoresComposicao);
        }
      }

      setComposicao(composicaoData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-xl font-bold text-white">Detalhes do Indicador</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-400">Carregando detalhes...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">Código</label>
                  <p className="text-white">{indicator.codigo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Nome</label>
                  <p className="text-white">{indicator.nome}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">Tipo de Estrutura</label>
                  <p className="text-white">{indicator.tipo_estrutura}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Tipo de Dado</label>
                  <p className="text-white">{indicator.tipo_dado}</p>
                </div>
              </div>

              {indicator.descricao && (
                <div>
                  <label className="block text-sm font-medium text-gray-400">Descrição</label>
                  <p className="text-white">{indicator.descricao}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Empresas Vinculadas ({empresas.length})
                </label>
                <div className="space-y-2">
                  {empresas.length === 0 ? (
                    <p className="text-gray-400">Nenhuma empresa vinculada</p>
                  ) : (
                    empresas.map((vinculo) => (
                      <div
                        key={vinculo.id}
                        className="p-2 bg-dark-700 rounded-lg text-white"
                      >
                        {vinculo.empresa.razao_social}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {indicator.tipo_estrutura === 'Composto' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Composição
                  </label>
                  {categorias.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Categorias</h4>
                      <div className="space-y-2">
                        {categorias.map((categoria) => (
                          <div
                            key={categoria.id}
                            className="p-2 bg-dark-700 rounded-lg text-white"
                          >
                            {categoria.nome}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {indicadoresComponentes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Indicadores</h4>
                      <div className="space-y-2">
                        {indicadoresComponentes.map((indicador) => (
                          <div
                            key={indicador.id}
                            className="p-2 bg-dark-700 rounded-lg text-white"
                          >
                            {indicador.nome}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="pt-4">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndicatorDetailsModal;