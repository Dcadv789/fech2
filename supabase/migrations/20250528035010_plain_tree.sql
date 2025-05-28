/*
  # Criar tabelas de componentes e empresas para configurações de visualização

  1. Nova Tabela `config_visualizacoes_componentes`
    - Permite associar múltiplos componentes a uma visualização
    - Suporta diferentes tipos de origem (indicador, categoria, registro_venda)
    - Controle de ordem para exibição dos componentes
    - Validações para garantir consistência dos dados

  2. Nova Tabela `config_visualizacoes_empresas`
    - Permite associar uma visualização a múltiplas empresas
    - Relacionamento many-to-many entre visualizações e empresas

  3. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para usuários autenticados
*/

-- Criar tipo enum para origem dos componentes
CREATE TYPE origem_componente AS ENUM ('indicador', 'categoria', 'registro_venda');

-- Criar tabela config_visualizacoes_componentes
CREATE TABLE IF NOT EXISTS config_visualizacoes_componentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visualizacao_id uuid NOT NULL REFERENCES config_visualizacoes(id) ON DELETE CASCADE,
  tabela_origem origem_componente NOT NULL,
  indicador_id uuid REFERENCES indicadores(id),
  categoria_id uuid REFERENCES categorias(id),
  campo_exibicao text,
  ordem integer NOT NULL,
  criado_em timestamptz DEFAULT now(),
  modificado_em timestamptz DEFAULT now(),
  -- Garantir que apenas um ID seja preenchido de acordo com a origem
  CONSTRAINT check_origem_id CHECK (
    (tabela_origem = 'indicador' AND indicador_id IS NOT NULL AND categoria_id IS NULL) OR
    (tabela_origem = 'categoria' AND categoria_id IS NOT NULL AND indicador_id IS NULL) OR
    (tabela_origem = 'registro_venda' AND indicador_id IS NULL AND categoria_id IS NULL AND campo_exibicao IS NOT NULL)
  )
);

-- Criar tabela config_visualizacoes_empresas
CREATE TABLE IF NOT EXISTS config_visualizacoes_empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visualizacao_id uuid NOT NULL REFERENCES config_visualizacoes(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES empresas(id),
  criado_em timestamptz DEFAULT now(),
  modificado_em timestamptz DEFAULT now(),
  UNIQUE(visualizacao_id, empresa_id)
);

-- Criar índices para otimização
CREATE INDEX idx_config_vis_comp_visualizacao ON config_visualizacoes_componentes(visualizacao_id);
CREATE INDEX idx_config_vis_comp_indicador ON config_visualizacoes_componentes(indicador_id);
CREATE INDEX idx_config_vis_comp_categoria ON config_visualizacoes_componentes(categoria_id);
CREATE INDEX idx_config_vis_comp_ordem ON config_visualizacoes_componentes(ordem);
CREATE INDEX idx_config_vis_emp_visualizacao ON config_visualizacoes_empresas(visualizacao_id);
CREATE INDEX idx_config_vis_emp_empresa ON config_visualizacoes_empresas(empresa_id);

-- Criar triggers para atualização automática do modificado_em
CREATE TRIGGER update_config_vis_comp_modificado_em
  BEFORE UPDATE ON config_visualizacoes_componentes
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();

CREATE TRIGGER update_config_vis_emp_modificado_em
  BEFORE UPDATE ON config_visualizacoes_empresas
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();

-- Habilitar RLS
ALTER TABLE config_visualizacoes_componentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_visualizacoes_empresas ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso para componentes
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
      SELECT 1 FROM usuarios
      WHERE auth_id = auth.uid()
      AND role = 'master'
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
      SELECT 1 FROM usuarios
      WHERE auth_id = auth.uid()
      AND role = 'master'
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

-- Criar políticas de acesso para empresas
CREATE POLICY "Usuários podem ver associações empresa-visualização que têm acesso"
  ON config_visualizacoes_empresas
  FOR SELECT
  TO authenticated
  USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
      UNION
      SELECT empresa_id FROM empresas_consultores ec
      JOIN usuarios u ON u.id = ec.consultor_id
      WHERE u.auth_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_id = auth.uid()
      AND role = 'master'
    )
  );

CREATE POLICY "Usuários podem gerenciar associações empresa-visualização que têm acesso"
  ON config_visualizacoes_empresas
  FOR ALL
  TO authenticated
  USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid()
      UNION
      SELECT empresa_id FROM empresas_consultores ec
      JOIN usuarios u ON u.id = ec.consultor_id
      WHERE u.auth_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_id = auth.uid()
      AND role = 'master'
    )
  );