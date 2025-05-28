/*
  # Criar tabela empresas

  1. Nova Tabela
    - `empresas`
      - `id` (uuid, chave primária)
      - `razao_social` (text)
      - `nome_fantasia` (text)
      - `cnpj` (text)
      - `url_logo` (text)
      - `email` (text)
      - `telefone` (text)
      - `data_inicio_contrato` (date)
      - `ativo` (boolean)
      - `criado_em` (timestamptz)
      - `modificado_em` (timestamptz)

  2. Segurança
    - Habilitar RLS na tabela
    - Adicionar política para usuários autenticados
*/

CREATE TABLE IF NOT EXISTS empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social text NOT NULL,
  nome_fantasia text,
  cnpj text NOT NULL,
  url_logo text,
  email text,
  telefone text,
  data_inicio_contrato date,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  modificado_em timestamptz DEFAULT now()
);

-- Criar trigger para atualizar modificado_em automaticamente
CREATE OR REPLACE FUNCTION update_modificado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.modificado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_empresas_modificado_em
  BEFORE UPDATE ON empresas
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();

-- Habilitar RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Usuários autenticados podem ler empresas"
  ON empresas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir empresas"
  ON empresas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar empresas"
  ON empresas
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);