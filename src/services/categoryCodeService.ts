import { supabase } from '../lib/supabase';

export const categoryCodeService = {
  async getNextCode(tipo: 'Receita' | 'Despesa'): Promise<string> {
    try {
      const prefix = tipo === 'Receita' ? 'R' : 'D';
      
      // Buscar última categoria do tipo específico
      const { data, error } = await supabase
        .from('categorias')
        .select('codigo')
        .eq('tipo', tipo)
        .order('codigo', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        return `${prefix}0001`; // Primeiro código
      }

      // Extrair o número do último código e incrementar
      const lastCode = data[0].codigo;
      const lastNumber = parseInt(lastCode.substring(1));
      const nextNumber = lastNumber + 1;
      
      // Formatar com zeros à esquerda
      return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Erro ao gerar próximo código:', error);
      throw error;
    }
  }
};