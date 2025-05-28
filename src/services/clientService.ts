import { supabase } from '../lib/supabase';
import { Client, CreateClientDTO } from '../types/client';

export const clientService = {
  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        empresa:empresas(razao_social)
      `)
      .order('razao_social');

    if (error) throw error;
    return data || [];
  },

  async createClient(client: CreateClientDTO): Promise<Client> {
    const { data, error } = await supabase
      .from('clientes')
      .insert(client)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateClient(id: string, client: Partial<CreateClientDTO>): Promise<Client> {
    const { data, error } = await supabase
      .from('clientes')
      .update(client)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleClientActive(id: string, ativo: boolean): Promise<void> {
    const { error } = await supabase
      .from('clientes')
      .update({ ativo })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteClient(id: string): Promise<void> {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getNextCode(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('codigo')
        .order('codigo', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        return 'C0001';
      }

      const lastCode = data[0].codigo;
      const lastNumber = parseInt(lastCode.substring(1));
      const nextNumber = lastNumber + 1;
      
      return `C${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Erro ao gerar próximo código:', error);
      throw error;
    }
  },

  async checkCodeExists(code: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('clientes')
        .select('id')
        .eq('codigo', code);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query.limit(1);

      if (error) {
        console.error('Error checking code existence:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking code existence:', error);
      return false;
    }
  }
};