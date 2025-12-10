export type PaymentStatus = "Pendente" | "Pago" | "Atrasado" | "Cancelado" | "Pausado";
export type SubscriptionCategory = "Produto" | "Serviço" | "Plano" | "Outro";
export type PaymentMethod = "Boleto" | "PIX" | "Cartão Crédito" | "Cartão Débito" | "Cartão" | "Transferência" | "Dinheiro" | "Outro";

export interface PaymentHistory {
  id: string;
  subscriptionId: string;
  amount: number;
  paymentDate: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  clientId: string;
  amount: number;
  dueDate: string; // ISO date string
  paymentDate?: string; // ISO date string
  status: PaymentStatus;
  isRecurring: boolean;
  recurrenceMonth?: number; // 1-12
  recurrenceDay?: number; // 1-31
  category?: SubscriptionCategory;
  description?: string;
  startDate?: string;
  totalInstallments?: number; // null = infinito
  currentInstallment?: number;
  isPaused?: boolean;
  initialPaymentAmount?: number;
  initialPaymentPaid?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

