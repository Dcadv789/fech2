import { supabase } from '../lib/supabase';

export const widgetService = {
  async getWidgetsByPage(pagina: string, empresaId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('config_visualizacoes')
      .select(`
        *,
        config_visualizacoes_empresas!inner(empresa_id)
      `)
      .eq('pagina', pagina)
      .eq('config_visualizacoes_empresas.empresa_id', empresaId)
      .order('ordem');

    if (error) throw error;
    return data || [];
  },

  async toggleWidgetActive(id: string, ativo: boolean): Promise<void> {
    const { error } = await supabase
      .from('config_visualizacoes')
      .update({ ativo })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteWidget(id: string): Promise<void> {
    const { error } = await supabase
      .from('config_visualizacoes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};