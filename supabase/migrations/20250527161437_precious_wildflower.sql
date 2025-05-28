/*
  # Criar tabela de uploads

  1. Nova Tabela
    - `uploads`
      - Armazena informações sobre arquivos enviados
      - Vincula uploads com empresas e usuários
      - Rastreia diferentes tipos de upload
      - Mantém referência ao arquivo no Storage

  2. Segurança
    - RLS habilitado
    - Políticas para usuários autenticados
*/

-- Criar tabela uploads
CREATE TABLE IF NOT EXISTS uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id),
  usuario_id uuid NOT NULL REFERENCES usuarios(id),
  tipo_upload text NOT NULL CHECK (tipo_upload IN ('lancamentos', 'lancamentos_clientes', 'vendas')),
  nome_arquivo text NOT NULL,
  caminho_arquivo text NOT NULL,
  criado_em timestamptz DEFAULT now(),
  modificado_em timestamptz DEFAULT now()
);

-- Criar índices para otimização
CREATE INDEX idx_uploads_empresa_id ON uploads(empresa_id);
CREATE INDEX idx_uploads_usuario_id ON uploads(usuario_id);
CREATE INDEX idx_uploads_tipo ON uploads(tipo_upload);

-- Criar trigger para atualização automática do modificado_em
CREATE TRIGGER update_uploads_modificado_em
  BEFORE UPDATE ON uploads
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();

-- Habilitar RLS
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Usuários podem ver uploads da própria empresa"
  ON uploads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_id = auth.uid()
      AND (
        -- Se for cliente, só vê uploads da própria empresa
        (role = 'cliente' AND empresa_id = uploads.empresa_id)
        OR
        -- Se for master, vê todos os uploads
        (role = 'master')
        OR
        -- Se for consultor, vê uploads das empresas que atende
        (role = 'consultor' AND EXISTS (
          SELECT 1 FROM empresas_consultores
          WHERE consultor_id = usuarios.id
          AND empresa_id = uploads.empresa_id
        ))
      )
    )
  );

CREATE POLICY "Usuários podem criar uploads para sua empresa"
  ON uploads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_id = auth.uid()
      AND (
        -- Cliente só pode criar para própria empresa
        (role = 'cliente' AND empresa_id = uploads.empresa_id)
        OR
        -- Master pode criar para qualquer empresa
        (role = 'master')
        OR
        -- Consultor pode criar para empresas que atende
        (role = 'consultor' AND EXISTS (
          SELECT 1 FROM empresas_consultores
          WHERE consultor_id = usuarios.id
          AND empresa_id = uploads.empresa_id
        ))
      )
    )
  );

CREATE POLICY "Usuários podem atualizar uploads que criaram"
  ON uploads
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_id = auth.uid()
      AND id = uploads.usuario_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_id = auth.uid()
      AND id = uploads.usuario_id
    )
  );