import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import Categories from '../components/database/Categories';
import Indicators from '../components/database/Indicators';
import Transactions from '../components/database/Transactions';
import CustomerTransactions from '../components/database/CustomerTransactions';
import SalesRegistration from '../components/database/SalesRegistration';
import Services from '../components/database/Services';
import CompanySelect from '../components/database/CompanySelect';

const DatabasePage: React.FC = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  // Atualizar o selectedCompanyId quando o CompanySelect mudar
  useEffect(() => {
    const unsubscribe = window.addEventListener('companySelect', ((event: CustomEvent) => {
      setSelectedCompanyId(event.detail.companyId);
    }) as EventListener);

    return () => {
      window.removeEventListener('companySelect', unsubscribe as EventListener);
    };
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Banco de Dados</h1>
        <CompanySelect 
          value={selectedCompanyId}
          onChange={setSelectedCompanyId}
        />
      </div>

      <Tabs defaultValue="categorias" className="w-full">
        <TabsList className="w-full justify-start border border-dark-700/50 mb-6">
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
          <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
          <TabsTrigger value="lancamentos-clientes">Lanç. Clientes</TabsTrigger>
          <TabsTrigger value="registro-vendas">Registro de Vendas</TabsTrigger>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
        </TabsList>

        <TabsContent value="categorias">
          <Categories selectedCompanyId={selectedCompanyId} />
        </TabsContent>
        <TabsContent value="indicadores">
          <Indicators selectedCompanyId={selectedCompanyId} />
        </TabsContent>
        <TabsContent value="lancamentos">
          <Transactions selectedCompanyId={selectedCompanyId} />
        </TabsContent>
        <TabsContent value="lancamentos-clientes">
          <CustomerTransactions selectedCompanyId={selectedCompanyId} />
        </TabsContent>
        <TabsContent value="registro-vendas">
          <SalesRegistration selectedCompanyId={selectedCompanyId} />
        </TabsContent>
        <TabsContent value="servicos">
          <Services selectedCompanyId={selectedCompanyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabasePage;