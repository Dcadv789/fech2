export interface Company {
  id: string;
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string;
  url_logo: string | null;
  email: string;
  telefone: string;
  data_inicio_contrato: string;
  data_desativacao: string | null;
  ativo: boolean;
  criado_em: string;
  modificado_em: string;
}

export interface CreateCompanyDTO {
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  url_logo?: string;
  email: string;
  telefone: string;
  data_inicio_contrato: string;
}