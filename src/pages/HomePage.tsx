import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import DashboardCard from '../components/dashboard/DashboardCard';
import DashboardChart from '../components/dashboard/DashboardChart';
import DashboardList from '../components/dashboard/DashboardList';
import CompanySelect from '../components/database/CompanySelect';

const HomePage: React.FC = () => {
  const [widgets, setWidgets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    // Carregar anos disponíveis
    const currentYear = new Date().getFullYear();
    setAvailableYears([currentYear - 1, currentYear, currentYear + 1]);

    // Definir mês anterior como padrão
    const previousMonth = new Date().getMonth() - 1;
    setSelectedMonth(previousMonth >= 0 ? previousMonth : 11);
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadDashboardConfig();
    }
  }, [selectedCompanyId, selectedMonth, selectedYear]);

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

  const cardWidgets = widgets.filter(w => w.tipo_visualizacao === 'card');
  const chartWidgets = widgets.filter(w => w.tipo_visualizacao === 'grafico');
  const listWidgets = widgets.filter(w => w.tipo_visualizacao === 'lista');

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="flex flex-col h-screen p-6 space-y-6">
      {/* Filtros Globais */}
      <div className="bg-dark-900/95 backdrop-blur-sm rounded-xl border border-dark-800 p-6">
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-2">Empresa</label>
            <CompanySelect
              value={selectedCompanyId}
              onChange={setSelectedCompanyId}
              className="w-full"
            />
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-400 mb-2">Mês</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>
          <div className="w-36">
            <label className="block text-sm font-medium text-gray-400 mb-2">Ano</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 grid grid-rows-[auto_1fr_1fr] gap-6 min-h-0">
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
                value="R$ 10.000,00"
                comparison={{
                  value: 10,
                  type: widget.id % 2 === 0 ? 'increase' : 'decrease'
                }}
              />
            ))
          )}
        </div>

        {/* Gráfico */}
        {chartWidgets.length > 0 && (
          <div className="w-full h-full">
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
                  labels: months,
                  values: [120, 200, 150, 80, 70, 110, 90, 130, 180, 160, 140, 190]
                }}
              />
            )}
          </div>
        )}

        {/* Listas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
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
                  { id: '1', title: 'Item 1', value: 'R$ 1.000,00', subtitle: 'Detalhes adicionais' },
                  { id: '2', title: 'Item 2', value: 'R$ 2.000,00', subtitle: 'Mais informações' },
                  { id: '3', title: 'Item 3', value: 'R$ 3.000,00', subtitle: 'Dados complementares' }
                ]}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;