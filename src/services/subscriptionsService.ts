import { supabase } from '@/lib/supabase';
import { Subscription, PaymentStatus, SubscriptionCategory } from '@/types/subscription';

// Tipo para dados do banco (snake_case)
interface SubscriptionRow {
  id: string;
  client_id: string;
  amount: number;
  due_date: string;
  payment_date: string | null;
  status: PaymentStatus;
  is_recurring: boolean;
  recurrence_month: number | null;
  recurrence_day: number | null;
  category: string | null;
  description: string | null;
  start_date: string | null;
  total_installments: number | null;
  current_installment: number | null;
  is_paused: boolean | null;
  initial_payment_amount: number | null;
  initial_payment_paid: boolean | null;
  notes: string | null;
  
  // Novos campos para o sistema avançado
  implementation_value: number | null;
  maintenance_value_per_number: number | null;
  number_of_numbers: number | null;
  implementation_payment_type: string | null;
  implementation_installments: number | null;
  contract_duration: number | null;
  payment_day: number | null;
  monthly_implementation_amount: number | null;
  monthly_maintenance_amount: number | null;
  total_monthly_amount: number | null;
  
  created_at: string;
  updated_at: string;
}

// Converter do formato do banco para o formato da aplicação
function dbToSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    clientId: row.client_id,
    amount: Number(row.amount),
    dueDate: row.due_date,
    paymentDate: row.payment_date || undefined,
    status: row.status,
    isRecurring: row.is_recurring,
    recurrenceMonth: row.recurrence_month || undefined,
    recurrenceDay: row.recurrence_day || undefined,
    category: (row.category as SubscriptionCategory) || undefined,
    description: row.description || undefined,
    startDate: row.start_date || undefined,
    totalInstallments: row.total_installments || undefined,
    currentInstallment: row.current_installment || undefined,
    isPaused: row.is_paused || false,
    initialPaymentAmount: row.initial_payment_amount ? Number(row.initial_payment_amount) : undefined,
    initialPaymentPaid: row.initial_payment_paid || false,
    notes: row.notes || undefined,
    
    // Novos campos
    implementationValue: row.implementation_value ? Number(row.implementation_value) : 0,
    maintenanceValuePerNumber: row.maintenance_value_per_number ? Number(row.maintenance_value_per_number) : 0,
    numberOfNumbers: row.number_of_numbers || 1,
    implementationPaymentType: (row.implementation_payment_type as "vista" | "parcelado") || "parcelado",
    implementationInstallments: row.implementation_installments || undefined,
    contractDuration: row.contract_duration || 12,
    paymentDay: row.payment_day || 10,
    monthlyImplementationAmount: row.monthly_implementation_amount ? Number(row.monthly_implementation_amount) : 0,
    monthlyMaintenanceAmount: row.monthly_maintenance_amount ? Number(row.monthly_maintenance_amount) : 0,
    totalMonthlyAmount: row.total_monthly_amount ? Number(row.total_monthly_amount) : 0,
    
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Converter do formato da aplicação para o formato do banco
function subscriptionToDb(subscription: Partial<Subscription>): Partial<SubscriptionRow> {
  const dbSubscription: Partial<SubscriptionRow> = {};
  
  if (subscription.clientId !== undefined) dbSubscription.client_id = subscription.clientId;
  if (subscription.amount !== undefined) dbSubscription.amount = subscription.amount;
  if (subscription.dueDate !== undefined) dbSubscription.due_date = subscription.dueDate;
  if (subscription.paymentDate !== undefined) dbSubscription.payment_date = subscription.paymentDate || null;
  if (subscription.status !== undefined) dbSubscription.status = subscription.status;
  if (subscription.isRecurring !== undefined) dbSubscription.is_recurring = subscription.isRecurring;
  if (subscription.recurrenceMonth !== undefined) dbSubscription.recurrence_month = subscription.recurrenceMonth || null;
  if (subscription.recurrenceDay !== undefined) dbSubscription.recurrence_day = subscription.recurrenceDay || null;
  if (subscription.category !== undefined) dbSubscription.category = subscription.category || null;
  if (subscription.description !== undefined) dbSubscription.description = subscription.description || null;
  if (subscription.startDate !== undefined) dbSubscription.start_date = subscription.startDate || null;
  if (subscription.totalInstallments !== undefined) dbSubscription.total_installments = subscription.totalInstallments || null;
  if (subscription.currentInstallment !== undefined) dbSubscription.current_installment = subscription.currentInstallment || null;
  if (subscription.isPaused !== undefined) dbSubscription.is_paused = subscription.isPaused || null;
  if (subscription.initialPaymentAmount !== undefined) dbSubscription.initial_payment_amount = subscription.initialPaymentAmount || null;
  if (subscription.initialPaymentPaid !== undefined) dbSubscription.initial_payment_paid = subscription.initialPaymentPaid || null;
  if (subscription.notes !== undefined) dbSubscription.notes = subscription.notes || null;
  
  // Novos campos
  if (subscription.implementationValue !== undefined) dbSubscription.implementation_value = subscription.implementationValue || null;
  if (subscription.maintenanceValuePerNumber !== undefined) dbSubscription.maintenance_value_per_number = subscription.maintenanceValuePerNumber || null;
  if (subscription.numberOfNumbers !== undefined) dbSubscription.number_of_numbers = subscription.numberOfNumbers || null;
  if (subscription.implementationPaymentType !== undefined) dbSubscription.implementation_payment_type = subscription.implementationPaymentType || null;
  if (subscription.implementationInstallments !== undefined) dbSubscription.implementation_installments = subscription.implementationInstallments || null;
  if (subscription.contractDuration !== undefined) dbSubscription.contract_duration = subscription.contractDuration || null;
  if (subscription.paymentDay !== undefined) dbSubscription.payment_day = subscription.paymentDay || null;
  if (subscription.monthlyImplementationAmount !== undefined) dbSubscription.monthly_implementation_amount = subscription.monthlyImplementationAmount || null;
  if (subscription.monthlyMaintenanceAmount !== undefined) dbSubscription.monthly_maintenance_amount = subscription.monthlyMaintenanceAmount || null;
  if (subscription.totalMonthlyAmount !== undefined) dbSubscription.total_monthly_amount = subscription.totalMonthlyAmount || null;
  
  return dbSubscription;
}

