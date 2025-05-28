/*
  # Adicionar data de desativação na tabela empresas

  1. Alterações
    - Adicionar coluna `data_desativacao` na tabela `empresas`
    - A coluna será opcional e do tipo date
    - Será preenchida apenas quando a empresa for desativada
*/

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS data_desativacao date;