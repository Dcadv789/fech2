import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SalesPage from './pages/SalesPage';
import AnalysisPage from './pages/AnalysisPage';
import DrePage from './pages/DrePage';
import ClientsPage from './pages/ClientsPage';
import ChartsPage from './pages/ChartsPage';
import UsersPage from './pages/UsersPage';
import CompaniesPage from './pages/CompaniesPage';
import DatabasePage from './pages/DatabasePage';
import DashboardConfigPage from './pages/DashboardConfigPage';
import DreConfigPage from './pages/DreConfigPage';
import PeoplePage from './pages/PeoplePage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/vendas" element={<SalesPage />} />
          <Route path="/analise" element={<AnalysisPage />} />
          <Route path="/dre" element={<DrePage />} />
          <Route path="/clientes" element={<ClientsPage />} />
          <Route path="/graficos" element={<ChartsPage />} />
          <Route path="/usuarios" element={<UsersPage />} />
          <Route path="/empresas" element={<CompaniesPage />} />
          <Route path="/banco-dados" element={<DatabasePage />} />
          <Route path="/config-dashboards" element={<DashboardConfigPage />} />
          <Route path="/config-dre" element={<DreConfigPage />} />
          <Route path="/pessoas" element={<PeoplePage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;