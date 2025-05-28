/*
  # Create categories tables and relationships

  1. New Tables
    - `categorias_grupo` (Category Groups)
      - `id` (uuid, primary key)
      - `nome` (text)
      - `descricao` (text)
      - `ativo` (boolean)
      - `criado_em` (timestamptz)
      - `modificado_em` (timestamptz)

    - `categorias` (Categories)
      - `id` (uuid, primary key)
      - `codigo` (text)
      - `nome` (text)
      - `descricao` (text)
      - `tipo` (text, enum: "Receita" or "Despesa")
      - `ativo` (boolean)
      - `grupo_id` (uuid, foreign key to categorias_grupo)
      - `criado_em` (timestamptz)
      - `modificado_em` (timestamptz)

    - `categorias_empresas` (Categories-Companies relationship)
      - `id` (uuid, primary key)
      - `categoria_id` (uuid, foreign key to categorias)
      - `empresa_id` (uuid, foreign key to empresas)
      - `criado_em` (timestamptz)
      - `modificado_em` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create trigger function for updating modificado_em
CREATE OR REPLACE FUNCTION update_modificado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.modificado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create categorias_grupo table
CREATE TABLE IF NOT EXISTS categorias_grupo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  modificado_em timestamptz DEFAULT now()
);

-- Create trigger for categorias_grupo
CREATE TRIGGER update_categorias_grupo_modificado_em
  BEFORE UPDATE ON categorias_grupo
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();

-- Create categorias table
CREATE TABLE IF NOT EXISTS categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  nome text NOT NULL,
  descricao text,
  tipo text NOT NULL CHECK (tipo IN ('Receita', 'Despesa')),
  ativo boolean DEFAULT true,
  grupo_id uuid REFERENCES categorias_grupo(id),
  criado_em timestamptz DEFAULT now(),
  modificado_em timestamptz DEFAULT now()
);

-- Create trigger for categorias
CREATE TRIGGER update_categorias_modificado_em
  BEFORE UPDATE ON categorias
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();

-- Create categorias_empresas table
CREATE TABLE IF NOT EXISTS categorias_empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id uuid NOT NULL REFERENCES categorias(id),
  empresa_id uuid NOT NULL REFERENCES empresas(id),
  criado_em timestamptz DEFAULT now(),
  modificado_em timestamptz DEFAULT now(),
  UNIQUE(categoria_id, empresa_id)
);

-- Create trigger for categorias_empresas
CREATE TRIGGER update_categorias_empresas_modificado_em
  BEFORE UPDATE ON categorias_empresas
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();

-- Enable RLS on all tables
ALTER TABLE categorias_grupo ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_empresas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for categorias_grupo
CREATE POLICY "Usuários autenticados podem ler grupos de categorias"
  ON categorias_grupo
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir grupos de categorias"
  ON categorias_grupo
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar grupos de categorias"
  ON categorias_grupo
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for categorias
CREATE POLICY "Usuários autenticados podem ler categorias"
  ON categorias
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir categorias"
  ON categorias
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar categorias"
  ON categorias
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for categorias_empresas
CREATE POLICY "Usuários autenticados podem ler relacionamentos categoria-empresa"
  ON categorias_empresas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir relacionamentos categoria-empresa"
  ON categorias_empresas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar relacionamentos categoria-empresa"
  ON categorias_empresas
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);