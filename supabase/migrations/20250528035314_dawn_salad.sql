-- Remover políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver componentes das visualizações que têm acesso" ON config_visualizacoes_componentes;
DROP POLICY IF EXISTS "Usuários podem gerenciar componentes das visualizações que têm acesso" ON config_visualizacoes_componentes;
DROP POLICY IF EXISTS "Usuários podem ver associações empresa-visualização que têm acesso" ON config_visualizacoes_empresas;
DROP POLICY IF EXISTS "Usuários podem gerenciar associações empresa-visualização que têm acesso" ON config_visualizacoes_empresas;

-- Recriar políticas com aliases para evitar ambiguidade
CREATE POLICY "Usuários podem ver componentes das visualizações que têm acesso"
  ON config_visualizacoes_componentes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM config_visualizacoes_empresas cve
      JOIN usuarios u ON u.empresa_id = cve.empresa_id
      WHERE cve.visualizacao_id = config_visualizacoes_componentes.visualizacao_id
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
      AND cve.visualizacao_id = config_visualizacoes_componentes.visualizacao_id
    )
  );

CREATE POLICY "Usuários podem gerenciar componentes das visualizações que têm acesso"
  ON config_visualizacoes_componentes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM config_visualizacoes_empresas cve
      JOIN usuarios u ON u.empresa_id = cve.empresa_id
      WHERE cve.visualizacao_id = config_visualizacoes_componentes.visualizacao_id
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
      AND cve.visualizacao_id = config_visualizacoes_componentes.visualizacao_id
    )
  );

CREATE POLICY "Usuários podem ver associações empresa-visualização que têm acesso"
  ON config_visualizacoes_empresas cve
  FOR SELECT
  TO authenticated
  USING (
    cve.empresa_id IN (
      SELECT u.empresa_id FROM usuarios u WHERE u.auth_id = auth.uid()
      UNION
      SELECT ec.empresa_id FROM empresas_consultores ec
      JOIN usuarios u ON u.id = ec.consultor_id
      WHERE u.auth_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_id = auth.uid()
      AND u.role = 'master'
    )
  );

CREATE POLICY "Usuários podem gerenciar associações empresa-visualização que têm acesso"
  ON config_visualizacoes_empresas cve
  FOR ALL
  TO authenticated
  USING (
    cve.empresa_id IN (
      SELECT u.empresa_id FROM usuarios u WHERE u.auth_id = auth.uid()
      UNION
      SELECT ec.empresa_id FROM empresas_consultores ec
      JOIN usuarios u ON u.id = ec.consultor_id
      WHERE u.auth_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_id = auth.uid()
      AND u.role = 'master'
    )
  );