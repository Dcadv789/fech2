/*
  # Remover coluna empresa_id da tabela config_visualizacoes

  1. Alterações
    - Remover a restrição NOT NULL da coluna empresa_id
    - Remover a coluna empresa_id da tabela config_visualizacoes
    - Isso permitirá que o relacionamento seja gerenciado exclusivamente pela tabela config_visualizacoes_empresas
*/

-- Primeiro remover a restrição NOT NULL
ALTER TABLE config_visualizacoes
ALTER COLUMN empresa_id DROP NOT NULL;

-- Depois remover a coluna
ALTER TABLE config_visualizacoes
DROP COLUMN empresa_id;