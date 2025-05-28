export interface Partner {
  id: string;
  empresa_id: string;
  nome: string;
  cpf: string;
  percentual: number;
  email?: string;
  telefone?: string;
  criado_em: string;
  modificado_em: string;
}

export interface CreatePartnerDTO {
  empresa_id: string;
  nome: string;
  cpf: string;
  percentual: number;
  email?: string;
  telefone?: string;
}