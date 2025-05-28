/*
  # Adicionar coluna ativo na tabela categorias

  1. Alterações
    - Adicionar coluna `ativo` na tabela `categorias`
    - Definir valor padrão como true
*/

ALTER TABLE categorias
ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true;