/*
  # Fix trigger function creation

  1. Changes
    - Remove DO block and create function directly with IF NOT EXISTS
    - Keep all other functionality intact
*/

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_modificado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.modificado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables if they don't exist
DROP TRIGGER IF EXISTS update_categorias_grupo_modificado_em ON categorias_grupo;
DROP TRIGGER IF EXISTS update_categorias_modificado_em ON categorias;
DROP TRIGGER IF EXISTS update_categorias_empresas_modificado_em ON categorias_empresas;

CREATE TRIGGER update_categorias_grupo_modificado_em
  BEFORE UPDATE ON categorias_grupo
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();

CREATE TRIGGER update_categorias_modificado_em
  BEFORE UPDATE ON categorias
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();

CREATE TRIGGER update_categorias_empresas_modificado_em
  BEFORE UPDATE ON categorias_empresas
  FOR EACH ROW
  EXECUTE FUNCTION update_modificado_em();