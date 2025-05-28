/*
  # Criar tabela de lançamentos financeiros

  1. Nova Tabela
    - `lancamentos`
      - `id` (uuid, chave primária)
      - `categoria_id` (uuid, FK para categorias)
      - `indicador_id` (uuid, FK para indicadores)
      - `cliente_id` (uuid, FK para clientes)
      - `empresa_id` (uuid, FK para empresas)
      - `descricao` (text)
      - `tipo` (text: 'Receita' ou 'Despesa')
      - `valor` (numeric)
      - `mes` (integer: 1-12)
      - `ano` (integer)
      - `criado_em` (timestamptz)
      - `modificado_em` (timestamptz)

  2. Regras
    - Apenas um entre categoria_id, indicador_id ou cliente_id pode ser preenchido
    - Empresa_id é obrigatório
    - Mês deve estar entre 1 e 12

  3. Índices
    - Otimizados para filtros comuns em relatórios

  4. Segurança
    - Habilitar RLS
    - Políticas para usuários autenticados
*/

-- Criar tabela lancamentos
CREATE TABLE IF NOT EXISTS lancamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id uuid REFERENCES categorias(id),
  indicador_id uuid REFERENCES indicadores(id),
  cliente_id uuid REFERENCES clientes(id),
  empresa_id uuid NOT NULL REFERENCES empresas(id),
  descricao text,
  tipo text NOT NULL CHECK (tipo IN ('Receita', 'Despesa')),
  valor numeric NOT NULL,
  mes integer NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano integer NOT NULL,
  criado_em timestamptz DEFAULT now(),
  modificado_em timestamptz DEFAULT now(),
  -- Garantir que apenas um dos campos (categoria_id, indicador_id, cliente_id) esteja preenchido
  CONSTRAINT check_apenas_um_preenchido CHECK (
    (CASE WHEN categoria_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN indicador_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN cliente_id IS NOT NULL THEN 1 ELSE 0 END) = 1
  )
);

-- Criar índices para otimização de consultas
CREATE INDEX idx_lancamentos_empresa_id ON lancamentos(empresa_id);
CREATE INDEX idx_lancamentos_tipo ON lancamentos(tipo);
CREATE INDEX idx_lancamentos_mes_ano ON lancamentos(empresa_id, ano, mes);
CREATE INDEX idx_lancamentos_categoria ON lancamentos(categoria_id) WHERE categoria_id IS NOT NULL;
CREATE INDEX idx_lancamentos_indicador ON lancamentos(indicador_id) WHERE indicador_id IS NOT NULL;
CREATE INDEX idx_lancamentos_cliente ON lancamentos(cliente_id) WHERE cliente_id IS NOT NULL;

-- Criar trigger para atualização automática do modificado_em
CREATE TRIGGER update_lancamentos_modificado_em
  BEFORE UPDATE ON lancamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();

-- Habilitar RLS
ALTER TABLE lancamentos ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Usuários autenticados podem ler lançamentos"
  ON lancamentos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir lançamentos"
  ON lancamentos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar lançamentos"
  ON lancamentos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);