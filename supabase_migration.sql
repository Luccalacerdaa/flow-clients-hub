-- Migração para adicionar novos campos de múltiplas credenciais
-- Execute este script no Supabase SQL Editor

-- Adicionar colunas para emails e telefones adicionais
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS emails TEXT[],
ADD COLUMN IF NOT EXISTS phones TEXT[];

-- Adicionar coluna para quantidade de números
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS number_of_phones INTEGER;

-- Adicionar colunas para credenciais por número e credenciais gerais
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS number_credentials JSONB,
ADD COLUMN IF NOT EXISTS general_credentials JSONB;

-- Comentários para documentação
COMMENT ON COLUMN clients.emails IS 'Emails adicionais para automações';
COMMENT ON COLUMN clients.phones IS 'Telefones adicionais para automações';
COMMENT ON COLUMN clients.number_of_phones IS 'Quantidade de números de WhatsApp solicitados';
COMMENT ON COLUMN clients.number_credentials IS 'Credenciais específicas por número (n8n, Evolution API)';
COMMENT ON COLUMN clients.general_credentials IS 'Credenciais gerais compartilhadas (Supabase, ChatGPT)';
