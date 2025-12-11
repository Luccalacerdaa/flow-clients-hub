import { Layout } from "@/components/Layout";
import { ClientsTable } from "@/components/ClientsTable";
import { useClients } from "@/contexts/ClientsContext";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { clients, isLoading, addClient, editClient, deleteClient } = useClients();

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
      <div className="py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Gerencie todos os clientes da Flow Tech</p>
        </div>
        <ClientsTable
          clients={clients}
          onAddClient={addClient}
          onEditClient={editClient}
          onDeleteClient={deleteClient}
        />
      </div>
    </Layout>
  );
};

export default Index;
