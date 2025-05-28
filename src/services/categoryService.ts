import { supabase } from '../lib/supabase';
import { CategoryGroup, CreateCategoryGroupDTO, Category, CreateCategoryDTO } from '../types/category';

export const categoryService = {
  async getCategoryGroups(): Promise<CategoryGroup[]> {
    const { data, error } = await supabase
      .from('categorias_grupo')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data || [];
  },

  async createCategoryGroup(group: CreateCategoryGroupDTO): Promise<CategoryGroup> {
    const { data, error } = await supabase
      .from('categorias_grupo')
      .insert(group)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categorias')
      .select(`
        *,
        grupo:categorias_grupo(id, nome)
      `)
      .order('grupo_id, codigo');

    if (error) throw error;
    return data || [];
  },

  async createCategory(category: CreateCategoryDTO): Promise<Category> {
    const { data, error } = await supabase
      .from('categorias')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCategory(id: string, category: CreateCategoryDTO): Promise<Category> {
    const { data, error } = await supabase
      .from('categorias')
      .update(category)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleCategoryActive(id: string, ativo: boolean): Promise<void> {
    const { error } = await supabase
      .from('categorias')
      .update({ ativo })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async deleteGroup(id: string): Promise<void> {
    const { error } = await supabase
      .from('categorias_grupo')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getCategoryCompanies(categoryId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('categorias_empresas')
      .select(`
        *,
        empresa:empresas(id, razao_social)
      `)
      .eq('categoria_id', categoryId);

    if (error) throw error;
    return data || [];
  },

  async linkCategoryToCompany(categoryId: string, empresaId: string): Promise<void> {
    const { error } = await supabase
      .from('categorias_empresas')
      .insert({ categoria_id: categoryId, empresa_id: empresaId });

    if (error) throw error;
  },

  async unlinkCategoryFromCompany(categoryId: string, empresaId: string): Promise<void> {
    const { error } = await supabase
      .from('categorias_empresas')
      .delete()
      .eq('categoria_id', categoryId)
      .eq('empresa_id', empresaId);

    if (error) throw error;
  },

  async bulkLinkCategoriesToCompany(categoryIds: string[], empresaId: string): Promise<void> {
    const links = categoryIds.map(categoryId => ({
      categoria_id: categoryId,
      empresa_id: empresaId
    }));

    const { error } = await supabase
      .from('categorias_empresas')
      .insert(links);

    if (error) throw error;
  }
};