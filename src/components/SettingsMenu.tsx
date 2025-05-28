import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, Database, LayoutDashboard, FileText } from 'lucide-react';

interface SettingsMenuProps {
  onItemClick: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ onItemClick }) => {
  return (
    <div className="absolute right-0 mt-2 w-[200px] rounded-lg shadow-lg bg-dark-800 ring-1 ring-black ring-opacity-5 overflow-hidden">
      <div className="py-2 space-y-1">
        <Link 
          to="/usuarios" 
          className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-700 hover:text-white flex items-center"
          onClick={onItemClick}
        >
          <Users size={16} className="mr-3" />
          Usuários
        </Link>
        <Link 
          to="/empresas" 
          className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-700 hover:text-white flex items-center"
          onClick={onItemClick}
        >
          <Building2 size={16} className="mr-3" />
          Empresas
        </Link>
        <Link 
          to="/banco-dados" 
          className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-700 hover:text-white flex items-center"
          onClick={onItemClick}
        >
          <Database size={16} className="mr-3" />
          Banco de Dados
        </Link>
        <Link 
          to="/config-dashboards" 
          className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-700 hover:text-white flex items-center"
          onClick={onItemClick}
        >
          <LayoutDashboard size={16} className="mr-3" />
          Config. Dashboards
        </Link>
        <Link 
          to="/config-dre" 
          className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-700 hover:text-white flex items-center"
          onClick={onItemClick}
        >
          <FileText size={16} className="mr-3" />
          Config. DRE
        </Link>
      </div>
    </div>
  );
};

export default SettingsMenu