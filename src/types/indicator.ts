export interface Indicator {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  tipo_estrutura: 'Composto' | 'Único';
  tipo_dado: 'Moeda' | 'Número' | 'Percentual';
  ativo: boolean;
  criado_em: string;
  modificado_em: string;
}

export interface CreateIndicatorDTO {
  codigo: string;
  nome: string;
  descricao?: string;
  tipo_estrutura: 'Composto' | 'Único';
  tipo_dado: 'Moeda' | 'Número' | 'Percentual';
  ativo?: boolean;
}