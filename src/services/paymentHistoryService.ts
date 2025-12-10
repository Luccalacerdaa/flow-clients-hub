import { supabase } from '@/lib/supabase';
import { PaymentHistory, PaymentMethod } from '@/types/subscription';

interface PaymentHistoryRow {
  id: string;
  subscription_id: string;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
}

function dbToPaymentHistory(row: PaymentHistoryRow): PaymentHistory {
  return {
    id: row.id,
    subscriptionId: row.subscription_id,
    amount: Number(row.amount),
    paymentDate: row.payment_date,
    paymentMethod: (row.payment_method as PaymentMethod) || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
  };
}

function paymentHistoryToDb(payment: Partial<PaymentHistory>): Partial<PaymentHistoryRow> {
  const dbPayment: Partial<PaymentHistoryRow> = {};
  
  if (payment.subscriptionId !== undefined) dbPayment.subscription_id = payment.subscriptionId;
  if (payment.amount !== undefined) dbPayment.amount = payment.amount;
  if (payment.paymentDate !== undefined) dbPayment.payment_date = payment.paymentDate;
  if (payment.paymentMethod !== undefined) dbPayment.payment_method = payment.paymentMethod || null;
  if (payment.notes !== undefined) dbPayment.notes = payment.notes || null;
  
  return dbPayment;
}

export const paymentHistoryService = {
  // Buscar histórico de pagamentos de uma mensalidade
  async getBySubscriptionId(subscriptionId: string): Promise<PaymentHistory[]> {
    const { data, error } = await supabase
      .from('payment_history')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar histórico de pagamentos:', error);
      throw error;
    }

    return data ? data.map(dbToPaymentHistory) : [];
  },

  // Criar registro de pagamento
  async create(payment: Omit<PaymentHistory, 'id' | 'createdAt'>): Promise<PaymentHistory> {
    const dbPayment = paymentHistoryToDb(payment);
    
    const { data, error } = await supabase
      .from('payment_history')
      .insert(dbPayment)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar registro de pagamento:', error);
      throw error;
    }

    return dbToPaymentHistory(data);
  },

  // Deletar registro de pagamento
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('payment_history')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar registro de pagamento:', error);
      throw error;
    }
  },
};

