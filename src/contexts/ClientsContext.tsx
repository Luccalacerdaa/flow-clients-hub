import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Client } from "@/types/client";
import { clientsService } from "@/services/clientsService";
import { toast } from "@/hooks/use-toast";

interface ClientsContextType {
  clients: Client[];
  isLoading: boolean;
  error: Error | null;
  addClient: (client: Omit<Client, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  editClient: (id: string, clientData: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  refetch: () => void;
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined);

export function ClientsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Buscar todos os clientes
  const {
    data: clients = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsService.getAll(),
  });

  // Mutação para criar cliente
  const createMutation = useMutation({
    mutationFn: (client: Omit<Client, "id" | "createdAt" | "updatedAt">) =>
      clientsService.create(client),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: "Sucesso",
        description: "Cliente criado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar cliente: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutação para atualizar cliente
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) =>
      clientsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client", variables.id] });
      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar cliente: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutação para deletar cliente
  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientsService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.removeQueries({ queryKey: ["client", id] });
      toast({
        title: "Sucesso",
        description: "Cliente removido com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Erro ao remover cliente: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const addClient = async (client: Omit<Client, "id" | "createdAt" | "updatedAt">) => {
    await createMutation.mutateAsync(client);
  };

  const editClient = async (id: string, clientData: Partial<Client>) => {
    await updateMutation.mutateAsync({ id, data: clientData });
  };

  const deleteClient = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <ClientsContext.Provider
      value={{
        clients,
        isLoading,
        error: error as Error | null,
        addClient,
        editClient,
        deleteClient,
        refetch,
      }}
    >
      {children}
    </ClientsContext.Provider>
  );
}

export function useClients() {
  const context = useContext(ClientsContext);
  if (context === undefined) {
    throw new Error("useClients must be used within a ClientsProvider");
  }
  return context;
}

