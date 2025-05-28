export interface Transaction {
  id: string;
  categoria_id?: string;
  indicador_id?: string;
  cliente_id?: string;
  empresa_id: string;
  descricao: string;
  tipo: 'Receita' | 'Despesa';
  valor: number;
  mes: number;
  ano: number;
  criado_em: string;
  modificado_em: string;
}

export interface CreateTransactionDTO {
  categoria_id?: string;
  indicador_id?: string;
  cliente_id?: string;
  empresa_id: string;
  descricao: string;
  tipo: 'Receita' | 'Despesa';
  valor: number;
  mes: number;
  ano: number;
}