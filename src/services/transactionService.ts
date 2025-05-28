import { supabase } from '../lib/supabase';
import { Transaction, CreateTransactionDTO } from '../types/transaction';

export const transactionService = {
  async getTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('lancamentos')
      .select(`
        *,
        empresa:empresas(razao_social)
      `)
      .order('ano', { ascending: false })
      .order('mes', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createTransaction(transaction: CreateTransactionDTO): Promise<Transaction> {
    const { data, error } = await supabase
      .from('lancamentos')
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTransaction(id: string, transaction: Partial<CreateTransactionDTO>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('lancamentos')
      .update(transaction)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('lancamentos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};