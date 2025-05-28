export interface Client {
  id: string;
  codigo: string;
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string;
  empresa_id: string;
  ativo: boolean;
  criado_em: string;
  modificado_em: string;
}

export interface CreateClientDTO {
  codigo: string;
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  empresa_id: string;
  ativo?: boolean;
}