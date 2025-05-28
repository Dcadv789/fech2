import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import DashboardCard from '../components/dashboard/DashboardCard';
import DashboardChart from '../components/dashboard/DashboardChart';
import DashboardList from '../components/dashboard/DashboardList';

const HomePage: React.FC = () => {
  const [widgets, setWidgets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardConfig();
  }, []);

  const loadDashboardConfig = async () => {
    try {
      setIsLoading(true);
      
      const { data: configData, error: configError } = await supabase
        .from('config_visualizacoes')
        .select(`
          *,
          config_visualizacoes_componentes (
            *,
            indicador:indicadores(*),
            categoria:categorias(*)
          )
        `)
        .eq('pagina', 'home')
        .order('ordem');

      if (configError) throw configError;
      
      setWidgets(configData || []);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Separar widgets por tipo para organização do layout
  const cardWidgets = widgets.filter(w => w.tipo_visualizacao === 'card');
  const chartWidgets = widgets.filter(w => w.tipo_visualizacao === 'grafico');
  const listWidgets = widgets.filter(w => w.tipo_visualizacao === 'lista');

  return (
    <div className="p-6 space-y-6">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <DashboardCard
              key={i}
              title=""
              value=""
              loading={true}
            />
          ))
        ) : (
          cardWidgets.map((widget) => (
            <DashboardCard
              key={widget.id}
              title={widget.nome_exibicao}
              value="0"
              comparison={{
                value: 10,
                type: 'increase'
              }}
            />
          ))
        )}
      </div>

      {/* Gráfico Principal */}
      {chartWidgets.length > 0 && (
        <div className="w-full">
          {isLoading ? (
            <DashboardChart
              title=""
              type="bar"
              data={{ labels: [], values: [] }}
              loading={true}
            />
          ) : (
            <DashboardChart
              title={chartWidgets[0].nome_exibicao}
              type={chartWidgets[0].tipo_grafico}
              data={{
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                values: [120, 200, 150, 80, 70, 110]
              }}
            />
          )}
        </div>
      )}

      {/* Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          Array(2).fill(0).map((_, i) => (
            <DashboardList
              key={i}
              title=""
              items={[]}
              loading={true}
            />
          ))
        ) : (
          listWidgets.map((widget) => (
            <DashboardList
              key={widget.id}
              title={widget.nome_exibicao}
              items={[
                { id: '1', title: 'Item 1', value: 'R$ 1.000,00' },
                { id: '2', title: 'Item 2', value: 'R$ 2.000,00' },
                { id: '3', title: 'Item 3', value: 'R$ 3.000,00' }
              ]}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;