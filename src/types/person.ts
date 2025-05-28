export interface Person {
  id: string;
  empresa_id: string;
  codigo: string;
  nome: string;
  cpf: string | null;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  cargo: 'Vendedor' | 'SDR' | 'Ambos';
  criado_em: string;
  modificado_em: string;
}

export interface CreatePersonDTO {
  empresa_id: string;
  codigo: string;
  nome: string;
  cpf?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  cargo: 'Vendedor' | 'SDR' | 'Ambos';
}