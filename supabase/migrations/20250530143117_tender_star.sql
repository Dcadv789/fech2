/*
  # Fix check constraint for config_visualizacoes_componentes

  1. Changes
    - Drop existing check constraint
    - Create new check constraint that considers 'todos' flag
    - When todos is true, no IDs should be set
    - When todos is false or null, follow original rules
*/

-- Drop existing constraint
ALTER TABLE config_visualizacoes_componentes
DROP CONSTRAINT IF EXISTS check_origem_id;

-- Add new constraint that considers 'todos' flag
ALTER TABLE config_visualizacoes_componentes
ADD CONSTRAINT check_origem_id CHECK (
  (todos = true AND indicador_id IS NULL AND categoria_id IS NULL) OR
  (
    (todos IS NULL OR todos = false) AND
    (
      (tabela_origem = 'indicador' AND indicador_id IS NOT NULL AND categoria_id IS NULL) OR
      (tabela_origem = 'categoria' AND categoria_id IS NOT NULL AND indicador_id IS NULL) OR
      (tabela_origem = 'registro_venda' AND indicador_id IS NULL AND categoria_id IS NULL AND campo_exibicao IS NOT NULL)
    )
  )
);