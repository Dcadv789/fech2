import { supabase } from '../lib/supabase';
import { Service, CreateServiceDTO } from '../types/service';

export const serviceService = {
  async getServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .order('codigo');

    if (error) throw error;
    return data || [];
  },

  async createService(service: CreateServiceDTO): Promise<Service> {
    const { data, error } = await supabase
      .from('servicos')
      .insert(service)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateService(id: string, service: Partial<CreateServiceDTO>): Promise<Service> {
    const { data, error } = await supabase
      .from('servicos')
      .update(service)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleServiceActive(id: string, ativo: boolean): Promise<void> {
    const { error } = await supabase
      .from('servicos')
      .update({ ativo })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteService(id: string): Promise<void> {
    const { error } = await supabase
      .from('servicos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getNextCode(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('codigo')
        .order('codigo', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        return 'S0001';
      }

      const lastCode = data[0].codigo;
      const lastNumber = parseInt(lastCode.substring(1));
      const nextNumber = lastNumber + 1;
      
      return `S${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Erro ao gerar próximo código:', error);
      throw error;
    }
  }
};