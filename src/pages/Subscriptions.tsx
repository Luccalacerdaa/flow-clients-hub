import { useState } from "react";
import { Layout } from "@/components/Layout";
import { SubscriptionsTable } from "@/components/SubscriptionsTable";
import { AddClientWithSubscriptionDialog } from "@/components/AddClientWithSubscriptionDialog";
import { useSubscriptions } from "@/contexts/SubscriptionsContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { subscriptionsService } from "@/services/subscriptionsService";
import { clientsService } from "@/services/clientsService";
import { paymentHistoryService } from "@/services/paymentHistoryService";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Subscription, SubscriptionCategory, PaymentMethod } from "@/types/subscription";
import { Client } from "@/types/client";
import { toast } from "@/hooks/use-toast";

export default function Subscriptions() {
  const queryClient = useQueryClient();
  const { subscriptions, isLoading, addSubscription, editSubscription, deleteSubscription, markAsPaid } = useSubscriptions();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Buscar informações dos clientes para exibir nomes
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsService.getAll(),
  });

  // Enriquecer mensalidades com dados do cliente
  const subscriptionsWithClient = subscriptions.map((sub) => {
    const client = clients.find((c: Client) => c.id === sub.clientId);
    return {
      ...sub,
      clientName: client?.fullName || "Cliente não encontrado",
      companyName: client?.companyName || "",
    };
  });

  const handleAddClientWithSubscription = async (data: {
    clientId: string;
    initialPayment: {
      amount: number;
      description: string;
      paid: boolean;
      installments: number;
      paymentMethod?: PaymentMethod;
      paymentDate?: string;
    };
    subscription: {
      amount: number;
      recurrenceDay: number;
      activateRecurrence: boolean;
      category: SubscriptionCategory;
    };
  }) => {
    try {
      const today = new Date();
      const dueDate = new Date(today.getFullYear(), today.getMonth(), data.subscription.recurrenceDay);
      
      // Se o dia já passou este mês, ir para o próximo mês
      if (dueDate < today) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }

      // Criar mensalidade
      const subscription: Omit<Subscription, "id" | "createdAt" | "updatedAt"> = {
        clientId: data.clientId,
        amount: data.subscription.amount,
        category: data.subscription.category,
        description: data.initialPayment.description,
        startDate: today.toISOString().split("T")[0],
        dueDate: dueDate.toISOString().split("T")[0],
        status: "Pendente",
        isRecurring: data.subscription.activateRecurrence,
        recurrenceDay: data.subscription.recurrenceDay,
        currentInstallment: 1,
        isPaused: false,
        initialPaymentAmount: data.initialPayment.amount > 0 ? data.initialPayment.amount : undefined,
        initialPaymentPaid: data.initialPayment.paid,
      };

      // Criar a mensalidade
      const createdSubscription = await subscriptionsService.create(subscription);

      // Se o pagamento inicial foi marcado como pago, registrar no histórico
      // Isso fará com que o valor apareça automaticamente no relatório financeiro
      if (data.initialPayment.paid && data.initialPayment.amount > 0) {
        const paymentNotes = `Pagamento inicial (${data.initialPayment.installments}x): ${data.initialPayment.description}`;
        
        await paymentHistoryService.create({
          subscriptionId: createdSubscription.id,
          amount: data.initialPayment.amount,
          paymentDate: data.initialPayment.paymentDate || today.toISOString().split("T")[0],
          paymentMethod: data.initialPayment.paymentMethod || "Outro",
          notes: paymentNotes,
        });
      }

      // Se a recorrência está ativa, a primeira mensalidade já foi criada acima
      // As próximas serão criadas automaticamente quando marcar como pago

      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      
      toast({
        title: "Sucesso",
        description: "Cliente e mensalidade criados com sucesso!",
      });

      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Erro ao criar: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mensalidades</h1>
            <p className="text-muted-foreground">
              Gerencie todas as mensalidades e pagamentos dos clientes
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Cliente + Mensalidade
          </Button>
        </div>
        <SubscriptionsTable
          subscriptions={subscriptionsWithClient as Subscription[]}
          showClientName={true}
          onEditSubscription={editSubscription}
          onDeleteSubscription={deleteSubscription}
          onMarkAsPaid={markAsPaid}
        />

        <AddClientWithSubscriptionDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSave={handleAddClientWithSubscription}
        />
      </div>
    </Layout>
  );
}

