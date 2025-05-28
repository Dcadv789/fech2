import { supabase } from '../lib/supabase';

export const indicatorCodeService = {
  async getNextCode(): Promise<string> {
    try {
      // Buscar último indicador
      const { data, error } = await supabase
        .from('indicadores')
        .select('codigo')
        .order('codigo', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        return 'I0001'; // Primeiro código
      }

      // Extrair o número do último código e incrementar
      const lastCode = data[0].codigo;
      const lastNumber = parseInt(lastCode.substring(1));
      const nextNumber = lastNumber + 1;
      
      // Formatar com zeros à esquerda
      return `I${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Erro ao gerar próximo código:', error);
      throw error;
    }
  }
};