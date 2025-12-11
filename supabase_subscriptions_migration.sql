-- ============================================================================
-- MIGRAÇÃO SUPABASE - SISTEMA AVANÇADO DE MENSALIDADES
-- Execute este script no Supabase SQL Editor
-- ============================================================================

-- Adicionar novos campos para o sistema de mensalidades avançado
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

-- Adicionar comentários para documentação
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

-- Verificar se a migração foi aplicada corretamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
  AND column_name IN (
    'implementation_value',
    'maintenance_value_per_number', 
    'number_of_numbers',
    'implementation_payment_type',
    'implementation_installments',
    'contract_duration',
    'payment_day',
    'monthly_implementation_amount',
    'monthly_maintenance_amount',
    'total_monthly_amount'
  )
ORDER BY column_name;
