export interface Service {
  id: string;
  empresa_id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  criado_em: string;
  modificado_em: string;
}

export interface CreateServiceDTO {
  empresa_id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  ativo?: boolean;
}