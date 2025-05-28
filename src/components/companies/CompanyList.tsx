import React from 'react';
import { Building2, Mail, Phone, Calendar, Pencil, Trash2, Power, Users } from 'lucide-react';
import { Company } from '../../types/company';
import { formatCNPJ, formatPhoneNumber, calculateContractTime } from '../../utils/formatters';

interface CompanyListProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
  onManagePartners: (company: Company) => void;
  onToggleActive: (company: Company) => void;
}

const CompanyList: React.FC<CompanyListProps> = ({ companies, onEdit, onDelete, onManagePartners, onToggleActive }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {companies.length === 0 ? (
        <div className="col-span-full p-6 text-center text-gray-400 bg-dark-900/95 backdrop-blur-sm rounded-xl border border-dark-800">
          Nenhuma empresa encontrada
        </div>
      ) : (
        companies.map((company) => (
          <div key={company.id} className="bg-dark-900/95 backdrop-blur-sm rounded-xl border border-dark-800 p-6 hover:border-dark-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-dark-800 rounded-lg flex items-center justify-center">
                    {company.url_logo ? (
                      <img 
                        src={company.url_logo} 
                        alt={company.razao_social} 
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <Building2 size={24} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{company.razao_social}</h3>
                    {company.nome_fantasia && (
                      <p className="text-sm text-gray-400">{company.nome_fantasia}</p>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    company.ativo 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {company.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                  {company.data_desativacao && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-500/10 text-gray-400">
                      Desativado em: {new Date(company.data_desativacao).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-300">
                <span className="text-xs text-gray-400 w-24">CNPJ:</span>
                <span className="text-sm">{formatCNPJ(company.cnpj)}</span>
              </div>
              
              <div className="flex items-center text-gray-300">
                <span className="text-xs text-gray-400 w-24">Email:</span>
                <span className="text-sm">{company.email}</span>
              </div>
              
              <div className="flex items-center text-gray-300">
                <span className="text-xs text-gray-400 w-24">Telefone:</span>
                <span className="text-sm">{formatPhoneNumber(company.telefone)}</span>
              </div>
              
              <div className="flex items-center text-gray-300">
                <span className="text-xs text-gray-400 w-24">Contrato:</span>
                <span className="text-sm">
                  {calculateContractTime(company.data_inicio_contrato)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-dark-800">
              <button
                onClick={() => onEdit(company)}
                className="px-3 py-2 text-sm text-primary-400 hover:text-primary-300 hover:bg-dark-800 rounded-lg transition-colors flex items-center"
              >
                <Pencil size={16} className="mr-2" />
                Editar
              </button>
              <button
                onClick={() => onManagePartners(company)}
                className="px-3 py-2 text-sm text-primary-400 hover:text-primary-300 hover:bg-dark-800 rounded-lg transition-colors flex items-center"
              >
                <Users size={16} className="mr-2" />
                Sócios
              </button>
              <button
                onClick={() => onToggleActive(company)}
                className={`px-3 py-2 text-sm ${
                  company.ativo 
                    ? 'text-red-400 hover:text-red-300' 
                    : 'text-green-400 hover:text-green-300'
                } hover:bg-dark-800 rounded-lg transition-colors flex items-center`}
              >
                <Power size={16} className="mr-2" />
                {company.ativo ? 'Desativar' : 'Ativar'}
              </button>
              <button
                onClick={() => onDelete(company.id)}
                className="px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-dark-800 rounded-lg transition-colors flex items-center"
              >
                <Trash2 size={16} className="mr-2" />
                Excluir
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CompanyList;