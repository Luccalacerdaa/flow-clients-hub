-- Migração para adicionar novos campos de múltiplas credenciais e agentes
-- Execute este script no Supabase SQL Editor

-- Adicionar colunas para emails e telefones adicionais
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS emails TEXT[],
ADD COLUMN IF NOT EXISTS phones TEXT[];

-- Adicionar coluna para quantidade de números
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS number_of_phones INTEGER;

-- Adicionar coluna para credenciais por número (inclui agentes com prompts)
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS number_credentials JSONB;

-- Remover coluna general_credentials (não é mais usada)
ALTER TABLE clients 
DROP COLUMN IF EXISTS general_credentials;

-- Comentários para documentação
COMMENT ON COLUMN clients.emails IS 'Emails adicionais para automações';
COMMENT ON COLUMN clients.phones IS 'Telefones adicionais para automações';
COMMENT ON COLUMN clients.number_of_phones IS 'Quantidade de números de WhatsApp solicitados';
COMMENT ON COLUMN clients.number_credentials IS 'Credenciais específicas por número incluindo agentes com prompts personalizados';

-- Exemplo da estrutura JSON para number_credentials:
/*
[
  {
    "id": "number-1",
    "phoneNumber": "+5511999999999",
    "instanceName": "cliente-vendas",
    "displayName": "Vendas",
    "description": "Atendimento e vendas online",
    "agents": [
      {
        "id": "agent-1",
        "name": "Vendedor Virtual",
        "description": "Agente especializado em vendas",
        "prompt": "Você é um vendedor especialista...",
        "isActive": true,
        "priority": 1,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "n8n": { "adminUrl": "...", "email": "...", "password": "..." },
    "evolution": { "managerUrl": "...", "apiKey": "..." },
    "supabase": { "projectUrl": "...", "anonKey": "..." },
    "chatgpt": { "chatLink": "https://chat.openai.com/share/...", "description": "Prompt para vendas" }
  }
]
*/
