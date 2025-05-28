/*
  # Criar tabela de clientes

  1. Nova Tabela
    - `clientes`
      - `id` (uuid, chave primária)
      - `codigo` (text, obrigatório)
      - `razao_social` (text, obrigatório)
      - `nome_fantasia` (text, opcional)
      - `cnpj` (text, obrigatório)
      - `empresa_id` (uuid, chave estrangeira para empresas)
      - `ativo` (boolean)
      - `criado_em` (timestamptz)
      - `modificado_em` (timestamptz)

  2. Segurança
    - Habilitar RLS na tabela
    - Adicionar políticas para usuários autenticados
*/

-- Criar tabela clientes
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  razao_social text NOT NULL,
  nome_fantasia text,
  cnpj text NOT NULL,
  empresa_id uuid NOT NULL REFERENCES empresas(id),
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  modificado_em timestamptz DEFAULT now()
);

-- Criar índice para busca eficiente por empresa_id
CREATE INDEX idx_clientes_empresa_id ON clientes(empresa_id);

-- Criar trigger para atualização automática do modificado_em
CREATE TRIGGER update_clientes_modificado_em
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();

-- Habilitar RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Usuários autenticados podem ler clientes"
  ON clientes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir clientes"
  ON clientes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar clientes"
  ON clientes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);