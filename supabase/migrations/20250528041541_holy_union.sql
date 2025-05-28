/*
  # Remover coluna empresa_id da tabela config_visualizacoes

  1. Alterações
    - Remover políticas que dependem da coluna empresa_id
    - Remover a restrição NOT NULL
    - Remover a coluna empresa_id
    - Criar novas políticas usando a tabela de relacionamento
*/

-- Remover políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver configurações da própria empresa" ON config_visualizacoes;
DROP POLICY IF EXISTS "Usuários podem gerenciar configurações da própria empresa" ON config_visualizacoes;

-- Remover a restrição NOT NULL
ALTER TABLE config_visualizacoes
ALTER COLUMN empresa_id DROP NOT NULL;

-- Remover a coluna
ALTER TABLE config_visualizacoes
DROP COLUMN empresa_id;

-- Criar novas políticas usando a tabela de relacionamento
CREATE POLICY "Usuários podem ver configurações"
  ON config_visualizacoes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM config_visualizacoes_empresas cve
      JOIN usuarios u ON u.empresa_id = cve.empresa_id
      WHERE cve.visualizacao_id = config_visualizacoes.id
      AND u.auth_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_id = auth.uid()
      AND u.role = 'master'
    )
    OR
    EXISTS (
      SELECT 1 FROM usuarios u
      JOIN empresas_consultores ec ON ec.consultor_id = u.id
      JOIN config_visualizacoes_empresas cve ON cve.empresa_id = ec.empresa_id
      WHERE u.auth_id = auth.uid()
      AND u.role = 'consultor'
      AND cve.visualizacao_id = config_visualizacoes.id
    )
  );

CREATE POLICY "Usuários podem gerenciar configurações"
  ON config_visualizacoes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM config_visualizacoes_empresas cve
      JOIN usuarios u ON u.empresa_id = cve.empresa_id
      WHERE cve.visualizacao_id = config_visualizacoes.id
      AND u.auth_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_id = auth.uid()
      AND u.role = 'master'
    )
    OR
    EXISTS (
      SELECT 1 FROM usuarios u
      JOIN empresas_consultores ec ON ec.consultor_id = u.id
      JOIN config_visualizacoes_empresas cve ON cve.empresa_id = ec.empresa_id
      WHERE u.auth_id = auth.uid()
      AND u.role = 'consultor'
      AND cve.visualizacao_id = config_visualizacoes.id
    )
  );