import React, { useState, useEffect } from 'react';
import { Search, Plus, ChevronDown } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import AddWidgetModal from '../components/dashboard/AddWidgetModal';
import EditWidgetModal from '../components/dashboard/EditWidgetModal';
import WidgetList from '../components/dashboard/WidgetList';
import CompanySelect from '../components/database/CompanySelect';
import { widgetService } from '../services/widgetService';

const DashboardConfigPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('home');
  const [selectedType, setSelectedType] = useState<'all' | 'card' | 'lista' | 'grafico'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedSource, setSelectedSource] = useState<'all' | 'indicador' | 'categoria' | 'registro_vendas'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [widgets, setWidgets] = useState<any[]>([]);
  const [filteredWidgets, setFilteredWidgets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWidget, setSelectedWidget] = useState<any>(null);

  useEffect(() => {
    if (selectedCompanyId) {
      loadWidgets();
    }
  }, [selectedCompanyId, selectedTab]);

  useEffect(() => {
    filterWidgets();
  }, [widgets, selectedType, selectedStatus, selectedSource, searchTerm]);

  const loadWidgets = async () => {
    try {
      setIsLoading(true);
      const data = await widgetService.getWidgetsByPage(selectedTab, selectedCompanyId);
      setWidgets(data);
    } catch (error) {
      console.error('Erro ao carregar widgets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterWidgets = () => {
    let filtered = [...widgets];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(widget =>
        widget.nome_exibicao.toLowerCase().includes(term)
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(widget => widget.tipo_visualizacao === selectedType);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(widget => 
        selectedStatus === 'active' ? widget.ativo : !widget.ativo
      );
    }

    if (selectedSource !== 'all') {
      filtered = filtered.filter(widget => {
        const componentes = widget.config_visualizacoes_componentes;
        return componentes?.some((comp: any) => comp.tabela_origem === selectedSource);
      });
    }

    setFilteredWidgets(filtered);
  };

  const handleEdit = (widget: any) => {
    setSelectedWidget(widget);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este widget?')) return;

    try {
      await widgetService.deleteWidget(id);
      await loadWidgets();
    } catch (error) {
      console.error('Erro ao excluir widget:', error);
    }
  };

  const handleToggleActive = async (widget: any) => {
    try {
      await widgetService.toggleWidgetActive(widget.id, !widget.ativo);
      await loadWidgets();
    } catch (error) {
      console.error('Erro ao alterar status do widget:', error);
    }
  };

  const handleSaveWidget = async () => {
    setIsModalOpen(false);
    await loadWidgets();
  };

  const handleSaveEdit = async () => {
    setIsEditModalOpen(false);
    setSelectedWidget(null);
    await loadWidgets();
  };

  const sourceOptions = [
    { value: 'all', label: 'Todas as Fontes' },
    { value: 'indicador', label: 'Indicadores' },
    { value: 'categoria', label: 'Categorias' },
    { value: 'registro_vendas', label: 'Registro de Vendas' }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-start gap-6 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Configuração de Dashboards</h1>
        </div>
        <CompanySelect 
          value={selectedCompanyId}
          onChange={setSelectedCompanyId}
        />
      </div>

      <Tabs 
        defaultValue="home" 
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <TabsList className="w-full justify-start border border-dark-700/50 mb-6">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="analise">Análise</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
          <TabsTrigger value="tabelas">Tabelas</TabsTrigger>
        </TabsList>

        {['home', 'vendas', 'analise', 'graficos', 'tabelas'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Dashboard {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </h2>
                  <p className="text-gray-400">
                    Configure os elementos visuais que serão exibidos na página {tab}.
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  disabled={!selectedCompanyId}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Plus size={20} />
                  Novo Widget
                </button>
              </div>

              <div className="bg-dark-900/95 backdrop-blur-sm rounded-xl border border-dark-800 p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative md:w-1/3">
                    <input
                      type="text"
                      placeholder="Buscar widgets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedType('all')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedType === 'all'
                          ? 'bg-primary-600 text-white'
                          : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setSelectedType('card')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedType === 'card'
                          ? 'bg-primary-600 text-white'
                          : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                      }`}
                    >
                      Cards
                    </button>
                    <button
                      onClick={() => setSelectedType('grafico')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedType === 'grafico'
                          ? 'bg-primary-600 text-white'
                          : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                      }`}
                    >
                      Gráficos
                    </button>
                    <button
                      onClick={() => setSelectedType('lista')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedType === 'lista'
                          ? 'bg-primary-600 text-white'
                          : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                      }`}
                    >
                      Listas
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedStatus('all')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedStatus === 'all'
                          ? 'bg-primary-600 text-white'
                          : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setSelectedStatus('active')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedStatus === 'active'
                          ? 'bg-green-600 text-white'
                          : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                      }`}
                    >
                      Ativos
                    </button>
                    <button
                      onClick={() => setSelectedStatus('inactive')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedStatus === 'inactive'
                          ? 'bg-red-600 text-white'
                          : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                      }`}
                    >
                      Inativos
                    </button>
                  </div>

                  <div className="relative">
                    <select
                      value={selectedSource}
                      onChange={(e) => setSelectedSource(e.target.value as any)}
                      className="appearance-none w-48 px-4 py-2 pr-10 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    >
                      {sourceOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown 
                      size={16} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-dark-900/95 backdrop-blur-sm rounded-xl border border-dark-800 p-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Carregando widgets...</p>
                  </div>
                ) : (
                  <WidgetList
                    widgets={filteredWidgets}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <AddWidgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWidget}
        pagina={selectedTab}
        selectedCompanyId={selectedCompanyId}
      />

      {selectedWidget && (
        <EditWidgetModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedWidget(null);
          }}
          onSave={handleSaveEdit}
          widget={selectedWidget}
        />
      )}
    </div>
  );
};

export default DashboardConfigPage;