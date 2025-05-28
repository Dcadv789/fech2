import React, { useState, useEffect } from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CompanySelectProps {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const CompanySelect: React.FC<CompanySelectProps> = ({ className = '', value, onChange }) => {
  const [companies, setCompanies] = useState<{ id: string; razao_social: string; }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, razao_social')
        .order('razao_social');

      if (error) throw error;
      setCompanies(data || []);
      
      // Se não houver valor selecionado e houver empresas, selecionar a primeira
      if (!value && data && data.length > 0 && onChange) {
        onChange(data[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative flex items-center gap-2 min-w-[300px] ${className}`}>
      <Building2 size={20} className="text-gray-400 flex-shrink-0" />
      <div className="relative flex-1">
        <select 
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full appearance-none px-4 py-2 pr-10 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
          disabled={isLoading}
        >
          <option value="">Todas as empresas</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.razao_social}
            </option>
          ))}
        </select>
        <ChevronDown 
          size={16} 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
        />
      </div>
    </div>
  );
};

export default CompanySelect;