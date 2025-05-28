/*
  # Criar tabela de configuração de visualizações

  1. Nova Tabela
    - `config_visualizacoes`
      - Configurações de visualizações por página
      - Suporte a diferentes tipos (card, lista, gráfico)
      - Relacionamentos com outras entidades do sistema
      - Controle de ordem e status por empresa/página

  2. Campos Principais
    - Identificação: id, pagina, ordem, nome_exibicao
    - Configuração: tipo_visualizacao, tipo_grafico, tabela_origem, campo_exibicao
    - Relacionamentos: categoria_id, cliente_id, empresa_id, indicador_id
    - Controle: ativo, criado_em, atualizado_em

  3. Restrições
    - Chave única composta para ordem por empresa/página
    - Chaves estrangeiras para relacionamentos
    - Valores permitidos para campos específicos
*/

-- Criar tabela config_visualizacoes
CREATE TABLE IF NOT EXISTS config_visualizacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pagina text NOT NULL,
  ordem integer NOT NULL,
  nome_exibicao text NOT NULL,
  tipo_visualizacao text NOT NULL CHECK (tipo_visualizacao IN ('card', 'lista', 'grafico')),
  tipo_grafico text CHECK (
    (tipo_visualizacao = 'grafico' AND tipo_grafico IN ('bar', 'line', 'pie')) OR
    (tipo_visualizacao != 'grafico' AND tipo_grafico IS NULL)
  ),
  tabela_origem text NOT NULL CHECK (tabela_origem IN ('registro_vendas', 'indicadores', 'categorias')),
  campo_exibicao text NOT NULL,
  categoria_id uuid REFERENCES categorias(id),
  cliente_id uuid REFERENCES clientes(id),
  empresa_id uuid NOT NULL REFERENCES empresas(id),
  indicador_id uuid REFERENCES indicadores(id),
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now(),
  -- Restrição única composta
  UNIQUE(empresa_id, pagina, ordem)
);

-- Criar índices para otimização
CREATE INDEX idx_config_visualizacoes_empresa ON config_visualizacoes(empresa_id);
CREATE INDEX idx_config_visualizacoes_pagina ON config_visualizacoes(pagina);
CREATE INDEX idx_config_visualizacoes_ordem ON config_visualizacoes(ordem);

-- Criar trigger para atualização automática do atualizado_em
CREATE TRIGGER update_config_visualizacoes_atualizado_em
  BEFORE UPDATE ON config_visualizacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();

-- Habilitar RLS
ALTER TABLE config_visualizacoes ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Usuários podem ver configurações da própria empresa"
  ON config_visualizacoes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_id = auth.uid()
      AND (
        -- Se for cliente, só vê configurações da própria empresa
        (role = 'cliente' AND empresa_id = config_visualizacoes.empresa_id)
        OR
        -- Se for master, vê todas as configurações
        (role = 'master')
        OR
        -- Se for consultor, vê configurações das empresas que atende
        (role = 'consultor' AND EXISTS (
          SELECT 1 FROM empresas_consultores
          WHERE consultor_id = usuarios.id
          AND empresa_id = config_visualizacoes.empresa_id
        ))
      )
    )
  );

CREATE POLICY "Usuários podem gerenciar configurações da própria empresa"
  ON config_visualizacoes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_id = auth.uid()
      AND (
        (role = 'cliente' AND empresa_id = config_visualizacoes.empresa_id)
        OR
        (role = 'master')
        OR
        (role = 'consultor' AND EXISTS (
          SELECT 1 FROM empresas_consultores
          WHERE consultor_id = usuarios.id
          AND empresa_id = config_visualizacoes.empresa_id
        ))
      )
    )
  );