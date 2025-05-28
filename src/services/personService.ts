import { supabase } from '../lib/supabase';
import { Person, CreatePersonDTO } from '../types/person';

export const personService = {
  async getPeople(): Promise<Person[]> {
    const { data, error } = await supabase
      .from('pessoas')
      .select(`
        *,
        empresa:empresas(razao_social)
      `)
      .order('nome');

    if (error) throw error;
    return data || [];
  },

  async createPerson(person: CreatePersonDTO): Promise<Person> {
    const { data, error } = await supabase
      .from('pessoas')
      .insert(person)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePerson(id: string, person: Partial<CreatePersonDTO>): Promise<Person> {
    const { data, error } = await supabase
      .from('pessoas')
      .update(person)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePerson(id: string): Promise<void> {
    const { error } = await supabase
      .from('pessoas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getNextCode(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('pessoas')
        .select('codigo')
        .order('codigo', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        return 'P0001';
      }

      const lastCode = data[0].codigo;
      const lastNumber = parseInt(lastCode.substring(1));
      const nextNumber = lastNumber + 1;
      
      return `P${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Erro ao gerar próximo código:', error);
      throw error;
    }
  }
};