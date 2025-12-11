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
  
  // Valores base
  implementationValue: number; // Valor total da implementação
  maintenanceValuePerNumber: number; // Valor de manutenção por número
  numberOfNumbers: number; // Quantidade de números contratados
  
  // Configurações de pagamento
  implementationPaymentType: "vista" | "parcelado"; // À vista ou parcelado
  implementationInstallments?: number; // Quantas parcelas (se parcelado)
  contractDuration: number; // Duração do contrato em meses (padrão 12)
  paymentDay: number; // Dia do pagamento (1-31)
  
  // Valores calculados
  monthlyImplementationAmount: number; // Valor mensal da implementação (se parcelado)
  monthlyMaintenanceAmount: number; // Valor mensal de manutenção total
  totalMonthlyAmount: number; // Valor total mensal
  
  // Controle de parcelas
  currentInstallment: number; // Parcela atual
  totalInstallments: number; // Total de parcelas do contrato
  
  // Campos existentes (compatibilidade)
  amount: number; // Valor da parcela atual
  dueDate: string; // Data de vencimento da parcela atual
  paymentDate?: string; // Data de pagamento
  status: PaymentStatus;
  isRecurring: boolean;
  recurrenceMonth?: number; // 1-12
  recurrenceDay?: number; // 1-31
  category?: SubscriptionCategory;
  description?: string;
  startDate?: string;
  isPaused?: boolean;
  initialPaymentAmount?: number;
  initialPaymentPaid?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

