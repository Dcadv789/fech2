/*
  # Criar tabelas de configuração de visualizações

  1. Novas Tabelas
    - `config_visualizacoes`
      - Configurações básicas de visualização
      - Controle de página, tipo e ordem
    - `config_visualizacoes_detalhes`
      - Detalhes específicos por tipo de visualização
      - Validações para garantir consistência dos dados

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para usuários autenticados
*/

-- Criar tabela config_visualizacoes
CREATE TABLE IF NOT EXISTS config_visualizacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pagina text NOT NULL,
  nome_exibicao text NOT NULL,
  tipo_visualizacao text NOT NULL CHECK (tipo_visualizacao IN ('card', 'lista', 'grafico')),
  fonte_dados text NOT NULL CHECK (fonte_dados IN ('indicador', 'categoria', 'registro_de_vendas', 'cliente', 'vendedor')),
  ordem integer NOT NULL,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  modificado_em timestamptz DEFAULT now()
);

-- Criar índices para otimização
CREATE INDEX idx_config_visualizacoes_pagina ON config_visualizacoes(pagina);
CREATE INDEX idx_config_visualizacoes_ordem ON config_visualizacoes(ordem);

-- Criar tabela config_visualizacoes_detalhes
CREATE TABLE IF NOT EXISTS config_visualizacoes_detalhes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_visualizacao_id uuid NOT NULL REFERENCES config_visualizacoes(id),
  -- Campos para configuração de cards
  config_card_tipo text CHECK (config_card_tipo IN ('indicador', 'categoria', 'registro_de_vendas')),
  config_card_valores jsonb,
  -- Campos para configuração de listas
  config_lista_tipo text CHECK (config_lista_tipo IN ('clientes', 'categorias', 'vendedores', 'vendas')),
  config_lista_filtros jsonb,
  -- Campos para configuração de gráficos
  config_grafico_tipo text CHECK (config_grafico_tipo IN ('barra', 'pizza', 'linha')),
  config_grafico_fonte text CHECK (config_grafico_fonte IN ('indicador', 'cliente', 'categoria', 'registro_de_vendas')),
  config_grafico_eixos jsonb,
  criado_em timestamptz DEFAULT now(),
  modificado_em timestamptz DEFAULT now(),
  -- Validações para garantir que apenas os campos do tipo correto sejam preenchidos
  CONSTRAINT check_config_tipos CHECK (
    -- Para cards: apenas campos de card preenchidos
    (config_card_tipo IS NOT NULL AND config_card_valores IS NOT NULL AND
     config_lista_tipo IS NULL AND config_lista_filtros IS NULL AND
     config_grafico_tipo IS NULL AND config_grafico_fonte IS NULL AND config_grafico_eixos IS NULL) OR
    -- Para listas: apenas campos de lista preenchidos
    (config_lista_tipo IS NOT NULL AND config_lista_filtros IS NOT NULL AND
     config_card_tipo IS NULL AND config_card_valores IS NULL AND
     config_grafico_tipo IS NULL AND config_grafico_fonte IS NULL AND config_grafico_eixos IS NULL) OR
    -- Para gráficos: apenas campos de gráfico preenchidos
    (config_grafico_tipo IS NOT NULL AND config_grafico_fonte IS NOT NULL AND config_grafico_eixos IS NOT NULL AND
     config_card_tipo IS NULL AND config_card_valores IS NULL AND
     config_lista_tipo IS NULL AND config_lista_filtros IS NULL)
  )
);

-- Criar índice para a chave estrangeira
CREATE INDEX idx_config_visualizacoes_detalhes_config_id ON config_visualizacoes_detalhes(config_visualizacao_id);

-- Criar triggers para atualização automática do modificado_em
CREATE TRIGGER update_config_visualizacoes_modificado_em
  BEFORE UPDATE ON config_visualizacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();

CREATE TRIGGER update_config_visualizacoes_detalhes_modificado_em
  BEFORE UPDATE ON config_visualizacoes_detalhes
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();

-- Habilitar RLS
ALTER TABLE config_visualizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_visualizacoes_detalhes ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso para config_visualizacoes
CREATE POLICY "Usuários autenticados podem ler configurações de visualização"
  ON config_visualizacoes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir configurações de visualização"
  ON config_visualizacoes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar configurações de visualização"
  ON config_visualizacoes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Criar políticas de acesso para config_visualizacoes_detalhes
CREATE POLICY "Usuários autenticados podem ler detalhes de configurações"
  ON config_visualizacoes_detalhes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir detalhes de configurações"
  ON config_visualizacoes_detalhes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar detalhes de configurações"
  ON config_visualizacoes_detalhes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);