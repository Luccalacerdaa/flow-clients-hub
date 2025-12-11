import { useState } from "react";
import { Layout } from "@/components/Layout";
import { SubscriptionsTable } from "@/components/SubscriptionsTable";
import { AddClientWithSubscriptionDialog } from "@/components/AddClientWithSubscriptionDialog";
import { useSubscriptions } from "@/contexts/SubscriptionsContext";
import { useClients } from "@/contexts/ClientsContext";
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
import { NewSubscriptionDialog } from "@/components/NewSubscriptionDialog";
import { NewClientDialog } from "@/components/NewClientDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Subscriptions() {
  const queryClient = useQueryClient();
  const { subscriptions, isLoading, addMultipleSubscriptions, editSubscription, deleteSubscription, markAsPaid } = useSubscriptions();
  const { addClient } = useClients();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

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

  const handleNewClient = async (clientData: any) => {
    try {
      const newClient = await addClient(clientData);
      setSelectedClientId(newClient.id);
      setIsNewClientDialogOpen(false);
      setIsSubscriptionDialogOpen(true);
      
      toast({
        title: "Sucesso",
        description: "Cliente criado! Agora configure a mensalidade.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Erro ao criar cliente: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleSelectExistingClient = () => {
    if (selectedClientId) {
      setIsAddDialogOpen(false);
      setIsSubscriptionDialogOpen(true);
    }
  };

  const handleSubscriptionCreated = async (subscriptions: Omit<Subscription, "id" | "createdAt" | "updatedAt">[]) => {
    try {
      await addMultipleSubscriptions(subscriptions);
      setIsSubscriptionDialogOpen(false);
      setSelectedClientId("");
      
      toast({
        title: "Sucesso",
        description: `${subscriptions.length} mensalidades criadas com sucesso!`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Erro ao criar mensalidades: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
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
      <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mensalidades</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Gerencie todas as mensalidades e pagamentos dos clientes
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Adicionar Cliente + Mensalidade</span>
            <span className="sm:hidden">Adicionar</span>
          </Button>
        </div>
        <SubscriptionsTable
          subscriptions={subscriptionsWithClient as Subscription[]}
          showClientName={true}
          onEditSubscription={editSubscription}
          onDeleteSubscription={deleteSubscription}
          onMarkAsPaid={markAsPaid}
        />

        {/* Dialog para selecionar cliente ou criar novo */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Adicionar Cliente + Mensalidade</DialogTitle>
              <DialogDescription>
                Cadastre uma nova venda e configure a mensalidade recorrente do cliente
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Selecionar Cliente</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Escolha um cliente existente ou crie um novo
                </p>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente existente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client: Client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.fullName} - {client.companyName || "Sem empresa"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setIsNewClientDialogOpen(true);
                    }}
                  >
                    Novo Cliente
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSelectExistingClient}
                disabled={!selectedClientId}
              >
                Continuar com Cliente Selecionado
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para criar novo cliente */}
        <NewClientDialog
          open={isNewClientDialogOpen}
          onOpenChange={setIsNewClientDialogOpen}
          onSave={handleNewClient}
        />

        {/* Dialog para criar mensalidade */}
        <NewSubscriptionDialog
          open={isSubscriptionDialogOpen}
          onOpenChange={(open) => {
            setIsSubscriptionDialogOpen(open);
            if (!open) {
              setSelectedClientId("");
            }
          }}
          clientId={selectedClientId}
          onSave={handleSubscriptionCreated}
        />
      </div>
    </Layout>
  );
}

