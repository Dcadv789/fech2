/*
  # Criar tabelas de indicadores e relacionamentos

  1. Novas Tabelas
    - `indicadores`
      - Armazena os indicadores base do sistema
      - Suporta diferentes tipos de estrutura e dados
    - `indicadores_empresas`
      - Relacionamento entre indicadores e empresas
    - `indicadores_composicao`
      - Permite composição de indicadores
      - Implementa regra de negócio para composição exclusiva

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para usuários autenticados
*/

-- Create indicadores table
CREATE TABLE IF NOT EXISTS indicadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  nome text NOT NULL,
  descricao text,
  tipo_estrutura text NOT NULL CHECK (tipo_estrutura IN ('Composto', 'Único')),
  tipo_dado text NOT NULL CHECK (tipo_dado IN ('Moeda', 'Número', 'Percentual')),
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  modificado_em timestamptz DEFAULT now()
);

-- Create indicadores_empresas table
CREATE TABLE IF NOT EXISTS indicadores_empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicador_id uuid NOT NULL REFERENCES indicadores(id),
  empresa_id uuid NOT NULL REFERENCES empresas(id),
  criado_em timestamptz DEFAULT now(),
  modificado_em timestamptz DEFAULT now(),
  UNIQUE(indicador_id, empresa_id)
);

-- Create indicadores_composicao table with exclusive component constraint
CREATE TABLE IF NOT EXISTS indicadores_composicao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicador_base_id uuid NOT NULL REFERENCES indicadores(id),
  componente_indicador_id uuid REFERENCES indicadores(id),
  componente_categoria_id uuid REFERENCES categorias(id),
  criado_em timestamptz DEFAULT now(),
  modificado_em timestamptz DEFAULT now(),
  CHECK (
    (componente_indicador_id IS NOT NULL AND componente_categoria_id IS NULL)
    OR
    (componente_indicador_id IS NULL AND componente_categoria_id IS NOT NULL)
  )
);

-- Create triggers for all tables
CREATE TRIGGER update_indicadores_modificado_em
  BEFORE UPDATE ON indicadores
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();

CREATE TRIGGER update_indicadores_empresas_modificado_em
  BEFORE UPDATE ON indicadores_empresas
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();

CREATE TRIGGER update_indicadores_composicao_modificado_em
  BEFORE UPDATE ON indicadores_composicao
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();

-- Enable RLS on all tables
ALTER TABLE indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicadores_empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicadores_composicao ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for indicadores
CREATE POLICY "Usuários autenticados podem ler indicadores"
  ON indicadores
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir indicadores"
  ON indicadores
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar indicadores"
  ON indicadores
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for indicadores_empresas
CREATE POLICY "Usuários autenticados podem ler relacionamentos indicador-empresa"
  ON indicadores_empresas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir relacionamentos indicador-empresa"
  ON indicadores_empresas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar relacionamentos indicador-empresa"
  ON indicadores_empresas
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for indicadores_composicao
CREATE POLICY "Usuários autenticados podem ler composições de indicadores"
  ON indicadores_composicao
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir composições de indicadores"
  ON indicadores_composicao
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar composições de indicadores"
  ON indicadores_composicao
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);