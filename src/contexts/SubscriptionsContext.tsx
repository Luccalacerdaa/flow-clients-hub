import { createContext, useContext, ReactNode, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Subscription } from "@/types/subscription";
import { subscriptionsService } from "@/services/subscriptionsService";
import { paymentHistoryService } from "@/services/paymentHistoryService";
import { notificationService, PaymentNotificationData, OverduePayment } from "@/services/notificationService";
import { toast } from "@/hooks/use-toast";

interface SubscriptionsContextType {
  subscriptions: Subscription[];
  isLoading: boolean;
  error: Error | null;
  addSubscription: (subscription: Omit<Subscription, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  addMultipleSubscriptions: (subscriptions: Omit<Subscription, "id" | "createdAt" | "updatedAt">[]) => Promise<void>;
  editSubscription: (id: string, subscriptionData: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  markAsPaid: (id: string) => Promise<void>;
  refetch: () => void;
}

const SubscriptionsContext = createContext<SubscriptionsContextType | undefined>(undefined);

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const {
    data: subscriptions = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => subscriptionsService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (subscription: Omit<Subscription, "id" | "createdAt" | "updatedAt">) =>
      subscriptionsService.create(subscription),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions", variables.clientId] });
      toast({
        title: "Sucesso",
        description: "Mensalidade criada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar mensalidade: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const createMultipleMutation = useMutation({
    mutationFn: async (subscriptions: Omit<Subscription, "id" | "createdAt" | "updatedAt">[]) => {
      const results = [];
      for (const subscription of subscriptions) {
        const result = await subscriptionsService.create(subscription);
        results.push(result);
      }
      return results;
    },
    onSuccess: (createdSubscriptions, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      if (variables.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["subscriptions", variables[0].clientId] });
      }
      
      // Agendar notificações para os pagamentos criados
      if (notificationService.isNotificationEnabled()) {
        createdSubscriptions.forEach((subscription) => {
          // Buscar nome do cliente (você pode ajustar isso conforme sua estrutura)
          const clientName = "Cliente"; // Idealmente buscar do contexto de clientes
          
          const notificationData: PaymentNotificationData = {
            clientName,
            amount: subscription.amount,
            dueDate: subscription.dueDate,
            subscriptionId: subscription.id,
            clientId: subscription.clientId
          };
          
          notificationService.schedulePaymentNotification(notificationData);
        });
      }
      
      toast({
        title: "Sucesso",
        description: `${variables.length} mensalidades criadas com sucesso!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar mensalidades: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Subscription> }) =>
      subscriptionsService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions", data.clientId] });
      queryClient.invalidateQueries({ queryKey: ["subscription", data.id] });
      toast({
        title: "Sucesso",
        description: "Mensalidade atualizada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar mensalidade: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subscriptionsService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.removeQueries({ queryKey: ["subscription", id] });
      toast({
        title: "Sucesso",
        description: "Mensalidade removida com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Erro ao remover mensalidade: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      const subscription = await subscriptionsService.markAsPaid(id);
      
      // Registrar no histórico de pagamentos para aparecer no relatório
      await paymentHistoryService.create({
        subscriptionId: id,
        amount: subscription.amount,
        paymentDate: subscription.paymentDate || new Date().toISOString().split("T")[0],
        paymentMethod: "Outro",
        notes: "Pagamento da mensalidade",
      });
      
      return subscription;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions", data.clientId] });
      queryClient.invalidateQueries({ queryKey: ["subscription", data.id] });
      queryClient.invalidateQueries({ queryKey: ["paymentHistory"] });
      queryClient.invalidateQueries({ queryKey: ["allPaymentHistory"] });
      
      // Mostrar notificação de pagamento recebido
      if (notificationService.isNotificationEnabled()) {
        const clientName = "Cliente"; // Idealmente buscar do contexto de clientes
        notificationService.showPaymentReceivedNotification(clientName, data.amount);
      }
      
      toast({
        title: "Sucesso",
        description: "Mensalidade marcada como paga e registrada no relatório!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Erro ao marcar como paga: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const addSubscription = async (subscription: Omit<Subscription, "id" | "createdAt" | "updatedAt">) => {
    await createMutation.mutateAsync(subscription);
  };

  const addMultipleSubscriptions = async (subscriptions: Omit<Subscription, "id" | "createdAt" | "updatedAt">[]) => {
    await createMultipleMutation.mutateAsync(subscriptions);
  };

  const editSubscription = async (id: string, subscriptionData: Partial<Subscription>) => {
    await updateMutation.mutateAsync({ id, data: subscriptionData });
  };

  const deleteSubscription = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const markAsPaid = async (id: string) => {
    await markAsPaidMutation.mutateAsync(id);
  };

  return (
    <SubscriptionsContext.Provider
      value={{
        subscriptions,
        isLoading,
        error: error as Error | null,
        addSubscription,
        addMultipleSubscriptions,
        editSubscription,
        deleteSubscription,
        markAsPaid,
        refetch,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionsContext);
  if (context === undefined) {
    throw new Error("useSubscriptions must be used within a SubscriptionsProvider");
  }
  return context;
}

