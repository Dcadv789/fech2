/*
  # Sistema de Keep-Alive com Logs

  1. Novas Funcionalidades
    - Tabela `keep_alive_logs` para registro de execuções
    - Função `executar_cron` para verificação diária
    - Agendamento automático via pg_cron
    
  2. Detalhes
    - Execução diária às 00:00 UTC (21:00 Brasília)
    - Evita duplicidade de registros no mesmo dia
    - Utiliza extensão pg_cron para agendamento
*/

-- Criar extensão pg_cron se não existir
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Criar tabela keep_alive_logs
CREATE TABLE IF NOT EXISTS keep_alive_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_execucao timestamptz DEFAULT now(),
  resultado text NOT NULL,
  criado_em timestamptz DEFAULT now()
);

-- Criar índice para otimizar consultas por data
CREATE INDEX idx_keep_alive_logs_data_execucao 
  ON keep_alive_logs(data_execucao);

-- Criar função executar_cron
CREATE OR REPLACE FUNCTION executar_cron()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar se já existe registro para o dia atual
  IF NOT EXISTS (
    SELECT 1 
    FROM keep_alive_logs 
    WHERE DATE(data_execucao) = CURRENT_DATE
  ) THEN
    -- Inserir novo registro
    INSERT INTO keep_alive_logs (resultado)
    VALUES ('Execução realizada com sucesso');
  END IF;
END;
$$;

-- Agendar tarefa para executar diariamente às 00:00 UTC
SELECT cron.schedule(
  'cron_execucao_diaria',   -- nome da tarefa
  '0 0 * * *',             -- expressão cron: meia-noite UTC
  'SELECT executar_cron()'  -- comando SQL a ser executado
);

-- Habilitar RLS
ALTER TABLE keep_alive_logs ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Usuários autenticados podem ler logs"
  ON keep_alive_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir logs"
  ON keep_alive_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);