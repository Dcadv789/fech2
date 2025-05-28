/*
  # Adicionar coluna cargo na tabela pessoas

  1. Alterações
    - Adicionar coluna `cargo` na tabela `pessoas`
    - Definir os valores permitidos: 'Vendedor', 'SDR', 'Ambos'
    - Tornar a coluna obrigatória
*/

-- Criar tipo enum para cargo
CREATE TYPE tipo_cargo AS ENUM ('Vendedor', 'SDR', 'Ambos');

-- Adicionar coluna cargo
ALTER TABLE pessoas
ADD COLUMN cargo tipo_cargo NOT NULL;