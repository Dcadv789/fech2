/*
  # Criar tabela de sócios

  1. Nova Tabela
    - `socios`
      - `id` (uuid, chave primária)
      - `empresa_id` (uuid, chave estrangeira para empresas)
      - `nome` (text)
      - `cpf` (text)
      - `percentual` (numeric)
      - `email` (text, opcional)
      - `telefone` (text, opcional)
      - `criado_em` (timestamptz)
      - `modificado_em` (timestamptz)

  2. Segurança
    - Habilitar RLS na tabela
    - Adicionar políticas para usuários autenticados
*/

-- Create socios table
CREATE TABLE IF NOT EXISTS socios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id),
  nome text NOT NULL,
  cpf text NOT NULL,
  percentual numeric NOT NULL,
  email text,
  telefone text,
  criado_em timestamptz DEFAULT now(),
  modificado_em timestamptz DEFAULT now()
);

-- Create index for efficient querying by empresa_id
CREATE INDEX idx_socios_empresa_id ON socios(empresa_id);

-- Create trigger for socios
CREATE TRIGGER update_socios_modificado_em
  BEFORE UPDATE ON socios
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();

-- Enable RLS
ALTER TABLE socios ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Usuários autenticados podem ler sócios"
  ON socios
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir sócios"
  ON socios
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar sócios"
  ON socios
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);