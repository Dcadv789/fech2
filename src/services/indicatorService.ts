import { supabase } from '../lib/supabase';
import { Indicator, CreateIndicatorDTO } from '../types/indicator';

export const indicatorService = {
  async getIndicators(): Promise<Indicator[]> {
    const { data, error } = await supabase
      .from('indicadores')
      .select('*')
      .order('codigo');

    if (error) throw error;
    return data || [];
  },

  async createIndicator(indicator: CreateIndicatorDTO): Promise<Indicator> {
    const { data, error } = await supabase
      .from('indicadores')
      .insert(indicator)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateIndicator(id: string, indicator: CreateIndicatorDTO): Promise<Indicator> {
    const { data, error } = await supabase
      .from('indicadores')
      .update(indicator)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleIndicatorActive(id: string, ativo: boolean): Promise<void> {
    const { error } = await supabase
      .from('indicadores')
      .update({ ativo })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteIndicator(id: string): Promise<void> {
    const { error } = await supabase
      .from('indicadores')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getIndicatorCompanies(indicatorId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('indicadores_empresas')
      .select(`
        *,
        empresa:empresas(id, razao_social)
      `)
      .eq('indicador_id', indicatorId);

    if (error) throw error;
    return data || [];
  },

  async linkIndicatorToCompany(indicatorId: string, empresaId: string): Promise<void> {
    const { error } = await supabase
      .from('indicadores_empresas')
      .insert({ indicador_id: indicatorId, empresa_id: empresaId });

    if (error) throw error;
  },

  async unlinkIndicatorFromCompany(indicatorId: string, empresaId: string): Promise<void> {
    const { error } = await supabase
      .from('indicadores_empresas')
      .delete()
      .eq('indicador_id', indicatorId)
      .eq('empresa_id', empresaId);

    if (error) throw error;
  },

  async getIndicatorComposicao(indicatorId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('indicadores_composicao')
      .select('*')
      .eq('indicador_base_id', indicatorId);

    if (error) throw error;
    return data || [];
  },

  async saveIndicatorCategories(indicatorId: string, categoryIds: string[]): Promise<void> {
    // Primeiro remove composições existentes
    await supabase
      .from('indicadores_composicao')
      .delete()
      .eq('indicador_base_id', indicatorId);

    // Insere novas composições
    const composicoes = categoryIds.map(categoryId => ({
      indicador_base_id: indicatorId,
      componente_categoria_id: categoryId
    }));

    const { error } = await supabase
      .from('indicadores_composicao')
      .insert(composicoes);

    if (error) throw error;
  },

  async saveIndicatorComponents(indicatorId: string, componentIds: string[]): Promise<void> {
    // Primeiro remove composições existentes
    await supabase
      .from('indicadores_composicao')
      .delete()
      .eq('indicador_base_id', indicatorId);

    // Insere novas composições
    const composicoes = componentIds.map(componentId => ({
      indicador_base_id: indicatorId,
      componente_indicador_id: componentId
    }));

    const { error } = await supabase
      .from('indicadores_composicao')
      .insert(composicoes);

    if (error) throw error;
  }
};