// Função para calcular próxima data de vencimento
function calculateNextDueDate(recurrenceDay: number, startDate?: string): string {
  const today = new Date();
  const day = recurrenceDay;
  
  // Se temos uma data de início, usar ela como base
  const baseDate = startDate ? new Date(startDate) : today;
  
  // Calcular próximo vencimento
  const nextDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), day);
  
  // Se a data já passou este mês, ir para o próximo mês
  if (nextDate < today) {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }
  
  return nextDate.toISOString().split('T')[0];
}

export const subscriptionsService = {
  // Buscar todas as mensalidades
  async getAll(): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('due_date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar mensalidades:', error);
      throw error;
    }

    return data ? data.map(dbToSubscription) : [];
  },

  // Buscar mensalidades de um cliente
  async getByClientId(clientId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('client_id', clientId)
      .order('due_date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar mensalidades do cliente:', error);
      throw error;
    }

    return data ? data.map(dbToSubscription) : [];
  },

  // Buscar mensalidade por ID
  async getById(id: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Erro ao buscar mensalidade:', error);
      throw error;
    }

    return data ? dbToSubscription(data) : null;
  },

  // Criar nova mensalidade
  async create(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
    const dbSubscription = subscriptionToDb(subscription);
    
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(dbSubscription)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar mensalidade:', error);
      throw error;
    }

    const created = dbToSubscription(data);

    // Se for recorrente e foi marcado como pago, criar próxima mensalidade
    if (created.isRecurring && created.status === 'Pago' && created.recurrenceDay) {
      await this.createNextRecurring(created);
    }

    return created;
  },

  // Criar próxima mensalidade recorrente
  async createNextRecurring(subscription: Subscription): Promise<Subscription | null> {
    if (!subscription.isRecurring || !subscription.paymentDay) {
      return null;
    }

    // Verificar se já atingiu o limite de parcelas do contrato
    if (subscription.totalInstallments && subscription.currentInstallment && 
        subscription.currentInstallment >= subscription.totalInstallments) {
      return null;
    }

    const nextDueDate = calculateNextDueDate(subscription.paymentDay, subscription.dueDate);
    const nextInstallment = (subscription.currentInstallment || 1) + 1;

    // Calcular valor da próxima parcela
    let nextAmount = subscription.monthlyMaintenanceAmount || 0;
    
    // Se ainda está no período de implementação, adicionar valor da implementação
    if (subscription.implementationPaymentType === "parcelado" && 
        subscription.implementationInstallments && 
        nextInstallment <= subscription.implementationInstallments) {
      nextAmount += subscription.monthlyImplementationAmount || 0;
    }

    const nextSubscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'> = {
      clientId: subscription.clientId,
      amount: nextAmount,
      dueDate: nextDueDate,
      status: 'Pendente',
      isRecurring: subscription.isRecurring,
      recurrenceDay: subscription.paymentDay,
      category: subscription.category,
      description: subscription.description,
      startDate: subscription.startDate,
      totalInstallments: subscription.totalInstallments,
      currentInstallment: nextInstallment,
      isPaused: false,
      initialPaymentAmount: subscription.initialPaymentAmount,
      initialPaymentPaid: subscription.initialPaymentPaid,
      
      // Manter dados do contrato
      implementationValue: subscription.implementationValue,
      maintenanceValuePerNumber: subscription.maintenanceValuePerNumber,
      numberOfNumbers: subscription.numberOfNumbers,
      implementationPaymentType: subscription.implementationPaymentType,
      implementationInstallments: subscription.implementationInstallments,
      contractDuration: subscription.contractDuration,
      paymentDay: subscription.paymentDay,
      monthlyImplementationAmount: subscription.monthlyImplementationAmount,
      monthlyMaintenanceAmount: subscription.monthlyMaintenanceAmount,
      totalMonthlyAmount: nextAmount,
    };

    return this.create(nextSubscription);
  },

  // Atualizar mensalidade
  async update(id: string, updates: Partial<Subscription>): Promise<Subscription> {
    const dbUpdates = subscriptionToDb(updates);
    
    const { data, error } = await supabase
      .from('subscriptions')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar mensalidade:', error);
      throw error;
    }

    return dbToSubscription(data);
  },

  // Deletar mensalidade
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar mensalidade:', error);
      throw error;
    }
  },

  // Marcar como pago e criar próxima se for recorrente
  async markAsPaid(id: string, paymentDate?: string, paymentMethod?: string): Promise<Subscription> {
    const subscription = await this.getById(id);
    if (!subscription) {
      throw new Error('Mensalidade não encontrada');
    }

    const paidDate = paymentDate || new Date().toISOString().split('T')[0];

    const updated = await this.update(id, {
      status: 'Pago',
      paymentDate: paidDate,
    });

    // Registrar no histórico de pagamentos (importar paymentHistoryService)
    // Isso será feito no contexto para evitar dependência circular

    // Se for recorrente e não estiver pausada, criar próxima
    if (updated.isRecurring && !updated.isPaused) {
      await this.createNextRecurring(updated);
    }

    return updated;
  },

  // Pausar recorrência
  async pauseRecurrence(id: string): Promise<Subscription> {
    return this.update(id, {
      isPaused: true,
      status: 'Pausado',
    });
  },

  // Reativar recorrência
  async resumeRecurrence(id: string): Promise<Subscription> {
    const subscription = await this.getById(id);
    if (!subscription) {
      throw new Error('Mensalidade não encontrada');
    }

    // Calcular próximo vencimento se necessário
    let nextDueDate = subscription.dueDate;
    if (subscription.recurrenceDay) {
      nextDueDate = calculateNextDueDate(subscription.recurrenceDay);
    }

    return this.update(id, {
      isPaused: false,
      status: 'Pendente',
      dueDate: nextDueDate,
    });
  },

  // Buscar mensalidades atrasadas
  async getOverdue(): Promise<Subscription[]> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .lt('due_date', today)
      .in('status', ['Pendente', 'Atrasado'])
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Erro ao buscar mensalidades atrasadas:', error);
      throw error;
    }

    return data ? data.map(dbToSubscription) : [];
  },

  // Buscar mensalidades recorrentes
  async getRecurring(): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('is_recurring', true)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Erro ao buscar mensalidades recorrentes:', error);
      throw error;
    }

    return data ? data.map(dbToSubscription) : [];
  },

  // Atualizar status para Atrasado automaticamente
  async updateOverdueStatus(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'Atrasado' })
      .lt('due_date', today)
      .in('status', ['Pendente']);

    if (error) {
      console.error('Erro ao atualizar status de mensalidades atrasadas:', error);
      throw error;
    }
  },
};
