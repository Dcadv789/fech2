/*
  # Adicionar coluna todos na tabela config_visualizacoes_componentes

  1. Alterações
    - Adicionar coluna `todos` do tipo boolean
    - Permitir valores nulos
    - Sem valor padrão definido
    
  2. Propósito
    - Permitir incluir automaticamente todos os registros da tabela origem
    - true: incluir todos os registros da tabela_origem
    - false: usar apenas associações manuais
    - null: ignorar e usar vinculações normais
*/

-- Adicionar coluna todos
ALTER TABLE config_visualizacoes_componentes
ADD COLUMN todos boolean;