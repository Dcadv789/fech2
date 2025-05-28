/*
  # Criar tabelas relacionadas a vendas

  1. Novas Tabelas
    - `pessoas`
      - Armazena informações de pessoas (vendedores e SDRs)
      - Campos para identificação (código, nome, documentos)
      - Campos de contato (email, telefone)
      
    - `servicos`
      - Cadastro de serviços oferecidos
      - Informações básicas como código, nome e descrição
      
    - `registro_de_vendas`
      - Registro de vendas realizadas
      - Relacionamentos com clientes, vendedores, SDRs e serviços
      - Informações da venda como valor e origem

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para usuários autenticados
*/

-- Criar tabela pessoas
CREATE TABLE IF NOT EXISTS pessoas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id),
  codigo varchar(50) NOT NULL,
  nome varchar(255) NOT NULL,
  cpf varchar(14),
  cnpj varchar(18),
  email varchar(255),
  telefone varchar(20),
  criado_em timestamptz DEFAULT now(),
  modificado_em timestamptz DEFAULT now()
);

-- Criar índice para busca eficiente por empresa_id em pessoas
CREATE INDEX idx_pessoas_empresa_id ON pessoas(empresa_id);

-- Criar trigger para pessoas
CREATE TRIGGER update_pessoas_modificado_em
  BEFORE UPDATE ON pessoas
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();

-- Criar tabela servicos
CREATE TABLE IF NOT EXISTS servicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id),
  codigo varchar(50) NOT NULL,
  nome varchar(255) NOT NULL,
  descricao text,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  modificado_em timestamptz DEFAULT now()
);

-- Criar índice para busca eficiente por empresa_id em servicos
CREATE INDEX idx_servicos_empresa_id ON servicos(empresa_id);

-- Criar trigger para servicos
CREATE TRIGGER update_servicos_modificado_em
  BEFORE UPDATE ON servicos
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();

-- Criar tabela registro_de_vendas
CREATE TABLE IF NOT EXISTS registro_de_vendas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id),
  cliente_id uuid REFERENCES clientes(id),
  vendedor_id uuid REFERENCES pessoas(id),
  sdr_id uuid REFERENCES pessoas(id),
  servico_id uuid NOT NULL REFERENCES servicos(id),
  valor numeric(10,2) NOT NULL,
  origem text NOT NULL CHECK (origem IN ('Brasil', 'Exterior')),
  nome_cliente varchar(255),
  registro_venda text,
  data_venda date NOT NULL,
  criado_em timestamptz DEFAULT now(),
  modificado_em timestamptz DEFAULT now()
);

-- Criar índices para otimização de consultas em registro_de_vendas
CREATE INDEX idx_registro_vendas_empresa_id ON registro_de_vendas(empresa_id);
CREATE INDEX idx_registro_vendas_cliente_id ON registro_de_vendas(cliente_id);
CREATE INDEX idx_registro_vendas_vendedor_id ON registro_de_vendas(vendedor_id);
CREATE INDEX idx_registro_vendas_sdr_id ON registro_de_vendas(sdr_id);
CREATE INDEX idx_registro_vendas_servico_id ON registro_de_vendas(servico_id);
CREATE INDEX idx_registro_vendas_data ON registro_de_vendas(data_venda);

-- Criar trigger para registro_de_vendas
CREATE TRIGGER update_registro_vendas_modificado_em
  BEFORE UPDATE ON registro_de_vendas
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();

-- Habilitar RLS em todas as tabelas
ALTER TABLE pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_de_vendas ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso para pessoas
CREATE POLICY "Usuários autenticados podem ler pessoas"
  ON pessoas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir pessoas"
  ON pessoas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar pessoas"
  ON pessoas
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Criar políticas de acesso para servicos
CREATE POLICY "Usuários autenticados podem ler serviços"
  ON servicos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir serviços"
  ON servicos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar serviços"
  ON servicos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Criar políticas de acesso para registro_de_vendas
CREATE POLICY "Usuários autenticados podem ler registro de vendas"
  ON registro_de_vendas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir registro de vendas"
  ON registro_de_vendas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar registro de vendas"
  ON registro_de_vendas
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);