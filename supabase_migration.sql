-- Migração para adicionar novos campos de múltiplas credenciais, agentes e sistema de mensalidades
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

-- ============================================================================
-- MIGRAÇÃO PARA SISTEMA DE MENSALIDADES AVANÇADO
-- ============================================================================

-- Adicionar novos campos para o sistema de mensalidades
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS implementation_value DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS maintenance_value_per_number DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS number_of_numbers INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS implementation_payment_type TEXT CHECK (implementation_payment_type IN ('vista', 'parcelado')) DEFAULT 'parcelado',
ADD COLUMN IF NOT EXISTS implementation_installments INTEGER,
ADD COLUMN IF NOT EXISTS contract_duration INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS payment_day INTEGER CHECK (payment_day >= 1 AND payment_day <= 31) DEFAULT 10,
ADD COLUMN IF NOT EXISTS monthly_implementation_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_maintenance_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_monthly_amount DECIMAL(10,2) DEFAULT 0;

-- Comentários para documentação das mensalidades
COMMENT ON COLUMN subscriptions.implementation_value IS 'Valor total da implementação do sistema';
COMMENT ON COLUMN subscriptions.maintenance_value_per_number IS 'Valor de manutenção mensal por número de WhatsApp';
COMMENT ON COLUMN subscriptions.number_of_numbers IS 'Quantidade de números de WhatsApp contratados';
COMMENT ON COLUMN subscriptions.implementation_payment_type IS 'Forma de pagamento da implementação: vista ou parcelado';
COMMENT ON COLUMN subscriptions.implementation_installments IS 'Quantidade de parcelas da implementação (se parcelado)';
COMMENT ON COLUMN subscriptions.contract_duration IS 'Duração total do contrato em meses';
COMMENT ON COLUMN subscriptions.payment_day IS 'Dia do mês para vencimento (1-31)';
COMMENT ON COLUMN subscriptions.monthly_implementation_amount IS 'Valor mensal da implementação (calculado)';
COMMENT ON COLUMN subscriptions.monthly_maintenance_amount IS 'Valor mensal total de manutenção (calculado)';
COMMENT ON COLUMN subscriptions.total_monthly_amount IS 'Valor total mensal (manutenção + implementação)';

-- Exemplo de uso do novo sistema:
/*
CENÁRIO: Cliente contrata 3 números, implementação R$ 2.500 em 10x, manutenção R$ 350/número

Dados inseridos:
- implementation_value: 2500.00
- maintenance_value_per_number: 350.00
- number_of_numbers: 3
- implementation_payment_type: 'parcelado'
- implementation_installments: 10
- contract_duration: 12
- payment_day: 10

Valores calculados:
- monthly_maintenance_amount: 350 * 3 = 1050.00
- monthly_implementation_amount: 2500 / 10 = 250.00
- total_monthly_amount: 1050 + 250 = 1300.00

Resultado:
- Meses 1-10: R$ 1.300/mês (manutenção + implementação)
- Meses 11-12: R$ 1.050/mês (apenas manutenção)
*/
