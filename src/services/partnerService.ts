import { supabase } from '../lib/supabase';
import { Partner, CreatePartnerDTO } from '../types/partner';

export const partnerService = {
  async getPartnersByCompany(empresaId: string): Promise<Partner[]> {
    try {
      console.log('Buscando sócios para empresa:', empresaId);
      
      const { data, error } = await supabase
        .from('socios')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('nome');

      if (error) {
        console.error('Erro ao buscar sócios:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro inesperado ao buscar sócios:', error);
      throw error;
    }
  },

  async createPartner(partner: CreatePartnerDTO): Promise<Partner> {
    try {
      console.log('Criando sócio:', partner);

      if (!partner.empresa_id) {
        throw new Error('ID da empresa é obrigatório');
      }

      if (typeof partner.percentual !== 'number' || isNaN(partner.percentual)) {
        throw new Error('Percentual inválido');
      }

      const { data, error } = await supabase
        .from('socios')
        .insert([partner])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar sócio:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Erro ao criar sócio: nenhum dado retornado');
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao criar sócio:', error);
      throw error;
    }
  },

  async deletePartner(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('socios')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Erro ao excluir sócio:', error);
      throw error;
    }
  }
};