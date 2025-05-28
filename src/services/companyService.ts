import { supabase } from '../lib/supabase';
import { Company, CreateCompanyDTO } from '../types/company';

export const companyService = {
  async getCompanies(): Promise<Company[]> {
    try {
      console.log('Iniciando busca de empresas...');
      
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('razao_social');

      if (error) {
        console.error('Erro ao buscar empresas:', error.message);
        throw error;
      }

      if (!data) {
        console.log('Nenhuma empresa encontrada');
        return [];
      }

      console.log('Empresas encontradas:', data.length);
      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar empresas:', error);
      throw error;
    }
  },

  async createCompany(company: CreateCompanyDTO): Promise<Company> {
    const { data, error } = await supabase
      .from('empresas')
      .insert(company)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCompany(id: string, company: Partial<CreateCompanyDTO>): Promise<Company> {
    const { data, error } = await supabase
      .from('empresas')
      .update(company)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCompany(id: string): Promise<void> {
    const { error } = await supabase
      .from('empresas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async deactivateCompany(id: string, deactivationDate: string): Promise<Company> {
    // Converter a data para o fuso horário de São Paulo
    const date = new Date(deactivationDate);
    const spDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    
    const { data, error } = await supabase
      .from('empresas')
      .update({
        ativo: false,
        data_desativacao: spDate.toISOString().split('T')[0]
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async activateCompany(id: string): Promise<Company> {
    const { data, error } = await supabase
      .from('empresas')
      .update({
        ativo: true,
        data_desativacao: null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};