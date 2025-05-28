export interface CategoryGroup {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  criado_em: string;
  modificado_em: string;
}

export interface CreateCategoryGroupDTO {
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export interface Category {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  tipo: 'Receita' | 'Despesa';
  ativo: boolean;
  grupo_id: string;
  criado_em: string;
  modificado_em: string;
}

export interface CreateCategoryDTO {
  codigo: string;
  nome: string;
  descricao?: string;
  tipo: 'Receita' | 'Despesa';
  grupo_id: string;
  ativo?: boolean;
}