/*
  # Criar tabelas de usuários e consultores

  1. Novas Tabelas
    - `usuarios`
      - Dados dos usuários do sistema
      - Vinculação com Supabase Auth
      - Controle de papéis e permissões
    
    - `empresas_consultores`
      - Relacionamento entre consultores e empresas
      - Validações via trigger

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas específicas por tipo de usuário
*/

-- Criar tabela usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid NOT NULL,
  nome text,
  email text NOT NULL UNIQUE,
  telefone text,
  avatar_url text,
  cargo text,
  role text NOT NULL CHECK (role IN ('cliente', 'master', 'consultor')),
  empresa_id uuid REFERENCES empresas(id),
  criado_em timestamptz DEFAULT now(),
  modificado_em timestamptz DEFAULT now(),
  -- Garantir que empresa_id seja obrigatório apenas para clientes
  CONSTRAINT check_empresa_id_cliente CHECK (
    (role = 'cliente' AND empresa_id IS NOT NULL) OR
    (role IN ('master', 'consultor') AND empresa_id IS NULL)
  )
);

-- Criar tabela empresas_consultores
CREATE TABLE IF NOT EXISTS empresas_consultores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultor_id uuid NOT NULL REFERENCES usuarios(id),
  empresa_id uuid NOT NULL REFERENCES empresas(id),
  criado_em timestamptz DEFAULT now(),
  UNIQUE(consultor_id, empresa_id)
);

-- Função para validar que apenas consultores podem ser vinculados
CREATE OR REPLACE FUNCTION validar_consultor()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = NEW.consultor_id AND role = 'consultor'
  ) THEN
    RAISE EXCEPTION 'Apenas consultores podem ser vinculados a empresas';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar consultores antes de inserir ou atualizar
CREATE TRIGGER trigger_validar_consultor
  BEFORE INSERT OR UPDATE ON empresas_consultores
  FOR EACH ROW
  EXECUTE FUNCTION validar_consultor();

-- Criar índices para otimização
CREATE INDEX idx_usuarios_auth_id ON usuarios(auth_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_empresa_id ON usuarios(empresa_id) WHERE empresa_id IS NOT NULL;
CREATE INDEX idx_empresas_consultores_consultor ON empresas_consultores(consultor_id);
CREATE INDEX idx_empresas_consultores_empresa ON empresas_consultores(empresa_id);

-- Criar trigger para atualização automática do modificado_em
CREATE TRIGGER update_usuarios_modificado_em
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas_consultores ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Usuários podem ver seu próprio registro"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Masters podem ver todos os usuários"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_id = auth.uid()
      AND role = 'master'
    )
  );

CREATE POLICY "Consultores podem ver usuários das empresas que atendem"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      JOIN empresas_consultores ec ON ec.consultor_id = u.id
      WHERE u.auth_id = auth.uid()
      AND u.role = 'consultor'
      AND usuarios.empresa_id = ec.empresa_id
    )
  );

-- Políticas para empresas_consultores
CREATE POLICY "Masters podem gerenciar todas as relações consultor-empresa"
  ON empresas_consultores
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_id = auth.uid()
      AND role = 'master'
    )
  );

CREATE POLICY "Consultores podem ver suas próprias empresas"
  ON empresas_consultores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_id = auth.uid()
      AND id = empresas_consultores.consultor_id
      AND role = 'consultor'
    )
  );